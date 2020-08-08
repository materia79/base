const esc = `\x1b`;
const sgr = (...args) => `${esc}[${args.join(';')}m`;
const sgrRgbFg = (...args) => sgr(`38;2;${args.join(';')}`);
const sgrRgbBg = (...args) => sgr(`48;2;${args.join(';')}`);
const normal = sgrRgbFg(192, 192, 192) + sgrRgbBg(0, 0, 0);

mp.events.add("log", (player, text) => {
  console.log(normal.concat("[", sgrRgbBg(0, 0, 0), player.name, sgrRgbFg(192, 192, 192), "(", player.id, ")", normal, "] ", text, normal));
});
console.log("[Log] clientLogger ready");
