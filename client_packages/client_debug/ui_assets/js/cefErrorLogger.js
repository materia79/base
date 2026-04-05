const getCefSourceName = () => {
  try {
    return document.location.href.split('/').pop();
  } catch (error) {
    return 'unknown_cef';
  }
};

const formatCefLogValue = (value) => {
  if (typeof value == "string") return value;
  if (value instanceof Error) return value.stack || value.message || String(value);
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
};

const emitCefLog = (...args) => {
  try {
    mp.trigger("log", args.map(formatCefLogValue).join(" "));
  } catch (error) {
    // Intentionally swallow logging failures inside CEF error logging.
  }
};

mp.log = (...args) => {
  emitCefLog(...args);
};

console.log_orig = console.log;
console.warn_orig = console.warn ? console.warn.bind(console) : console.log;
console.error_orig = console.error ? console.error.bind(console) : console.log;
console.log = (...args) => {
  emitCefLog("[CEF(" + getCefSourceName() + ")]", ...args);
};
console.warn = (...args) => {
  emitCefLog("[CEF(" + getCefSourceName() + ")] [warn]", ...args);
};
console.error = (...args) => {
  emitCefLog("[CEF(" + getCefSourceName() + ")] [error]", ...args);
};

window.onerror = function (message, source, lineno, colno, error) {
  const sourceName = (source && source.split ? source.split('/').pop() : getCefSourceName());
  const stack = (error && error.stack ? error.stack : error);
  mp.log("[CEF(" + sourceName + ")] " + message + "\nSource: " + source + "\nLine|col: " + lineno + "|" + colno + "\nError: " + stack);
};

window.addEventListener("unhandledrejection", function (event) {
  const reason = (event && event.reason && event.reason.stack ? event.reason.stack : event && event.reason ? event.reason : "unknown rejection");
  mp.log("[CEF(" + getCefSourceName() + ")] Unhandled promise rejection: " + reason);
});

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