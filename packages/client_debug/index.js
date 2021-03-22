const resourceLoadedLength = ('" loaded').length;
const {
  inspect
} = require('util');
const {
  appendFile
} = require("fs");
const esc = `\x1b`;
const sgr = (...args) => `${esc}[${args.join(';')}m`;
const sgrRgbFg = (...args) => sgr(`38;2;${args.join(';')}`);
const sgrRgbBg = (...args) => sgr(`48;2;${args.join(';')}`);
const normal = sgr(0); //sgrRgbFg(192, 192, 192) + sgrRgbBg(0, 0, 0);
const bgBlack = sgrRgbBg(0, 0, 0);
const fgGrey = sgrRgbFg(192, 192, 192);
const clientDebugColor = sgrRgbFg(192, 64, 64);

mp.log = {
  messagesPerSecondUpdate: Date.now(),
  messagesPerSecond: 0,
  lastResourceLoaded: false,
  lastResourceName: false,
  manager: null
};
class Logger {
  constructor() {
    this.inject()
  }

  _log(message) {
    const now = new Date();
    let timestamp = ""
      .concat(now.getUTCFullYear())
      .concat("-")
      .concat((now.getUTCMonth() < 9 ? "0" + (now.getUTCMonth() + 1) : (now.getUTCMonth() + 1)))
      .concat("-")
      .concat((now.getUTCDate() < 10 ? "0" + now.getUTCDate() : now.getUTCDate()))
      .concat(" ")
      .concat((now.getUTCHours() < 10 ? "0" + now.getUTCHours() : now.getUTCHours()))
      .concat(":")
      .concat((now.getUTCMinutes() < 10 ? "0" + now.getUTCMinutes() : now.getUTCMinutes()))
      .concat(":")
      .concat((now.getUTCSeconds() < 10 ? "0" + now.getUTCSeconds() : now.getUTCSeconds()))
      .concat(" (")
      .concat(((now.getTime() - mp.events.serverStartupTime) / 10 / 100).toFixed(2))
      .concat(") ");
    mp.log.messagesPerSecond += 1;
    if (mp.log.messagesPerSecondUpdate + 1000 < Date.now()) {
      mp.log.messagesPerSecondUpdate = Date.now();
      mp.log.messagesPerSecond = Math.ceil(mp.log.messagesPerSecond / 2)
    };
    if (mp.log.messagesPerSecond < 500) {
      appendFile("server.log", timestamp + " " + message + "\n", function (error) {
        if (error) return console._original.log("[LOG] server.log error! " + error);
      });
      console._original.log("\r" + timestamp + " " + message)
    }
    //console._original.log("\r("+messagesPerSecond+") " + timestamp + " " + message)
  }

  log(message) {
    if (mp.events.delayInitialization && Array.from(message)[0].length && Array.from(message)[0].includes('loaded')) {
      const thisResourceName = message.slice(2, message.length - resourceLoadedLength);
      if (!mp.log.lastResourceName) {
        mp.log.lastResourceName = thisResourceName;
        mp.log.lastResourceLoaded = new Date().getTime();
      } else {
        /*
        message = ("Loaded ").concat(mp.log.lastResourceName, " in ", (new Date().getTime() - (mp.log.lastResourceLoaded ? mp.log.lastResourceLoaded : mp.events.serverStartupTime)), "ms.");
        mp.log.lastResourceName = thisResourceName;
        mp.log.lastResourceLoaded = new Date().getTime();
        */
      }
      return false;
    }
    this._log(`${normal}${message}`);
  }

  info(message) {
    this._log(`${sgrRgbFg(0, 255, 0)}[INFO] ${normal}${message}`)
  }

  warn(message) {
    this._log(`${sgrRgbFg(227, 145, 23)}[WARNING] ${normal}${message}`)
  }

  severe(message) {
    this._log(`${sgrRgbFg(204, 45, 45)}[ERROR] ${normal}${message}`)
  }

  debug(message) {
    this.info(inspect(message))
  }

  inject() {
    if (console._original) {
      return 'Logger already injected!'
    }

    let original = {
      log: console.log,
      info: console.info,
      error: console.error,
      debug: console.debug
    }

    console._original = original

    console.log = this._wrap(this.log)
    console.info = this._wrap(this.info);
    console.error = this._wrap(this.severe);
    console.warn = this._wrap(this.warn)
    console.debug = this._wrap(this.debug)

    console.info("[init] Writing console.log to ./server.log");
  }

  _wrap(func) {
    const self = this
    return function () {
      func.call(self, Array.from(arguments))
    }
  }
}

mp.log.manager = new Logger();
mp.events.add("log", (player, text) => console.log(normal.concat("[", bgBlack, player.name, fgGrey, "(", player.id, ")", normal, "] ", clientDebugColor, text, normal)));
