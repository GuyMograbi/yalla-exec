#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const _ = require('lodash')

function getVersion () {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'))).version
}
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
    const target = _.first(_.slice(argv._, 1))
    if (_.isEmpty(command)) {
      if (argv.version) {
        console.log(getVersion())
        process.exit(0)
      }
      listCommands(conf, opts.stdout)
      resolve(1)
      return
    }
    if (!conf.hasOwnProperty(command) && !target) {
      console.error('command [' + command + '] not in .yalla file')
      resolve(1)
      return
    }

    if (target && !conf.hasOwnProperty(target)) {
      console.error('command [' + target + '] not in .yalla file')
      resolve(1)
      return
    }
    const config = conf[command]
    const compileCommand = (command) => _.template(command, {interpolate: /<%=([\s\S]+?)%>/g})({argv})
    if (command === 'print' && !!target) {
      console.log(JSON.stringify(conf[target], {}, 2))
      console.log(compileCommand(conf[target].cmd))
      process.exit(0)
    }

    if (command === 'print-env' && !!target) {
      const targetEnv = conf[target].env || {}
      const envOutput = Object.keys(targetEnv).map(k => `export ${k}=${JSON.stringify(targetEnv[k])}`).join('\n')
      console.log(envOutput)
      process.exit(0)
    }

    const spawnCommand = compileCommand(conf[command].cmd)

    const spawnEnv = Object.assign({}, process.env, config.env)

    _.each(spawnEnv, (value, key) => { // support objects in json
      if (_.isObject(value)) {
        spawnEnv[key] = JSON.stringify(value)
      }
    })

    const { exec } = require('child_process')
    if (argv.verbose) {
      console.log(spawnCommand)
    }
    function run () {
      const child = exec(spawnCommand, {maxBuffer: 104857600, cwd: config.cwd || process.cwd(), env: spawnEnv, stdio: 'inherit'})
      child.stdout.pipe(opts.stdout)
      child.stderr.pipe(opts.stderr)
      child.on('close', (code) => {
        if (config.keepUp) {
          console.log('keepUp flag is on. restarting failed process that exited with code [' + code + ']')
          run()
        } else {
          resolve(code)
        }
      })
    }
    if (config.keepUp) {
      console.log('keepUp flag is on')
    }
    run()
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
  // console.log(Object.keys(conf));
  _.mapValues(conf, (value, key) => {
    return Object.assign(value, {key})
  })

  const byDirname = _.groupBy(conf, 'configfile')

  const printCommands = (dir, commands) => {
    stdout.write('\n')
    stdout.write(commands.map(k => `${dir}\t${k.key}`).join('\n'))
    console.log('')
  }

  // console.log(Object.keys(byDirname['false']));
  Object.keys(byDirname).forEach((c) => {
    printCommands(c, byDirname[c])
  })
  printCommands('general built in commands', [{key: 'print [command]'}, {key: 'print-env [command]'}, {key: '<leave empty>'}])
}

exports.getYallaConfiguration = function (filepath) {
  const config = getYallaYamlConfig(filepath) || getYallaJsConfig(filepath) || getJsonConfig(filepath) || getPackageJsonConfig(filepath)

  if (config === null) {
    console.error('unable to load configuration in yaml or js', errors)
    process.exit(1)
  }
  return config || {}
}

function squashConfigFromFiles (files) {
  const config = {}
  _.each(files, (f) => {
    let fileConfig = null
    if (fs.lstatSync(f).isDirectory(f)) {
      fileConfig = squashConfigFromFiles(fs.readdirSync(f).map(i => path.join(f, i)))
    } else {
      fileConfig = exports.getYallaConfiguration(f)
      _.each(Object.keys(fileConfig), (key) => {
        const value = fileConfig[key]
        if (typeof value !== 'object') {
          console.error(`file [${f}] contains invalid definition [${key}]. value [${value}] should be an object`)
          process.exit(1)
        }
        if (value.cmd && !_.has(value, 'cwd')) {
          _.set(value, 'cwd', process.cwd())
        } else {
          _.set(value, 'cwd', value.cwd)
        }

        _.set(value, 'dirname', path.join(path.dirname(f)))

        _.set(value, 'configfile', f)
      })
    }
    _.merge(config, fileConfig)
  })
  debugger;
  return config
}

if (!module.parent) {
  const findAllUp = require('find-all-up')
  const files = findAllUp.sync('.yalla')
  const config = squashConfigFromFiles(files)
  exports.exec(config, process.argv.slice(2)).then((code) => {
    process.exit(code)
  })
}
