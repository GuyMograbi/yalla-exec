const {describe, it, beforeEach} = global
const through2 = require('through2')
const yalla = require('../yalla')
const expect = require('chai').expect

describe('yalla', function () {
  let output = ''
  let stdout = null

  beforeEach(() => {
    stdout = through2(function (chunk, enc, callback) {
      output += chunk.toString()
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
})
