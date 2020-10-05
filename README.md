# Yalla-Exec

[![Build Status](https://travis-ci.org/GuyMograbi/yalla-exec.svg?branch=master)](https://travis-ci.org/GuyMograbi/yalla-exec)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)
[![npm version](https://badge.fury.io/js/yalla-exec.svg)](https://badge.fury.io/js/yalla-exec)


> Manage commands alongside environment variables. Use configuration file.

# Instructions

Install using

```bash
npm install -g yalla-exec
```

Create a file named `.yalla`.

Add configuration such as

```javascript
module.exports = {
  demo : {
    cmd: 'echo hello ${YALLA_USERNAME}',
    env: {
      YALLA_USERNAME: 'YALLA!!'
    }
  }
}
```

Run command

```bash
yalla demo
```

You should see this output

```bash
hello YALLA!
```

# Other configurations

Yalla also supports configuration in `yaml`, `json` and inside `package.json`

For `yaml` and `json` the filename should still be `.yalla`

Example - yaml

```yaml
demo:
  cmd: 'echo hello'
```

Exmple - json

```json
{
  "demo":{
    "cmd": "echo hello"
  }
}
```

and inside `pakcage.json` simply add a `yalla` property

```json
{
  "name": "my-module",
  "version" : "0.0.0",
  "dependencies": {},
  "yalla": {
    "demo": {
      "cmd": "echo hello"
    }
  }
}
```

__another option__: directory `.yalla` - expected to only contain configuration files


# List all commands

To get a list of all possible commands in the configuration you can simply run `yalla` in the command line


```bash
> yalla
demo
```

# Passing flags from outside

Yalla uses minimist and lodash template to allow you to pass flags from outside

So for example the following definition

```yaml
start:
  cmd: <%= argv.watch ? 'nodemon' : 'node' %> server.js
```

Allows you to pass the flag `watch` and run `nodemon server.js` instead of `node server.js`

The syntax `<%= argv.watch %>` is from [lodash's template mechanism](https://lodash.com/docs/4.17.4#template) and the reference to `argv` and its structure is from [minimist library syntax](https://github.com/substack/minimist)

Yalla exposes minimist's arguments on the variable `argv` for the template.

This combination allows you to easily declare different variations to your commands. It also allows defining lists and complex objects from your command line.

```
yalla --config.db_url="..." --config.cors_regex="..."
```

Will result in argv.config = { db_url: '...' , cors_regex: '...'}

# FAQ

## Where are my colors?

> When I run the command directly - I see colors, but with yalla the colors are gone..
Why is that?

Answer

The reason this happens is some libraries auto-detect if the terminal (yalla in this case) supports color.
To force colors, just add environment variable `export FORCE_COLOR=1`

See relevant thread: https://github.com/Marak/colors.js/issues/127

# Changelist

 * October 4 2020 - add support for directories.

# Roadmap
 - [X] support directories
 - [X] support object values for environment variables
 - [X] support JSON & Yaml configurations
 - [X] support passing flags from outside and declaring required/optional flags (especially for debug)
 - [X] make it a legit npm library. with github links, automated testing on a CI and license.
 - [X] support yalla files in parent directories
 - [X] support alternative working directories for commands

 - [ ] support 'watch' ability
 - [ ] support running multiple commands
     - so just an array of of commands should be enough.. we can silence the output with > /dev/null
