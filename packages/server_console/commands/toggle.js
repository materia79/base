module.exports = {
  cmd: (args) => {
    args.shift();
    
    if (args.length && args[0] == "title") {
      if (mp.tty.interval) {
        clearInterval(mp.tty.interval);
        mp.tty.interval = null;
        return "Turned off title."
      } else {
        mp.tty.interval = setInterval(mp.tty.drawConsole, mp.tty.updateInterval);
        return "Turned on title."
      }
    }
    return "Usage: `toggle [title]`";
  },
  help: `    toggle title              - toggle title bar\n`
}
