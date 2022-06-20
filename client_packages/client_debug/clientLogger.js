(async () => {
  // cache messages until EventMerger is loaded...
  mp.log = function () { setTimeout(mp.log, 10, Array.from(arguments)); };
  while (!mp.events.EventMerger) await mp.game.waitAsync(0);

  // event merger
  const clientlog = new mp.events.EventMerger(function (string) {
    try {
      if (this.queue.dup > 1) mp.events.callRemote('log', string + " [ " + this.queue.dup + " x DUP ]");    // multiple events
      else mp.events.callRemote('log', string);                                                             // only one event
    } catch (error) { mp.events.callRemote("log", "[log.handler] " + error.stack); }
  }, 250, 3000);

  mp.log = function () { clientlog.add(([...arguments]).join(" ")); };
  mp.events.add("log", mp.log);
})();
