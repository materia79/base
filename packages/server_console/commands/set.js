module.exports = {
  cmd: (ctx, args) => {
    const name = String(args[1] ?? "").trim();
    if (name.length === 0 || args.length < 3) {
      return "Usage: set <variable> <value>";
    }

    const value = args.slice(2).join(" ");
    const ok = ctx.setVariable(name, value, true);
    if (!ok) {
      return "Usage: set <variable> <value>";
    }

    return `Variable '${name}' set to '${value}'. Saved to console_config.json.`;
  },
  help: "set <variable> <value>     - set/create variabled.<variable> and persist",
  group: "Variables"
};