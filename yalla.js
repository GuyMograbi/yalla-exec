#!/usr/bin/env node
const path = require('path')

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

    if (!conf.hasOwnProperty(command)) {
      console.error('command [' + command + '] not in .yalla file')
      process.exit(1)
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

if (!module.parent) {
  const YAML = require('yamljs')
  exports.exec(YAML.load(path.join(process.cwd(), '.yalla')), process.argv.slice(2)).then((code) => {
    process.exit(code)
  })
}
