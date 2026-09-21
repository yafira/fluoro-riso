// ink layers: screen a coverage map to 1-bit, then multiply the layers onto paper

// one ink layer: 1-bit screen of a coverage map, painted in the ink color
function makeLayer(cov, w, h, rgb, angleDeg, noise, grainN, phase) {
  var ph = phase || [0, 0];
  var c = document.createElement("canvas");
  c.width = w; c.height = h;
  var g = c.getContext("2d");
  var img = g.createImageData(w, h);
  var px = img.data;
  var cell = state.cell, a = angleDeg * Math.PI / 180, mode = state.mode, grain = state.grain;
  var s = Math.max(1, Math.round(cell / 3));
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var i = y * w + x, t;
      if (mode === "halftone") t = dotScreen(x + ph[0], y + ph[1], a, cell);
      else if (mode === "bayer") t = (bayer[(((y + ph[1]) / s) | 0) & 7][(((x + ph[0]) / s) | 0) & 7] + 0.5) / 64;
      else t = noise[i];
      if (mode !== "noise") t += (grainN[i] - 0.5) * grain * 2;
      if (cov[i] > t) {
        var p = i * 4;
        px[p] = rgb[0]; px[p + 1] = rgb[1]; px[p + 2] = rgb[2]; px[p + 3] = 255;
      }
    }
  }
  g.putImageData(img, 0, 0);
  return c;
}

function composite(cv, w, h, layers) {
  cv.width = w; cv.height = h;
  var g = cv.getContext("2d");
  g.fillStyle = PAPER;
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = "multiply";
  g.globalAlpha = Math.min(1, Math.max(0.3, state.opacity + state.jit));
  layers.forEach(function (l, k) {
    g.drawImage(l, Math.round(k * state.mis * state.ax), Math.round(k * state.mis * state.ay));
  });
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 1;
}
