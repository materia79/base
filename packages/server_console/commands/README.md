## Command template:

Save this:

```js
module.exports = {
  cmd: (args) => {
    // Here your command code
    return "Example result.";
  },
  help: `    <command_name> <options>  - description\n`
}
```

to `packages/server_console/commands/<command_name>.js`.

# Note: 

- `cmd` should return the command result.
- `help` can be multiple lines.
