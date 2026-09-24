// lite print: blend layers laid over the page instead of an svg filter on it.
// nothing on the page gets filtered, so scrolling stays fast, fixed headers keep
// working in every browser, and anything stacked above the layers stays unprinted

import { hexRgb } from "./color.js";
import { mulberry } from "./noise.js";
import { PAPER, INKS } from "./defaults.js";

export const LITE_DEFAULTS = {
  inkA: INKS["pink-blue"][0],
  inkB: INKS["pink-blue"][1],
  paper: PAPER,
  mids: 0.7,
  grain: 0.05,
  desaturate: false,
  seed: 1,
  zIndex: 2147482000
};

const CLASS = "fluoro-lite-layer";

// a small transparent tile with ink-colored specks, repeated across the screen
function grainTile(color, density, seed) {
  const size = 180;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  const img = g.createImageData(size, size);
  const [r, gr, b] = hexRgb(color);
  const rand = mulberry(seed * 13 + 5);
  for (let i = 0; i < size * size; i++) {
    if (rand() < density) {
      const p = i * 4;
      img.data[p] = r;
      img.data[p + 1] = gr;
      img.data[p + 2] = b;
      img.data[p + 3] = 150 + rand() * 105;
    }
  }
  g.putImageData(img, 0, 0);
  return c.toDataURL();
}

// where the two inks overprint: each channel multiplied, like ink on ink
function overprint(a, b) {
  const x = hexRgb(a);
  const y = hexRgb(b);
  return "rgb(" + x.map((v, i) => Math.round((v * y[i]) / 255)).join(",") + ")";
}

// each layer blends with everything painted below it, in this order:
// push the midtones toward ink a, lift the blacks to the overprint color of
// both inks, then lay paper and grain together in one multiply.
// three layers, all blend modes browsers can run on the gpu. the optional
// desaturate layer uses "saturation", which safari draws in software and can
// make pages stutter, so it's off unless a colorful site needs it
function layers(o) {
  const list = [
    `background:${o.inkA};mix-blend-mode:overlay;opacity:${o.mids}`,
    `background:${overprint(o.inkA, o.inkB)};mix-blend-mode:screen`,
    `background-color:${o.paper};background-image:url(${grainTile(o.inkA, o.grain, o.seed)});mix-blend-mode:multiply`
  ];
  if (o.desaturate) list.unshift("background:#808080;mix-blend-mode:saturation");
  return list;
}

export function applyLite(options = {}) {
  removeLite();
  const o = { ...LITE_DEFAULTS, ...options };
  // the layers must be loose children of <html>, not wrapped in one container:
  // a wrapper with a z-index would only blend the layers with each other
  layers(o).forEach((css) => {
    const el = document.createElement("div");
    el.className = CLASS;
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = `position:fixed;inset:0;pointer-events:none;z-index:${o.zIndex};${css}`;
    document.documentElement.appendChild(el);
  });
}

export function removeLite() {
  document.querySelectorAll(`.${CLASS}`).forEach((el) => el.remove());
}
