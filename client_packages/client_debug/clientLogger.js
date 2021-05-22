(async () => {
  // cache messages until EventMerger is loaded...
  mp.log = function () { setTimeout(mp.log, 10, Array.from(arguments)); };
  while (!mp.events.EventMerger) await mp.game.waitAsync(0);

  const clientlog = new mp.events.EventMerger(function () {
    try {
      if (this.queue.dup > 1) {  // multiple events
        mp.events.callRemote('log', this.queue.args.join(" ") + " [ " + this.queue.dup + " x DUP ]");
      } else {                   // only one event
        mp.events.callRemote('log', this.queue.args.join(" "));
      }
    } catch (error) { mp.events.callRemote("log", "[log.handler] " + error.stack); }
  }, 250, 3000);
  mp.log = clientlog.add;
  mp.events.add("log", mp.log);
})();
