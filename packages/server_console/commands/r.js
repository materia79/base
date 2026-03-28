// Helper functions for debugging via this command go here.
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const
  getAsyncScript = (script) => {
    return `
(async () => {
  try {
    let _f = async function() { ` + script + ` };
    let _res = await _f();
    console.log("[run(async)] Result: ".concat(typeof _res == "object" ? JSON.stringify(_res) : _res));
  } catch (error) {
    console.log("[run(async)] Error in clientside script: " + error);
  }
})();`;
  },
  getScript = (script) => {
    return `
(() => {
  try {
    let _f=function() { ` + script + ` };
    let _res=_f();
    console.log("[run] Result: ".concat(typeof _res == "object" ? JSON.stringify(_res) : _res));
  } catch (error) {
    console.log("[run] Error in script: " + error);
  }
})();`;
  };

module.exports = {
  cmd: (ctx, args) => {
    args.shift();
    if (args.length < 1) return "Usage: r <serverside code>";
    const
      code = args.join(" "),
      isAsync = code.indexOf("await") >= 0;

    if (isAsync) {
      eval(getAsyncScript(code));
    } else {
      eval(getScript(code));
    }

    return "Script executed.";
  },
  help: "r <server side code>       - run serverside code (supports async await)",
  group: "Developer"
};
