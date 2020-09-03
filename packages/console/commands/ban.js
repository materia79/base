module.exports = {
  cmd: (args) => {
    args.shift();
    if (args.length == 0) return "Usage: `ban <id>`";
    let player = mp.players.at(args[0]);

    if (!player) return "Could not find player id `" + args[0] + "`";
    player.ban("Console");
    return " Player " + player.name + " was banned!";
  },
  help: `    ban <id>                  - ban a player\n`
}
