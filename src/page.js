// riso-fy a live page: mount the filter, apply it to the page or to chosen elements

import { svgMarkup, filterUrl, FILTER_DEFAULTS } from "./filter.js";
import { applyLite, removeLite } from "./lite.js";

const originals = new WeakMap();
const listeners = new Set();
let current = false;

// chrome-based browsers are the only ones that keep an svg filter on the root when the page
// has fixed elements; safari and firefox-based browsers (like zen) drop it, so they print the body
export function needsBodyTarget() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const chromium = /Chrome|Chromium/.test(ua) && !/CriOS|EdgiOS|FxiOS/.test(ua);
  return !chromium;
}

// the whole page: the root element in chrome-based browsers, since a filter there keeps
// position: fixed children fixed; the body everywhere else
export function pageTarget() {
  return needsBodyTarget() ? document.body : document.documentElement;
}

function resolveTargets(target) {
  if (!target) return [pageTarget()];
  if (typeof target === "string") return Array.from(document.querySelectorAll(target));
  if (target instanceof Element) return [target];
  return Array.from(target);
}

// add the hidden svg to the page, or rebuild it when the inks change
export function mount(options = {}) {
  const id = options.id || FILTER_DEFAULTS.id;
  const holder = document.getElementById(`${id}-svg`);
  const wrap = document.createElement("div");
  wrap.innerHTML = svgMarkup(options);
  const svg = wrap.firstChild;
  svg.id = `${id}-svg`;
  if (holder) holder.replaceWith(svg);
  else document.body.appendChild(svg);
  return svg;
}

// mode "lite" lays blend layers over the page instead of filtering it: faster,
// works with fixed elements everywhere, but grain and tint rather than real separations
export function apply(options = {}) {
  if (options.mode === "lite") {
    applyLite(options);
    setState(true);
    return;
  }
  mount(options);
  const url = filterUrl(options.id);
  resolveTargets(options.target).forEach((el) => {
    if (!originals.has(el)) originals.set(el, el.style.filter);
    el.style.filter = url;
  });
  if (!options.target) setPaper(options.paper || FILTER_DEFAULTS.paper);
  setState(true);
}

export function remove(options = {}) {
  if (options.mode === "lite") {
    removeLite();
    setState(false);
    return;
  }
  resolveTargets(options.target).forEach((el) => {
    el.style.filter = originals.get(el) || "";
    originals.delete(el);
  });
  if (!options.target) setPaper(null);
  setState(false);
}

// the canvas behind the page isn't part of any element, so it never gets filtered;
// painting it paper-colored keeps short pages and margins from showing white
let savedBackground = null;
function setPaper(color) {
  const root = document.documentElement.style;
  if (color) {
    if (savedBackground === null) savedBackground = root.backgroundColor;
    root.backgroundColor = color;
  } else if (savedBackground !== null) {
    root.backgroundColor = savedBackground;
    savedBackground = null;
  }
}

export function toggle(options = {}) {
  if (current) remove(options);
  else apply(options);
  return current;
}

export function isOn() {
  return current;
}

// call fn(on) whenever the page is printed or restored; returns an unsubscribe function
export function onChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function setState(on) {
  current = on;
  listeners.forEach((fn) => fn(on));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("fluoro:change", { detail: { on } }));
  }
}

// a ready-made toggle button; returns the element so sites can place or restyle it
// remember: false turns off saving the choice in localStorage
export function createButton(options = {}) {
  const labels = options.labels || ["Riso-fy", "Show original"];
  const key = options.storageKey || "fluoro:on";
  const remember = options.remember !== false;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "fluoro-button";
  const sync = (on) => { btn.textContent = on ? labels[1] : labels[0]; };
  sync(current);
  onChange(sync);

  btn.addEventListener("click", () => {
    const on = toggle(options);
    if (remember) {
      try { localStorage.setItem(key, on ? "1" : "0"); } catch (e) {}
    }
  });

  if (remember) {
    let saved = false;
    try { saved = localStorage.getItem(key) === "1"; } catch (e) {}
    if (saved) apply(options);
  }
  return btn;
}

// default look for the floating button; :where() keeps specificity at zero so sites can override it
export function buttonStyles(options = {}) {
  const inkA = options.inkA || FILTER_DEFAULTS.inkA;
  const inkB = options.inkB || FILTER_DEFAULTS.inkB;
  return `
:where(.fluoro-button) {
  position: fixed;
  right: 16px;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  z-index: 2147483000;
  padding: 12px 18px;
  font: 600 15px/1 system-ui, -apple-system, sans-serif;
  color: #1b1b1b;
  background: ${inkA};
  border: 2px solid #1b1b1b;
  border-radius: 999px;
  box-shadow: 3px 3px 0 ${inkB};
  cursor: pointer;
}
:where(.fluoro-button):focus-visible { outline: 3px solid ${inkB}; outline-offset: 3px; }`;
}
