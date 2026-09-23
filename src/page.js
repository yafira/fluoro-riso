// riso-fy a live page: mount the filter, apply it to the page or to chosen elements

import { svgMarkup, filterUrl, FILTER_DEFAULTS } from "./filter.js";

const originals = new WeakMap();
const listeners = new Set();
let current = false;

// the root element is the default target: a filter there doesn't break position: fixed children
function resolveTargets(target) {
  if (!target) return [document.documentElement];
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

export function apply(options = {}) {
  mount(options);
  const url = filterUrl(options.id);
  resolveTargets(options.target).forEach((el) => {
    if (!originals.has(el)) originals.set(el, el.style.filter);
    el.style.filter = url;
  });
  setState(true);
}

export function remove(options = {}) {
  resolveTargets(options.target).forEach((el) => {
    el.style.filter = originals.get(el) || "";
    originals.delete(el);
  });
  setState(false);
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
