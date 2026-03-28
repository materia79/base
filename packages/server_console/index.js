//throw new Error("debug test error message.");
require("./tty/index.js");

// Init mp.tty
const { Console } = require("./tty/index.js");

const consoleRuntime = new Console({
  commandsDir: process.cwd() + "/packages/server_console/commands",
  titleEnabled: true,
  wordWrapEnabled: true
}).start();

mp.tty = consoleRuntime.tty;
mp.tty.console = consoleRuntime;

const tty = mp.tty;
const whiteSpace = " ";
tty.sgr = (...args) => `\x1b[${args.join(';')}m`;
tty.sgrRgbFg = (...args) => tty.sgr(`38;2;${args.join(';')}`);
tty.sgrRgbBg = (...args) => tty.sgr(`48;2;${args.join(';')}`);
tty.esc = `\x1b`;
// tty.delimiter = (" ").concat(tty.sgrRgbFg(255, 0, 0), "::", tty.sgrRgbFg(0, 0, 0), " ");
Object.assign(tty, {
  ws: whiteSpace,
  normal: tty.sgr(0),
  bright: tty.sgr(1),
  dim: tty.sgr(2),
  rgb: tty.sgrRgbFg,
  RGB: tty.sgrRgbBg,
  red: tty.sgrRgbFg(192, 0, 0),
  yellow: tty.sgrRgbFg(192, 192, 0),
  black: tty.sgrRgbFg(0, 0, 0),
  green: tty.sgrRgbFg(0, 192, 0),
  grey: tty.sgrRgbFg(192, 192, 192),
  white: tty.sgrRgbFg(255, 255, 255),
  BLACK: tty.sgrRgbBg(0, 0, 0),
  GREY: tty.sgrRgbBg(192, 192, 192),
  MARINA: tty.sgrRgbBg(32, 64, 128),
  WARNING: tty.sgrRgbBg(192, 0, 0).concat(tty.sgrRgbFg(0, 0, 0)),
  _black: tty.sgrRgbFg(0, 0, 0),
  _BLACK: tty.sgrRgbBg(0, 0, 0),
  _GREY: tty.sgrRgbBg(192, 192, 192),
  _green: tty.sgrRgbFg(0, 192, 0),
  _grey: tty.sgrRgbFg(192, 192, 192)
});