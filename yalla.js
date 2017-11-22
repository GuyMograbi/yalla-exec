#!/usr/bin/env node
const path = require('path');
const YAML = require('yamljs');
const conf = YAML.load(path.join(process.cwd(),'.yalla'))
const _ = require('lodash');

const argv = require('minimist')(process.argv.slice(2));
const command = _.first(argv._);


if (!conf.hasOwnProperty(command)){
  console.error('command [' + command + '] not in .yalla file');
  process.exit(1);
}

const spawnCommand = _.template(conf[command].cmd, {interpolate: /<%=([\s\S]+?)%>/g})({argv});

const spawnEnv = Object.assign({}, process.env, conf[command].env);

_.each(spawnEnv, (value, key)=>{ // support objects in json
  if (_.isObject(value)){
    spawnEnv[key] = JSON.stringify(value);
  }
})

const { exec } = require('child_process');
const child = exec(spawnCommand, {env: spawnEnv, stdio: 'inherit'});
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
child.on('close', (code) => {
  process.exit(code);
});
