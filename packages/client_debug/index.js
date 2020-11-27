const esc = `\x1b`;
const sgr = (...args) => `${esc}[${args.join(';')}m`;
const sgrRgbFg = (...args) => sgr(`38;2;${args.join(';')}`);
const sgrRgbBg = (...args) => sgr(`48;2;${args.join(';')}`);
const normal = sgrRgbFg(192, 192, 192) + sgrRgbBg(0, 0, 0);
const bgBlack = sgrRgbBg(0, 0, 0);
const fgGrey = sgrRgbFg(192, 192, 192);

mp.events.add("log", (player, text) => {
  console.log(normal.concat("[", bgBlack, player.name, fgGrey, "(", player.id, ")", normal, "] ", text, normal));
});
