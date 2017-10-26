#!/usr/bin/env node
const path = require('path');
const conf = require(path.join(process.cwd(),'.yalla'))
const [command, ...args] = process.argv.slice(2);

if (!conf.hasOwnProperty(command)){
  console.error('command [' + command + '] not in .yallarc file');
  process.exit(1);
}

const spawnCommand = conf[command].cmd;
const spawnEnv = Object.assign({}, process.env, conf[command].env);

const { exec } = require('child_process');
const child = exec(spawnCommand, {env: spawnEnv, stdio: 'inherit'});
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
child.on('close', (code) => {
  process.exit(code);
});
