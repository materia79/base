mp.log = function (string) { // Clientside -> Server log
  mp.tty.push(JSON.stringify(string));
  if (!mp.log.queue[string]) {        // first time in last 250 ms?
    return mp.log.queue[string] = {   // queue it
      timeout: setTimeout(mp.log.process.bind({ string: string }), 250),
      dup: 1,
      start: new Date().getTime()
    }
  } else {                                  // same message was logged within the last 250 ms?
    mp.log.queue[string].dup++;
    if (mp.log.queue[string].start + 3000 < new Date().getTime()) { // was maximum supression time exceed yet?
      clearTimeout(mp.log.queue[string].timeout);       // clear the timeout
      mp.log.process.bind({ string: string })(string);  // output message and delete queue object
      return mp.log(string);                            // queue new message
    } else {
      clearTimeout(mp.log.queue[string].timeout);       // clear current timeout
      mp.log.queue[string].timeout = setTimeout(mp.log.process.bind({ string: string }), 250);
    }
  }
}
mp.log.process = function () {
  if (mp.log.queue[this.string]) {            // if the timeout called process or the maximum supression time exceed
    if (mp.log.queue[this.string].dup > 1) {  // multiple events
      mp.events.callRemote('log', this.string + " [ " + mp.log.queue[this.string].dup + " x DUP ]");
    } else {                                  // only one event
      mp.events.callRemote('log', this.string);
    }
    delete mp.log.queue[this.string];         // in any case this line was output now
  } else {                                    // timeout didnt called process
    mp.events.callRemote('log', this.string);
  }
}
mp.log.queue = {};
mp.events.add("log", mp.log);
