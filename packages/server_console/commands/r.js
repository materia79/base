module.exports = {
  cmd: (args) => {
    args.shift();
    if (args.length < 1) return "Usage: `r <serverside code>`";
    let commandLine = args.join(" ");
    
    try {
      let f = new Function(commandLine);
      let result = f();
      return typeof result != "undefined" ? "[Run] return value: ".concat(result) : undefined;
    } catch (error) {
      console.log("[Run] " + error);
      return;
    }
  },
  help: `    r <server side code>      - run serverside code\n`
}
