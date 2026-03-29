module.exports = {
  cmd: (ctx, args) => {
    const name = String(args[1] ?? "").trim();
    if (name.length === 0) {
      return "Usage: unset <variable>";
    }

    if (!Object.prototype.hasOwnProperty.call(ctx.state.variabled, name)) {
      return `Variable '${name}' does not exist.`;
    }

    ctx.unsetVariable(name, true);
    return `Variable '${name}' removed. Saved to console_config.json.`;
  },
  help: "unset <variable>           - delete variabled.<variable> and persist",
  group: "Variables"
};