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

# Roadmap

 - [X] support object values for environment variables
 - [X] support JSON & Yaml configurations
 - [X] support passing flags from outside and declaring required/optional flags (especially for debug)
 - [ ] support 'watch' ability
 - [ ] support running multiple commands
     - so just an array of of commands should be enough.. we can silence the output with > /dev/null
 - [ ] make it a legit npm library. with github links, automated testing on a CI and license.
