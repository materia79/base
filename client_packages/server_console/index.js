const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor,
  getAsyncScript = (script) => {
    return `
(async () => {
  try {
    let _f=async function() { ` + script + ` };
    let _res=await _f();
    await mp.game.waitAsync(500);
    mp.log("[crun(async)] Result: ".concat(typeof _res == "object" ? JSON.stringify(_res) : _res));
  } catch (error) {
    await mp.game.waitAsync(500);
    mp.log("[crun(async)] Error in clientside script: " + error);
  }
})();`;
  },
  getScript = (script) => {
    return `
(() => {
  try {
    let _f=function() { ` + script + ` };
    let _res=_f();
    mp.log("[crun] Result: ".concat(typeof _res == "object" ? JSON.stringify(_res) : _res));
  } catch (error) {
    mp.log("[crun] Error in clientside script: " + error);
  }
})();`;
  };

mp.events.add("crun", async (code) => {
  code = code.replace(/"/gi, "\"").replace(/'/gi, "\'").replace(/`/gi, "\`");
  const isAsync = code.indexOf("await") >= 0;
  mp.log("[crun" + (isAsync ? "(async)" : "") + "] " + code);

  if (isAsync) {
    const evalFunc = new AsyncFunction('a', getAsyncScript(code));
    await evalFunc();
  } else {
    const evalFunc = new Function(getScript(code));
    evalFunc();
  }
});
