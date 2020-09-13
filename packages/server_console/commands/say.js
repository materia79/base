module.exports = {
  cmd: (args) => {
    args.shift();
    var text = args.join(" ");

    if (args.length < 1) return "Usage: `say <text>`";
    if (!mp.arenas) return ["[Console]: ".concat(text), mp.players.forEach((player) => { player.outputChatBox("[Console]: ".concat(text)) })][0];
    
    if (mp.tty.chatFocus == 0) { // send chat to all
      mp.players.call("pc", [1, -1, text]);
    } else { // send chat to specific gamemode
      if (!mp.arenas[chatFocus]) return "\nError, arena ".concat(chatFocus, " does not exist!");
      mp.players.call(mp.arenas[chatFocus].players, "pc", [1, -1, text]);
    }
  },
  help: `    say                       - say something\n`
}
