module.exports = {
  cmd: (ctx) => {
    setImmediate(() => ctx.stop());
    return "Exiting...";
  },
  help: "exit                       - close the console"
};
