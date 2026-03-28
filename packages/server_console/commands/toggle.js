module.exports = {
  cmd: (ctx, args) => {
    const target = String(args[1] ?? "").toLowerCase();

    if (target === "title") {
      const next = !ctx.state.titleEnabled;
      ctx.setTitleEnabled(next, true);
      return `Title is now ${next ? "on" : "off"}. Saved to console_config.json.`;
    }

    if (target === "wrap") {
      const next = !ctx.state.wrapEnabled;
      ctx.setWrapEnabled(next, true);
      return `Word wrap is now ${next ? "on" : "off"}. Saved to console_config.json.`;
    }

    if (target === "timestamps") {
      const next = !ctx.state.timestampsEnabled;
      ctx.setTimestampsEnabled(next, true);
      return `Timestamps are now ${next ? "on" : "off"}. Saved to console_config.json.`;
    }

    if (target === "mouse" || target === "select" || target === "selection") {
      const next = !ctx.state.mouseCaptureEnabled;
      ctx.setMouseCaptureEnabled(next, true);
      return next
        ? "Mouse capture is now on. App wheel scrolling is active and native selection is limited. Saved to console_config.json."
        : "Mouse capture is now off. Native terminal selection/copy/paste is active. Saved to console_config.json.";
    }

    if (target === "afk") {
      const next = !ctx.state.afkEnabled;
      ctx.setAfkEnabled(next, true);
      return `AFK timeout is now ${next ? "on" : "off"}. Saved to console_config.json.`;
    }

    return "Usage: toggle [title|wrap|timestamps|mouse|afk]";
  },
  help:
    "toggle title               - toggle title row\n" +
    "toggle wrap                - toggle buffer word-wrap\n" +
    "toggle timestamps          - toggle UTC log timestamps\n" +
    "toggle mouse               - switch between app mouse mode and native terminal selection mode\n" +
    "toggle afk                 - toggle AFK timeout detection",
  group: "Configuration (persist to config file)"
};
