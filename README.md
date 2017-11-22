# Yalla-Exec

> Manage commands alongside environment variables. Use configuration file.

# Instructions

Install using

```
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

# Roadmap

 - [X] support object values for environment variables
 - [X] support JSON & Yaml configurations
 - [ ] support passing flags from outside and declaring required/optional flags (especially for debug)
     - maybe flags should be mapped to environment variables overrides that will be injected into the command?
 - [ ] support running multiple commands 
     - so just an array of of commands should be enough.. we can silence the output with > /dev/null 
 - [ ] make it a legit npm library. with github links, automated testing on a CI and license. 

