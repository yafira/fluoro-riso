// shared helpers: element lookup, color math, seeded noise

var $ = function (id) { return document.getElementById(id); };

var PAPER = "#f3f0e9";

function hexRgb(h) {
  var n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// the channel an ink absorbs most is the one whose value is lowest in the ink color
function channelFor(rgb) {
  return rgb.indexOf(Math.min(rgb[0], rgb[1], rgb[2]));
}

function channels() {
  var a = channelFor(hexRgb(state.inkA));
  var b = channelFor(hexRgb(state.inkB));
  if (b === a) b = (a + 1) % 3;
  return [a, b];
}

function mulberry(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function noiseArr(n, seed) {
  var r = mulberry(seed), a = new Float32Array(n);
  for (var i = 0; i < n; i++) a[i] = r();
  return a;
}
