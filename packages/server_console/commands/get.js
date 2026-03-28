module.exports = {
  cmd: (ctx, args) => {
    const vars =
      ctx.state.variabled && typeof ctx.state.variabled === "object"
        ? ctx.state.variabled
        : {};

    const entries = Object.entries(vars).sort((a, b) =>
      String(a[0]).localeCompare(String(b[0]))
    );

    if (entries.length === 0) {
      return "No variables configured.";
    }

    const filter = String(args[1] ?? "").trim().toLowerCase();
    const filtered = filter.length === 0
      ? entries
      : entries.filter(([name]) => String(name).toLowerCase().includes(filter));

    if (filtered.length === 0) {
      return `No variables match '${filter}'.`;
    }

    return filtered
      .map(([name, value]) => `${name} = ${String(value ?? "")}`)
      .join("\n");
  },
  help:
    "get                        - list all variabled entries\n" +
    "get <variable name filter> - filter variable names (contains, case-insensitive)",
  group: "Variables"
};