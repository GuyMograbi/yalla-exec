# Yalla

> Manage commands alongside environment variables. Use configuration file.

# Instructions

Install using

```
npm install -g yalla
```

Create a file named `.yalla`.

Add configuration such as

```
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

```
yalla demo
```

You should see this output

```
hello YALLA!
```

# Roadmap

 - [ ] support JSON & Yaml configurations
