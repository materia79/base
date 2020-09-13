module.exports = {
  cmd: (args) => {
    args.shift();
    if (args.length < 1) return "Usage: `r <serverside code>`";
    let commandLine = args.join(" ");
    let f = new Function(commandLine);
    let result = f();
    return "Return value: ".concat(result);
  },
  help: `    r <server side code>      - run serverside code\n`
}
