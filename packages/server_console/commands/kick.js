module.exports = {
  cmd: (args) => {
    args.shift();
    if (args.length == 0) return "Usage: `kick <id>`";
    let player = mp.players.at(args[0]);

    if (!player) return "Could not find player id `" + args[0] + "`";    
    player.kick("Console");
    return "Player `" + player.name + "` was kicked!";
  },
  help: `    kick <id>                 - kick a player\n`
}
