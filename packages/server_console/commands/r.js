module.exports = {
  cmd: (args) => {
    args.shift();
    if (args.length < 1) return "Usage: `r <serverside code>`";
    let commandLine = args.join(" ");
    
    try {
      let f = new Function(commandLine);
      let result = f();
      return "Return value: ".concat(result);
    } catch (error) {
      console.log("[Run] Error in serverside script: " + error.stack);
      return;
    }
  },
  help: `    r <server side code>      - run serverside code\n`
}
