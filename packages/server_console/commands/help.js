module.exports = {
  cmd: (ctx) => {
    if (!ctx.tty.help || ctx.tty.help.length === 0) {
      return "No commands loaded.";
    }

    return `Built-in commands:\n${ctx.tty.help}`;
  },
  help: "help                       - show this"
};
