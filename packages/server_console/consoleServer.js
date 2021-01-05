const fs = require("fs");
const os = require("os");

// Init readline
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.historySize = 1000;

rl.on('line', (command) => {
  if (command == "") return;
  console.log("Command: " + command);
  let res = mp.tty.parseCommand(command);
  if (typeof res != "undefined" && res != "") console.log(res);
  mp.tty.drawConsole();
  fs.writeFileSync(".consoleHistory", JSON.stringify(rl.history));
});

// Init console history
if (fs.existsSync(".consoleHistory")) {
  try {
    rl.history = JSON.parse(fs.readFileSync(".consoleHistory"));
  } catch (error) {
    console.log("Error parsing console history: " + error.stack);
    rl.history = [];
  }
} else {
  fs.writeFileSync(".consoleHistory", JSON.stringify(rl.history));
}

// Init mp.tty
let lastCursorPos;
let lastMeasureCPU = {};
let window_width = process.stdout.columns;
let window_height = process.stdout.rows;
let whiteSpace = " ";

const sgr = (...args) => `\x1b[${args.join(';')}m`;
const sgrRgbFg = (...args) => sgr(`38;2;${args.join(';')}`);
const sgrRgbBg = (...args) => sgr(`48;2;${args.join(';')}`);

mp.tty = {
  updateInterval: 999,
  esc: `\x1b`,
  sgrRgbFg: sgrRgbFg,
  sgrRgbBg: sgrRgbBg,
  delimiter: (" ").concat(sgrRgbFg(255, 0, 0), "::", sgrRgbFg(0, 0, 0), " "),
  oneMiB: 1024 * 1024,
  slashRotate: { "1": "/", "2": "-", "3": "\\", "4": "|" },
  slashState: 1,
  chatFocus: 0,
  drawConsole: () => {
    window_width = process.stdout.columns;
    window_height = process.stdout.rows;
    lastCursorPos = rl._getCursorPos().cols;
    mp.tty.uptime = Math.floor(process.uptime() / 36) / 100;
    if (mp.tty.uptime >= 24) {
      mp.tty.uptime = (Math.floor(mp.tty.uptime / 0.24) / 100).toString().concat("d");
    } else {
      mp.tty.uptime += "h";
    }
    readline.moveCursor(rl.output, -window_width, -window_height);
    process.stdout.write(mp.tty.normal.concat(whiteSpace.repeat(window_width), "\n"));
    readline.moveCursor(rl.output, 0, -1);
    // Print title line
    process.stdout.write(mp.tty.getConsoleTitle().concat("\n"));
    readline.moveCursor(rl.output, lastCursorPos, window_height - 1);
    mp.tty.slashState = (mp.tty.slashState == 4 ? 1 : mp.tty.slashState + 1);
  },
  cpuAverage: () => {
    // Initialize sum of idle and time of cores and fetch CPU info
    var totalIdle = 0,
      totalTick = 0;
    var cpus = os.cpus();
    if (!cpus) return {
      idle: 1,
      total: 1
    };

    // Loop through CPU cores
    for (var i = 0, len = cpus.length; i < len; i++) {

      // Select CPU core
      var cpu = cpus[i];

      // Total up the time in the cores tick
      for (type in cpu.times) {
        totalTick += cpu.times[type];
      }

      // Total up the idle time of the core
      totalIdle += cpu.times.idle;
    }

    //Return the average Idle and Tick times
    return {
      idle: totalIdle / cpus.length,
      total: totalTick / cpus.length
    };
  },
  getCPUUsage: function () {
    let lastStart = lastMeasureCPU;
    let endMeasure = mp.tty.cpuAverage();
    lastMeasureCPU = mp.tty.cpuAverage();
    return 100 - ~~(100 * (endMeasure.idle - lastStart.idle) / (endMeasure.total - lastStart.total));
  },
  getMemUsage: function () {
    var mem = process.memoryUsage();
    if (mem) return Math.floor((mem.heapUsed / mp.tty.oneMiB) * 100) / 100 + " MiB";
    else return "unk";
  },
  getConsoleTitle: () => { return ""; },
  consoleTitleFuncs: [
    `"[", mp.tty.slashRotate[mp.tty.slashState], "] "`,
    `mp.config.name`,
    `mp.players.length, (mp.players.length != 1 ? " players" : " player")`,
    `mp.vehicles.length, " vehicles"`
  ],
  addConsoleTitle: (codeExpression) => {
    let result = `return mp.tty.consoleTitleBgColor.concat(mp.tty.consoleTitleFgColor`;
    let i = 0;
    mp.tty.consoleTitleFuncs.push(codeExpression);
    mp.tty.consoleTitleFuncs.forEach((titleFunc) => {
      result = result.concat((i < 2 ? `, ` : `, mp.tty.delimiter,`), titleFunc);
      i += 1;
    });
    result = result.concat(`, mp.tty.delimiter,"uptime ", (mp.tty.uptime), mp.tty.delimiter, "CPU: ", mp.tty.getCPUUsage(), " %", mp.tty.delimiter, "Mem: ", mp.tty.getMemUsage(), " ", mp.tty.normal);`);
    mp.tty.getConsoleTitle = new Function(result);
  },
  commands: {},
  help: `Available commands:\n`,
  init: () => {
    // Load commands
    fs.readdirSync(__dirname + "/commands").filter(fn => fn.endsWith(".js")).forEach((filename) => {
      let commandModule = require("./commands/" + filename);
      mp.tty.commands[filename.slice(0, -3)] = commandModule.cmd;
      mp.tty.help += (typeof commandModule.help != "undefined" ? commandModule.help : ``);
      //console.log("Loaded command `" + filename.slice(0, -3) + "`");
    });

    // Generate initial console title
    let result = `return mp.tty.consoleTitleBgColor.concat(mp.tty.consoleTitleFgColor`;
    let i = 0;
    mp.tty.consoleTitleFuncs.forEach((titleFunc) => {
      result = result.concat((i < 2 ? `, ` : `, mp.tty.delimiter,`), titleFunc);
      i += 1;
    });
    result = result.concat(`, mp.tty.delimiter,"uptime ", (mp.tty.uptime), mp.tty.delimiter, "CPU: ", mp.tty.getCPUUsage(), " %", mp.tty.delimiter, "Mem: ", mp.tty.getMemUsage(), " ", mp.tty.normal);`);
    mp.tty.getConsoleTitle = new Function(result);
  },
  parseCommand: (s) => {
    let args = s.split(" ");
    let cmd = args[0].toLowerCase();

    window_width = process.stdout.columns;
    window_height = process.stdout.rows;

    if (mp.tty.commands[cmd]) return mp.tty.commands[cmd](args);
    return "Unknown command `" + cmd + "` Try `help`.";
  },
  consoleTitleFgColor: sgrRgbFg(0, 0, 0),
  consoleTitleBgColor: sgrRgbBg(192, 192, 192),
  rgb: sgrRgbFg,
  RGB: sgrRgbBg,
  normal: sgr(0), //sgrRgbFg(192, 192, 192).concat(sgrRgbBg(0, 0, 0)),
  red: sgrRgbFg(192, 0, 0),
  yellow: sgrRgbFg(192, 192, 0),
  black: sgrRgbFg(0, 0, 0),
  green: sgrRgbFg(0, 192, 0),
  grey: sgrRgbFg(192, 192, 192),
  white: sgrRgbFg(255, 255, 255),
  BLACK: sgrRgbBg(0, 0, 0),
  GREY: sgrRgbBg(192, 192, 192),
  MARINA: sgrRgbBg(32, 64, 128),
  WARNING: sgrRgbBg(192, 0, 0).concat(sgrRgbFg(0, 0, 0)),
  _black: sgrRgbFg(0, 0, 0),
  _BLACK: sgrRgbBg(0, 0, 0),
  _GREY: sgrRgbBg(192, 192, 192),
  _green: sgrRgbFg(0, 192, 0),
  _grey: sgrRgbFg(192, 192, 192),
};

// Load serverside console commands
mp.tty.init();

// Start updating info row
setInterval(mp.tty.drawConsole, mp.tty.updateInterval);
