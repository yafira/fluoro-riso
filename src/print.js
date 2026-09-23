// canvas pipeline for images: one coverage map per ink, screened to 1-bit, multiplied onto paper

import { hexRgb, pickChannels } from "./color.js";
import { noiseArr } from "./noise.js";
import { bayer, dotScreen } from "./screens.js";
import { PAPER, INKS } from "./defaults.js";

export const PRINT_DEFAULTS = {
  inkA: INKS["pink-blue"][0],
  inkB: INKS["pink-blue"][1],
  paper: PAPER,
  screen: "halftone",
  cell: 6,
  angle: 0,
  contrast: 1.2,
  grain: 0.08,
  misregistration: 2,
  direction: [1, 0.5],
  opacity: 0.92,
  density: 0,
  phase: [[0, 0], [0, 0]],
  seed: 1,
  maxSize: 640
};

function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

// invert the channel, then apply a contrast curve around the midpoint
export function coverage(data, n, ch, contrast) {
  const cov = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let v = 1 - data[i * 4 + ch] / 255;
    v = (v - 0.5) * contrast + 0.5;
    cov[i] = v < 0 ? 0 : v > 1 ? 1 : v;
  }
  return cov;
}

// one ink layer: 1-bit screen of a coverage map, painted in the ink color
export function makeLayer(cov, w, h, rgb, angleDeg, noise, grainN, o, phase) {
  const ph = phase || [0, 0];
  const c = canvas(w, h);
  const g = c.getContext("2d");
  const img = g.createImageData(w, h);
  const px = img.data;
  const a = (angleDeg * Math.PI) / 180;
  const s = Math.max(1, Math.round(o.cell / 3));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let t;
      if (o.screen === "halftone") t = dotScreen(x + ph[0], y + ph[1], a, o.cell);
      else if (o.screen === "bayer") t = (bayer[((y + ph[1]) / s | 0) & 7][((x + ph[0]) / s | 0) & 7] + 0.5) / 64;
      else t = noise[i];
      if (o.screen !== "noise") t += (grainN[i] - 0.5) * o.grain * 2;
      if (cov[i] > t) {
        const p = i * 4;
        px[p] = rgb[0];
        px[p + 1] = rgb[1];
        px[p + 2] = rgb[2];
        px[p + 3] = 255;
      }
    }
  }
  g.putImageData(img, 0, 0);
  return c;
}

// overprint the layers on paper, the second pass nudged for misregistration
export function composite(out, w, h, layers, o) {
  out.width = w;
  out.height = h;
  const g = out.getContext("2d");
  g.fillStyle = o.paper;
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = "multiply";
  g.globalAlpha = Math.min(1, Math.max(0.3, o.opacity + o.density));
  const [ax, ay] = o.direction;
  layers.forEach((l, k) => {
    g.drawImage(l, Math.round(k * o.misregistration * ax), Math.round(k * o.misregistration * ay));
  });
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 1;
  return out;
}

// print an <img>, <canvas>, ImageBitmap or <video> frame; returns a new canvas
// the source must be same-origin or served with cors headers, or the pixels can't be read
export function printImage(source, options = {}) {
  const o = { ...PRINT_DEFAULTS, ...options };
  const sw = source.naturalWidth || source.videoWidth || source.width;
  const sh = source.naturalHeight || source.videoHeight || source.height;
  if (!sw || !sh) throw new Error("fluoro: the source has no size yet, wait for it to load");

  const scale = Math.min(1, o.maxSize / Math.max(sw, sh));
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));
  const src = canvas(w, h);
  const g = src.getContext("2d");
  g.drawImage(source, 0, 0, w, h);

  let data;
  try {
    data = g.getImageData(0, 0, w, h).data;
  } catch (e) {
    throw new Error("fluoro: can't read this image's pixels, it's from another origin without cors headers");
  }

  const n = w * h;
  const ch = pickChannels(o.inkA, o.inkB);
  const seed = o.seed * 7;
  const layers = [
    makeLayer(coverage(data, n, ch[0], o.contrast), w, h, hexRgb(o.inkA), 15 + o.angle, noiseArr(n, seed + 1), noiseArr(n, seed + 3), o, o.phase[0]),
    makeLayer(coverage(data, n, ch[1], o.contrast), w, h, hexRgb(o.inkB), 75 + o.angle, noiseArr(n, seed + 2), noiseArr(n, seed + 4), o, o.phase[1])
  ];
  return composite(options.canvas || canvas(w, h), w, h, layers, o);
}
