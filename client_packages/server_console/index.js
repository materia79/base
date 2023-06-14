const
  esc = `\x1b`,
  sgr = (...args) => `${esc}[${args.join(';')}m`,
  sgrRgbFg = (...args) => sgr(`38;2;${args.join(';')}`),
  sgrRgbBg = (...args) => sgr(`48;2;${args.join(';')}`);

mp.tty = {
  sgrRgbFg: sgrRgbFg,
  sgrRgbBg: sgrRgbBg,
  normal: sgr(0),
  red: sgrRgbFg(192, 0, 0),
  yellow: sgrRgbFg(192, 192, 0),
  YELLOW: sgrRgbBg(192, 192, 0),
  black: sgrRgbFg(0, 0, 0),
  BLACK: sgrRgbBg(0, 0, 0),
  green: sgrRgbFg(0, 192, 0),
  grey: sgrRgbFg(192, 192, 192),
  GREY: sgrRgbBg(192, 192, 192),
  MARINA: sgrRgbBg(32, 64, 128),
  white: sgrRgbFg(255, 255, 255),
  WARNING: sgrRgbBg(192, 0, 0) + sgrRgbFg(0, 0, 0)
};

const
  AsyncFunction = Object.getPrototypeOf(async function () { }).constructor,
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
    //const evalFunc = new AsyncFunction('a', getAsyncScript(code));
    eval(getAsyncScript(code));
    //await evalFunc();
  } else {
    //const evalFunc = new Function(getScript(code));
    eval(getScript(code));
    //evalFunc();
  }
});
