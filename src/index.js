// fluoro: riso-fy (almost) anything

export { filterMarkup, svgMarkup, filterUrl, FILTER_DEFAULTS } from "./filter.js";
export { printImage, coverage, makeLayer, composite, PRINT_DEFAULTS } from "./print.js";
export { mount, apply, remove, toggle, isOn, onChange, createButton, buttonStyles, pageTarget, needsBodyTarget } from "./page.js";
export { hexRgb, channelFor, pickChannels } from "./color.js";
export { makeBayer, bayer, dotScreen } from "./screens.js";
export { mulberry, noiseArr } from "./noise.js";
export { PAPER, INKS, FILTER_ID } from "./defaults.js";
