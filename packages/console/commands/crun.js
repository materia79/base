module.exports = {
  cmd: (args) => {
    args.shift();
    if (args.length == 0 || args[0] == "") return "\nUsage: crun <userid> <code>";
    let targetPlayer = args[0] >= 0 ? mp.players.at(args[0]) : false;
    if (targetPlayer) {
      args.shift();
      return targetPlayer.call("crun", [args.join(" ")]);
    }
    return "\nCould not find player " + args[0];
  },
  help: `    crun <player id> <code>   - execute clientside code\n`
}
