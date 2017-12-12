#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const _ = require('lodash')

/**
 * @typedef {Object} YallaItem
 * @property {string} cmd the command
 * @property {Object.<string, *>} env the environment variables to override. supports any kind of value type. on objects uses JSON.stringify
 **/

/**
 * @param {Object.<string, YallaItem>} conf - a map between commands and their info
 * @param {string[]} command
 * @param {object=} opts
 * @param [stream=process.stdout] opts.stdout
 * @param [stream=process.stderr] opts.stderr
 **/
exports.exec = function (conf, command, opts) {
  const argv = require('minimist')(command)
  opts = _.merge({}, {stdout: process.stdout, stderr: process.stderr}, opts)
  return new Promise((resolve) => {
    const command = _.first(argv._)
    if (_.isEmpty(command)) {
      listCommands(conf, opts.stdout)
      resolve(1)
      return
    }
    if (!conf.hasOwnProperty(command)) {
      console.error('command [' + command + '] not in .yalla file')
      resolve(1)
      return
    }

    const spawnCommand = _.template(conf[command].cmd, {interpolate: /<%=([\s\S]+?)%>/g})({argv})

    const spawnEnv = Object.assign({}, process.env, conf[command].env)

    _.each(spawnEnv, (value, key) => { // support objects in json
      if (_.isObject(value)) {
        spawnEnv[key] = JSON.stringify(value)
      }
    })

    const { exec } = require('child_process')
    const child = exec(spawnCommand, {env: spawnEnv, stdio: 'inherit'})
    child.stdout.pipe(opts.stdout)
    child.stderr.pipe(opts.stderr)
    child.on('close', (code) => {
      resolve(code)
    })
  })
}

const errors = []

function getYallaYamlConfig (filepath) { // also handles json as json is a valid yaml
  try {
    const YAML = require('yamljs')
    return YAML.load(filepath)
  } catch (e) {
    errors.push(e)
    return null
  }
}

function getYallaJsConfig (filepath) {
  try {
    return require(filepath)
  } catch (e) {
    errors.push(e)
    return null
  }
}

function getJsonConfig (filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath))
  } catch (e) {
    errors.push(e)
    return null
  }
}

function getPackageJsonConfig () {
  try {
    return require(path.join(process.cwd(), './package.json')).yalla
  } catch (e) {
    errors.push(e)
    return null
  }
}

function listCommands (conf, stdout) {
  Object.keys(conf).forEach((c) => stdout.write(c + '\n'))
}

exports.getYallaConfiguration = function (filepath) {
  const config = getYallaYamlConfig(filepath) || getYallaJsConfig(filepath) || getJsonConfig(filepath) || getPackageJsonConfig(filepath)

  if (config === null) {
    console.error('unable to load configuration in yaml or js', errors)
    process.exit(1)
  }
  return config
}

if (!module.parent) {
  exports.exec(exports.getYallaConfiguration(path.join(process.cwd(), '.yalla')), process.argv.slice(2)).then((code) => {
    process.exit(code)
  })
}
