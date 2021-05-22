class EventMerger {
  constructor(handler, minBufferTimeMs = 250, maxBufferTimeMs = 3000) {
    this.minBufferTimeMs = minBufferTimeMs;
    this.maxBufferTimeMs = maxBufferTimeMs;
    this.queue = {};
    this.handler = handler;

    this.add = function () { // first argument must be the unique identifier, second argument can be a number and will be added to stack on every supressed event
      try {
        const id = (arguments && arguments[0]) ? encodeURI(arguments[0]) : null;
        if (typeof id == null) return;
        if (typeof this.queue == "undefined") throw new Error("queue not found!");
        if (this.queue && this.queue[id]) {
          const queue = this.queue[id];
          queue.dup++;
          if (typeof arguments[1] == "number") {
            queue.stack += arguments[1];
            arguments[1] = queue.stack;
            queue.args = Array.from(arguments);
          }
          if (queue.start + this.maxBufferTimeMs < new Date().getTime()) {
            clearTimeout(queue.timeout);
            queue.handler.bind({ queue: queue })(...queue.args);
            delete this.queue[id];
          } else {
            clearTimeout(queue.timeout);
            queue.timeout = setTimeout(() => {
              queue.handler.bind({ queue: queue })(...queue.args);
              delete this.queue[id];
            }, this.minBufferTimeMs);
          }
        } else {
          const queue = this.queue[id] = {
            args: Array.from(arguments),
            dup: 1,
            handler: this.handler,
            stack: typeof arguments[1] == "number" ? arguments[1] : 0,
            start: new Date().getTime()
          }
          queue.timeout = setTimeout(() => {
            queue.handler.bind({ queue: queue })(...queue.args);
            delete this.queue[id];
          }, this.minBufferTimeMs);
        }
      } catch (error) { mp.events.callRemote("log", "[log.add] " + error.stack); };
    }.bind({
      handler: handler,
      queue: this.queue,
      minBufferTimeMs: minBufferTimeMs,
      maxBufferTimeMs: maxBufferTimeMs
    });
  }
};
mp.events.EventMerger = EventMerger;
/*
func = function () { mp.events.callRemote("log", "handle: " + arguments[0] + " total damage: " + this.queue.stack); };
test = new mp.events.EventMerger(func, 1000, 5000);
test.add(12345, 10);
test.add(12345, 10);
*/
