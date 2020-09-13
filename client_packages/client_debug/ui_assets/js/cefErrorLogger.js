mp.log = (text) => {
  mp.trigger("log", text);
};

console.log._orig = console.log;
console.log = (text) => {
  mp.trigger("log", "[CEF(" + document.location.href.split('/').pop() + ")] " + text);
};

window.onerror = function (message, source, lineno, colno, error) {
  mp.log("[CEF(" + source.split('/').pop() + ")] " + message + "\nSource: " + source + "\nLine|col: " + lineno + "|" + colno + "\nError: " + error.stack);
};
