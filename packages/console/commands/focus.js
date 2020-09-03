module.exports = {
  cmd: (args) => {
    if (typeof mp.arenas == "undefined") return console.log("No arena manager detected. Global chat available only!");
    args.shift();
    var gm_id = args.join(" ");
    if (gm_id == 0) { // all chats
      mp.tty.chatFocus = 0;
      return "Changed chat focus to global";
    }
    if (!mp.arenas[gm_id]) { // give help
      for (let k in mp.arenas) {
        console.log("  " + k + " -> " + mp.arenas[k].name);
      }
      return "Usage: focus <gamemode id>";
    }
    // focus chat
    mp.tty.chatFocus = gm_id;
    console.log("Changed chat focus to " + mp.arenas[gm_id].name);
  },
  help: (typeof mp.arenas != "undefined" ? `    focus                     - set target gamemode for \`say\`` : ``)
}