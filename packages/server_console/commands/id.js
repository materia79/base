function getPlayerInfo(player) {
  return " ".concat(
    player.id,
    " | ",
    player.name,
    " | ",
    player.ip,
    " | ",
    player.dimension,
    " | ",
    player.getVariable("countrycode"),
    " (",
    player.getVariable("country"),
    ") | ",
    player.ping,
    " | ",
    player.socialClub,
    " | ",
    player.rgscId,
    "\n"
  );
};

module.exports = {
  cmd: (args) => {
    let res = ``;

    if (args.length == 2) {
      let playerFromId = mp.players.at(parseInt(args[1]));

      if (!playerFromId) { // if argument was not a valid player id
        let string = args[1].toLowerCase(); // allow lower case search

        mp.players.forEach((player) => {
          if (player.name.toLowerCase().includes(string) || player.socialClub.toLowerCase().includes(string)) {
            res += getPlayerInfo(player);
          }
        });
      } else {
        return getPlayerInfo(playerFromId);
      }
    } else {
      mp.players.forEach(player => {
        res += getPlayerInfo(player);
      });
    };

    return res;
  },
  help: `    id <id or part of name>   - show more details about players\n`
}
