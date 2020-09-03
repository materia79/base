mp.events.add("crun", (code) => {
  code = code.replace(/"/gi, "\"").replace(/'/gi, "\'").replace(/`/gi, "\`");

  mp.log("\r[crun] " + code);

  try {
    let f = new Function(`let _f=function() { ` + code + ` }; let _res=_f(); mp.log("Result: ".concat(typeof _res == "object" ? JSON.stringify(_res) : _res));`);
    //let result = f();
    /* DO NOT! mp.gui.chat.push(result); DO NOT! */
    f();
  } catch (error) {
    mp.log("[crun] Error in clientside script: " + error.stack);
    return;
  }
});
