# Command System

The console loads every `.js` file in this directory as a command module.

- Command name: filename without `.js` (for example, `help.js` -> `help`)
- Syntax: plain commands only (`help`, `toggle title`, `r return 1+1`)
- Async support: command handlers can be sync or async

## Command module shape

```js
module.exports = {
  cmd: (ctx, args, rawLine) => {
    // run logic and return string/number/undefined
  },
  help: "name and short description"
};
```

## Handler arguments

- `ctx`: runtime context
- `args`: tokenized command parts (space split)
- `rawLine`: original input line

Useful `ctx` fields:

- `ctx.tty`: public tty compatibility object
- `ctx.state`: internal runtime state
- `ctx.writeLog(message)`: append to buffer
- `ctx.setTitleEnabled(bool, persist)`: toggle title
- `ctx.setWrapEnabled(bool, persist)`: toggle word-wrap
- `ctx.setTimestampsEnabled(bool, persist)`: toggle UTC log timestamps
- `ctx.setAfkEnabled(bool, persist)`: toggle AFK timeout detection
- `ctx.setVariable(name, value, persist)`: set/create `variabled.<name>`
- `ctx.unsetVariable(name, persist)`: remove `variabled.<name>`
- `ctx.saveConfig()`: write current state to `console_config.json`
- `ctx.saveHistory()`: write current command history to `console_history.json`
- `ctx.stop()`: stop the console process

## Built-ins currently provided

- `help`: shows built-in command list
- `toggle title`: toggles title rendering and persists state
- `toggle wrap`: toggles word-wrap and persists state
- `toggle timestamps`: toggles UTC log timestamps and persists state
- `toggle afk`: toggles AFK timeout detection and persists state
- `set <variable> <value>`: sets/creates persistent value in `variabled`
- `unset <variable>`: removes persistent value from `variabled`
- `get`: lists all values in `variabled`
- `get <variable name filter>`: filters variables by name (contains, case-insensitive)
- `mandelbrot [options]`: draws Mandelbrot sized to visible buffer viewport (`--color` for ANSI theme)
- `r <server side code>`: evaluates code
- `exit`: closes the console

## Notes

- `help` output is generated from each module's `help` string.
- `toggle` writes persistent state into `console_config.json` at project root.
- Submitted input history is persisted to `console_history.json` (newest 1000 entries).
- Unknown commands return: `Unknown command <name>. Try help.`