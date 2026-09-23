// svg filter that riso-fies live markup, built as a plain string
// no dom access, so it also runs on the server (next.js layouts, static builds)

import { hexRgb, pickChannels } from "./color.js";
import { PAPER, INKS, FILTER_ID } from "./defaults.js";

export const FILTER_DEFAULTS = {
  id: FILTER_ID,
  inkA: INKS["pink-blue"][0],
  inkB: INKS["pink-blue"][1],
  paper: PAPER,
  grain: 1.5,
  misregistration: 2,
  direction: [1, 0.5],
  seed: 1
};

// invert the channel the ink absorbs, so 1 means full ink
// alpha minus the channel, so transparent areas (most page backgrounds) count as paper, not black
function invRows(ch) {
  const r = [0, 0, 0, 1, 0];
  r[ch] = -1;
  const row = r.join(" ");
  return `${row}  ${row}  ${row}  0 0 0 0 1`;
}

// turn a white/black mask into paper/ink
function tintRows(rgb) {
  return rgb.map((v) => `${(-(1 - v / 255)).toFixed(3)} 0 0 0 1`).join("  ") + "  0 0 0 0 1";
}

function inkFilter(tag, ch, rgb, seed, dx, dy, gr) {
  return (
    `<feColorMatrix in="SourceGraphic" type="matrix" values="${invRows(ch)}" result="cov${tag}"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="${seed}" result="n${tag}0"/>` +
    `<feColorMatrix in="n${tag}0" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="n${tag}"/>` +
    `<feComposite in="cov${tag}" in2="n${tag}" operator="arithmetic" k1="0" k2="1" k3="${gr}" k4="${-gr / 2}" result="j${tag}"/>` +
    `<feComponentTransfer in="j${tag}" result="b${tag}"><feFuncR type="discrete" tableValues="0 1"/></feComponentTransfer>` +
    `<feColorMatrix in="b${tag}" type="matrix" values="${tintRows(rgb)}" result="t${tag}"/>` +
    `<feOffset in="t${tag}" dx="${dx}" dy="${dy}" result="ink${tag}"/>`
  );
}

// the <filter> element on its own
export function filterMarkup(options = {}) {
  const o = { ...FILTER_DEFAULTS, ...options };
  const ch = pickChannels(o.inkA, o.inkB);
  const m = o.misregistration;
  const [ax, ay] = o.direction;
  return (
    `<filter id="${o.id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
    `<feFlood flood-color="${o.paper}" result="paper"/>` +
    inkFilter("A", ch[0], hexRgb(o.inkA), ((o.seed * 3) % 997) + 1, 0, 0, o.grain) +
    inkFilter("B", ch[1], hexRgb(o.inkB), ((o.seed * 5) % 991) + 2, Math.round(m * ax), Math.round(m * ay), o.grain) +
    `<feBlend in="inkA" in2="paper" mode="multiply" result="p1"/>` +
    `<feBlend in="inkB" in2="p1" mode="multiply"/>` +
    `</filter>`
  );
}

// a hidden <svg> holding the filter, ready to drop into a page
export function svgMarkup(options = {}) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" ` +
    `style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none">` +
    filterMarkup(options) +
    `</svg>`
  );
}

// the css value that points at the filter
export function filterUrl(id = FILTER_ID) {
  return `url(#${id})`;
}
