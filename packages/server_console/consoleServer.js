const
  fs = require("fs"),
  os = require("os"),
  readline = require('readline'),
  wait = (ms) => new Promise(resolve => setTimeout(resolve, ms||0));
const _write = process.stdout.write.bind(process.stdout);

// Init readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.historySize = 1000;

rl.on('line', (command) => {
  if (command == "") return;
  console.log("Command: " + command);
  let res = tty.parseCommand(command);
  if (typeof res != "undefined" && res != "") console.log(res);
  if (tty.interval) tty.drawConsole();
  fs.writeFileSync(".consoleHistory", JSON.stringify(rl.history));
});

rl.on('SIGINT', () => {
  process.exit();
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
const whiteSpace = " ";
const sgr = (...args) => `\x1b[${args.join(';')}m`;
const sgrRgbFg = (...args) => sgr(`38;2;${args.join(';')}`);
const sgrRgbBg = (...args) => sgr(`48;2;${args.join(';')}`);

const tty = mp.tty = {
  //blessed: blessed,
  lastCursorPos: 0,
  lastMeasureCPU: {},
  window_width: process.stdout.columns,
  window_height: process.stdout.rows,
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
    tty.window_width = process.stdout.columns;
    tty.window_height = process.stdout.rows;
    tty.lastCursorPos = rl._getCursorPos().cols;
    tty.uptime = Math.floor(process.uptime() / 36) / 100;
    if (tty.uptime >= 24) {
      tty.uptime = (Math.floor(tty.uptime / 0.24) / 100).toString().concat("d");
    } else {
      tty.uptime += "h";
    }
    readline.moveCursor(rl.output, -tty.window_width, -tty.window_height);
    _write(tty.normal.concat(whiteSpace.repeat(tty.window_width), "\n"));
    readline.moveCursor(rl.output, 0, -1);
    // Print title line
    _write(tty.getConsoleTitle().concat("\n"));
    readline.moveCursor(rl.output, tty.lastCursorPos, tty.window_height - 1);
    tty.slashState = (tty.slashState == 4 ? 1 : tty.slashState + 1);
  },
  cpuAverage: () => {
    // Initialize sum of idle and time of cores and fetch CPU info
    let
      totalIdle = 0,
      totalTick = 0;
    
    const cpus = os.cpus();
    
    if (!cpus) return { idle: 1, total: 1 };

    // Loop through CPU cores
    let i;
    for (i = 0, len = cpus.length; i < len; i++) {

      // Select CPU core
      const cpu = cpus[i];

      // Total up the time in the cores tick
      let type;
      for (type in cpu.times) 
        totalTick += cpu.times[type];

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
    const
      lastStart = tty.lastMeasureCPU,
      endMeasure = tty.cpuAverage();
    
    tty.lastMeasureCPU = tty.cpuAverage();
    return 100 - ~~(100 * (endMeasure.idle - lastStart.idle) / (endMeasure.total - lastStart.total));
  },
  getMemUsage: function () {
    const mem = process.memoryUsage();
    if (mem) return Math.floor((mem.heapUsed / tty.oneMiB) * 100) / 100 + " MiB";
    else return "unk";
  },
  getConsoleTitle: () => { return ""; },
  consoleTitleHeader: [
    `"[", mp.tty.slashRotate[mp.tty.slashState], "] "`,
    `mp.config.name`,
    `mp.players.length, (mp.players.length != 1 ? " players" : " player")`,
    `mp.vehicles.length, " veh"`
  ],
  consoleTitleFooter: `, mp.tty.delimiter, "up: ", (mp.tty.uptime), mp.tty.delimiter, "CPU: ", mp.tty.getCPUUsage(), " %", mp.tty.delimiter, "Mem: ", mp.tty.getMemUsage(), " ", mp.tty.normal);`,
  addConsoleTitle: (codeExpression) => {
    let
      result = `return mp.tty.consoleTitleBgColor.concat(mp.tty.consoleTitleFgColor`,
      i = 0;
    tty.consoleTitleHeader.push(codeExpression);
    tty.consoleTitleHeader.forEach((titleFunc) => {
      result = result.concat((i < 2 ? `, ` : `, mp.tty.delimiter,`), titleFunc);
      i += 1;
    });
    result = result.concat(tty.consoleTitleFooter);
    tty.getConsoleTitle = new Function(result);
  },
  commands: {},
  help: `Available commands:\n`,
  init: () => {
    // Load commands
    fs.readdirSync(__dirname + "/commands").filter(fn => fn.endsWith(".js")).forEach((filename) => {
      const commandModule = require("./commands/" + filename);
      tty.commands[filename.slice(0, -3)] = commandModule.cmd;
      tty.help += (typeof commandModule.help != "undefined" ? commandModule.help : ``);
      //console.log("Loaded command `" + filename.slice(0, -3) + "`");
    });

    // Generate initial console title
    let result = `return mp.tty.consoleTitleBgColor.concat(mp.tty.consoleTitleFgColor`;
    let i = 0;
    tty.consoleTitleHeader.forEach((titleFunc) => {
      result = result.concat((i < 2 ? `, ` : `, mp.tty.delimiter,`), titleFunc);
      i += 1;
    });
    result = result.concat(tty.consoleTitleFooter);
    tty.getConsoleTitle = new Function(result);
  },
  parseCommand: (string) => {
    const
      args = string.split(" "),
      cmd = args[0].toLowerCase();

    tty.window_width = process.stdout.columns;
    tty.window_height = process.stdout.rows;

    if (tty.commands[cmd]) return tty.commands[cmd](args);
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
tty.init();

// Start updating info row
if (!mp.config.tty || !mp.config.tty.hideTitle) (async () => {
  while (mp.events.delayInitialization) await wait(100);
  tty.interval = setInterval(tty.drawConsole, tty.updateInterval);
})();
