## Command template:

Save this to `commands/<command name>.js`:

```js
module.exports = {
  cmd: (args) => {
    // Here your command code
    return "Example result.";
  },
  help: `    <command name> <options>  - description\n`
}
```

# Note: 

- `cmd` should return the command result.
- `help` can be multiple lines.
