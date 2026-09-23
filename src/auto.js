// script-tag build: <script src="https://cdn.jsdelivr.net/npm/fluoro-riso" defer></script>
// optional attributes: data-inks="orange-teal", data-ink-a, data-ink-b, data-paper, data-grain,
// data-misregistration, data-target, data-button="false"

import * as Fluoro from "./index.js";
import { INKS } from "./defaults.js";

const d = (document.currentScript && document.currentScript.dataset) || {};
const preset = INKS[d.inks] || [];
const options = {};
if (d.inkA || preset[0]) options.inkA = d.inkA || preset[0];
if (d.inkB || preset[1]) options.inkB = d.inkB || preset[1];
if (d.paper) options.paper = d.paper;
if (d.grain) options.grain = parseFloat(d.grain);
if (d.misregistration) options.misregistration = parseFloat(d.misregistration);
if (d.target) options.target = d.target;

// page helpers use the script-tag settings unless a call passes its own
window.Fluoro = {
  ...Fluoro,
  options,
  apply: (o) => Fluoro.apply({ ...options, ...o }),
  remove: (o) => Fluoro.remove({ ...options, ...o }),
  toggle: (o) => Fluoro.toggle({ ...options, ...o })
};

function init() {
  if (d.button === "false") return;
  const style = document.createElement("style");
  style.textContent = Fluoro.buttonStyles(options);
  document.head.appendChild(style);
  // the button goes after <body>, outside anything that gets printed, so it stays fixed in safari and firefox
  document.documentElement.appendChild(Fluoro.createButton(options));
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
