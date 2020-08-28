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
  if (res != "") console.log("Command result: " + res);
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
let chatFocus = 0;
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
  ddots: (" ").concat(sgrRgbFg(255, 0, 0), "::", sgrRgbFg(0, 0, 0), " "),
  oneMiB: 1024 * 1024,
  slashRotate: { "1": "/", "2": "-", "3": "\\", "4": "|" },
  slashState: 1,
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
    process.stdout.write(mp.tty.grey.concat(whiteSpace.repeat(window_width), "\n"));
    readline.moveCursor(rl.output, 0, -1);
    // Print title line
    process.stdout.write(mp.tty.getConsoleTitle().concat("\n"));
    readline.moveCursor(rl.output, lastCursorPos, window_height - 1);
    mp.tty.slashState = (mp.tty.slashState == 4 ? 1 : mp.tty.slashState + 1);
  },
  cpuAverage: () => {
    //Initialise sum of idle and time of cores and fetch CPU info
    var totalIdle = 0,
      totalTick = 0;
    var cpus = os.cpus();
    if (!cpus) return {
      idle: 1,
      total: 1
    };

    //Loop through CPU cores
    for (var i = 0, len = cpus.length; i < len; i++) {

      //Select CPU core
      var cpu = cpus[i];

      //Total up the time in the cores tick
      for (type in cpu.times) {
        totalTick += cpu.times[type];
      }

      //Total up the idle time of the core
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
  getConsoleTitle: () => {
    return mp.tty._GREY.concat(mp.tty.black,
      "[",
      mp.tty.slashRotate[mp.tty.slashState],
      "] ",
      mp.config.name,
      mp.tty.ddots,
      mp.players.length,
      (mp.players.length != 1 ? " beasts" : " beast"),
      mp.tty.ddots,
      mp.vehicles.length,
      " rides",
      mp.tty.ddots,
      "uptime ",
      (mp.tty.uptime),
      mp.tty.ddots,
      "CPU: ",
      mp.tty.getCPUUsage(),
      " %",
      mp.tty.ddots,
      "Mem: ",
      mp.tty.getMemUsage(),
      " ", mp.tty.normal
    );
  },
  parseCommand: (s) => {
    var args = s.split(" ");
    var cmd = args[0].toLowerCase();
    var res = '';

    window_width = process.stdout.columns;
    window_height = process.stdout.rows;

    switch (cmd) {
      case "help":
        return `
Available commands:\n
    r                         - run code
    say                       - say something
    focus                     - set target for say
    ban <id> <time>           - ban a player
    kick <id> <reason>        - kick a player
    id <id or part of name>   - show more details about players\n\n`;
        break;
      case "r":
        args.shift();
        let commandLine = args.join(" ");
        console.log("Execute: " + commandLine);
        var f = new Function(commandLine);
        console.log("Executing: " + commandLine);
        var result = f();
        console.log("Return value: " + result);
        break;
      case "crun":
        args.shift();
        if (args[0] == "") return "\nUsage: crun <userid> <code>";
        let targetPlayer = args[0] >= 0 ? mp.players.at(args[0]) : false;
        if (targetPlayer) {
          args.shift();
          return targetPlayer.call("crun", [args.join(" ")]);
        }
        return "\nCould not find player " + args[0];
      case "say":
        args.shift();
        var thisText = args.join(" ");
        if (chatFocus == 0) { // send chat to all
          mp.players.call("pc", [1, -1, thisText]);
        } else { // send chat to specific gamemode
          if (!mp.arenas[chatFocus]) return "\nError, arena " + chatFocus + " does not exist!";
          mp.players.call(mp.arenas[chatFocus].players, "pc", [1, -1, thisText]);
        }
        readline.moveCursor(rl.output, 0, -1);
        console.log("[Console]: " + thisText);
        break;
      case "focus":
        args.shift();
        var thisGamemode = args.join(" ");
        if (thisGamemode === "0") { // all chats
          chatFocus = 0;
          return "Changed chat focus to global";
        }
        if (!mp.arenas[thisGamemode]) { // give help
          for (var k in mp.arenas) {
            console.log("  " + k + " -> " + mp.arenas[k].name);
          }
          return "Usage: focus <gamemode id>";
          break;
        }
        // focus chat
        chatFocus = thisGamemode;
        console.log("Changed chat focus to " + mp.arenas[thisGamemode].name);
        break;
      case "ban":
        mp.players.forEach(player => {
          if (player.name.toLowerCase() == args[1].toLowerCase()) {
            player.ban("Console");
            res = " Player " + player.name + " was banned!!!";
          }
        });
        break;
      case "kick":
        mp.players.forEach(player => {
          if (player.name.toLowerCase() == args[1].toLowerCase()) {
            player.kick("Console");
            res = " Player " + player.name + " was kicked!!!";
          }
        });
        break;
      case "tppos":
        if (args.length > 4) {
          mp.players.forEach(player => {
            if (player.name.toLowerCase() == args[1].toLowerCase()) {
              player.position = new mp.Vector3(parseFloat(args[2]), parseFloat(args[3]), parseFloat(args[4]));
              res = " Player " + player.name + " was teleported to X:" + parseFloat(args[2]) + " Y:" + parseFloat(args[3]) + " Z:" + parseFloat(args[4]) + "!!!";
            }
          });
        } else {
          res = " Invalid arguments!!!"
        }
        break;
      case "give.weapons":
        if (args.length > 3) {
          mp.players.forEach(player => {
            if (player.name.toLowerCase() == args[1].toLowerCase()) {
              player.giveWeapon(mp.joaat(args[2]), parseInt(args[3]));
              res = " Player " + player.name + " received weapons!!!";
            }
          });
        } else {
          res = " Invalid arguments!!!"
        }
        break;
      case "id":
        if (args.length == 2 && args[1].isInteger()) {
          for (k in mp.players) {
            var player = mp.players[k];
            if (player.id == parseInteger(args[1])) {
              res += player.id + " | " + player.name + " | " + player.ip + " | " + player.dimension + " | " + player.getVariable("countrycode") + " (" + player.getVariable("country") + ") | " + player.ping + " | " + player.socialClub + "\n";
            }
          }
        } else {
          mp.players.forEach(player => {
            res += player.id + " | " + player.name + " | " + player.ip + " | " + player.dimension + " | " + player.getVariable("countrycode") + " (" + player.getVariable("country") + ") | " + player.ping + " | " + player.socialClub + "\n";
          });
        };
        break;
      default:
        break;
    }

    return res;
  },
  rgb: sgrRgbFg,
  RGB: sgrRgbBg,
  normal: sgrRgbFg(192, 192, 192).concat(sgrRgbBg(0, 0, 0)),
  red: sgrRgbFg(192, 0, 0),
  yellow: sgrRgbFg(192, 192, 0),
  black: sgrRgbFg(0, 0, 0),
  green: sgrRgbFg(0, 192, 0),
  grey: sgrRgbFg(192, 192, 192),
  BLACK: sgrRgbBg(0, 0, 0),
  GREY: sgrRgbBg(192, 192, 192),
  WARNING: sgrRgbBg(192, 0, 0).concat(sgrRgbFg(0, 0, 0)),
  _black: sgrRgbFg(0, 0, 0),
  _BLACK: sgrRgbBg(0, 0, 0),
  _GREY: sgrRgbBg(192, 192, 192),
  _green: sgrRgbFg(0, 192, 0),
  _grey: sgrRgbFg(192, 192, 192),
};

setInterval(mp.tty.drawConsole, mp.tty.updateInterval);
