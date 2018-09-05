const {describe, it, beforeEach} = global
const through2 = require('through2')
const yalla = require('../yalla')
const expect = require('chai').expect
const path = require('path')

describe('yalla', function () {
  let output = ''
  let stdout = null

  beforeEach(() => {
    stdout = through2(function (chunk, enc, callback) {
      output += chunk.toString()
      callback()
    })
    output = '' // empty output
  })

  it('should run commands', function () {
    return yalla.exec({demo: {cmd: 'echo hello world'}}, ['demo'], {stdout}).then(() => {
      expect(output).to.eq('hello world\n')
    })
  })

  it('should add environment variables', function () {
    return yalla.exec({demo: {cmd: 'echo hello ${YALLA_USERNAME}', env: {'YALLA_USERNAME': 'YALLA!'}}}, ['demo'], {stdout}).then(() => {
      expect(output).to.eq('hello YALLA!\n')
    })
  })

  it('should support lodash template a minimist arguments', function () {
    return yalla.exec({demo: {cmd: 'echo <%= argv.greeting %> World!'}}, ['demo', '--greeting=wussssssuuup'], {stdout}).then(() => {
      expect(output).to.eq('wussssssuuup World!\n')
    })
  })

  it('should list all commands if no command is given', function () {
    return yalla.exec({foo: {cmd: 'echo hello', configfile: '.yalla'}}, [], {stdout}).then(() => {
      expect(output).to.eq('.yalla\n\tfoogeneral built in commands\n\tprint [command]\n\tprint-env [command]\n\t<leave empty>')
    })
  })

  describe('loading configuration', function () {
    it('should handle js', function () {
      expect(yalla.getYallaConfiguration(path.join(__dirname, 'resources/yalla-conf.js')).demo.cmd).to.eq('echo hello', 'js configuration should work')
      expect(yalla.getYallaConfiguration(path.join(__dirname, 'resources/yalla-conf.yaml')).demo.cmd).to.eq('echo hello', 'yaml configuration should work')
    })
  })
})
