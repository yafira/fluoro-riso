// app: source image, rendering, controls

// source image
var srcCanvas = document.createElement("canvas");

var srcData = null, W = 640, H = 440;

var nA, nB, gA, gB;

function readSource() {
  var g = srcCanvas.getContext("2d");
  W = srcCanvas.width; H = srcCanvas.height;
  srcData = g.getImageData(0, 0, W, H).data;
  buildNoise();
}

function buildNoise() {
  var n = W * H;
  nA = noiseArr(n, state.seed * 7 + 1);
  nB = noiseArr(n, state.seed * 7 + 2);
  gA = noiseArr(n, state.seed * 7 + 3);
  gB = noiseArr(n, state.seed * 7 + 4);
}

function coverage(ch) {
  var n = W * H, cov = new Float32Array(n), k = state.contrast;
  for (var i = 0; i < n; i++) {
    var v = 1 - srcData[i * 4 + ch] / 255;
    v = (v - 0.5) * k + 0.5;
    cov[i] = v < 0 ? 0 : v > 1 ? 1 : v;
  }
  return cov;
}

function renderMain() {
  var out = $("out");
  if (state.orig) {
    out.width = W; out.height = H;
    out.getContext("2d").drawImage(srcCanvas, 0, 0);
    return;
  }
  var ch = channels();
  var layers = [
    makeLayer(coverage(ch[0]), W, H, hexRgb(state.inkA), 15 + state.angle, nA, gA),
    makeLayer(coverage(ch[1]), W, H, hexRgb(state.inkB), 75 + state.angle, nB, gB)
  ];
  composite(out, W, H, layers);
}

// decorative halftone gradients on the layout demo
var sw = { w: 320, h: 200, covA: null, covB: null, nA: null, nB: null, gA: null, gB: null };

function initSwatch() {
  var n = sw.w * sw.h;
  sw.covA = new Float32Array(n); sw.covB = new Float32Array(n);
  for (var y = 0; y < sw.h; y++) {
    for (var x = 0; x < sw.w; x++) {
      sw.covA[y * sw.w + x] = x / sw.w;
      sw.covB[y * sw.w + x] = y / sw.h;
    }
  }
  sw.nA = noiseArr(n, 101); sw.nB = noiseArr(n, 102); sw.gA = noiseArr(n, 103); sw.gB = noiseArr(n, 104);
}

function renderSwatch() {
  var layers = [
    makeLayer(sw.covA, sw.w, sw.h, hexRgb(state.inkA), 15 + state.angle, sw.nA, sw.gA),
    makeLayer(sw.covB, sw.w, sw.h, hexRgb(state.inkB), 75 + state.angle, sw.nB, sw.gB)
  ];
  composite($("swatch"), sw.w, sw.h, layers);
}

function applyVars() {
  var r = document.documentElement.style;
  r.setProperty("--ink-a", state.inkA);
  r.setProperty("--ink-b", state.inkB);
  r.setProperty("--mis", state.mis + "px");
}

function labels() {
  $("cellO").textContent = state.cell + "px";
  $("angleO").textContent = state.angle + "\u00b0";
  $("contrastO").textContent = state.contrast.toFixed(2);
  $("grainO").textContent = state.grain.toFixed(2);
  $("misO").textContent = state.mis + "px";
  $("opacityO").textContent = state.opacity.toFixed(2);
}

var queued = false;

function schedule() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(function () {
    queued = false;
    labels(); applyVars(); renderMain(); renderSwatch();
  });
}

function bindRange(id, key, isInt) {
  $(id).addEventListener("input", function (e) {
    state[key] = isInt ? parseInt(e.target.value, 10) : parseFloat(e.target.value);
    schedule();
  });
}

bindRange("cell", "cell", true);

bindRange("angle", "angle", true);

bindRange("contrast", "contrast");

bindRange("grain", "grain");

bindRange("mis", "mis", true);

bindRange("opacity", "opacity");


$("mode").addEventListener("change", function (e) { state.mode = e.target.value; schedule(); });

$("inkA").addEventListener("input", function (e) { state.inkA = e.target.value; schedule(); });

$("inkB").addEventListener("input", function (e) { state.inkB = e.target.value; schedule(); });

$("orig").addEventListener("change", function (e) { state.orig = e.target.checked; schedule(); });


Array.prototype.forEach.call(document.querySelectorAll("[data-a]"), function (b) {
  b.addEventListener("click", function () {
    state.inkA = b.getAttribute("data-a");
    state.inkB = b.getAttribute("data-b");
    $("inkA").value = state.inkA;
    $("inkB").value = state.inkB;
    schedule();
  });
});

$("reprint").addEventListener("click", function () {
  state.seed = Math.floor(Math.random() * 100000) + 1;
  buildNoise();
  schedule();
});

$("file").addEventListener("change", function (e) {
  var f = e.target.files && e.target.files[0];
  if (!f) return;
  var reader = new FileReader();
  reader.onload = function () {
    var img = new Image();
    img.onload = function () {
      var scale = Math.min(1, 640 / Math.max(img.width, img.height));
      srcCanvas.width = Math.max(1, Math.round(img.width * scale));
      srcCanvas.height = Math.max(1, Math.round(img.height * scale));
      srcCanvas.getContext("2d").drawImage(img, 0, 0, srcCanvas.width, srcCanvas.height);
      readSource();
      schedule();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(f);
});

drawScene(srcCanvas);

readSource();

initSwatch();

schedule();
