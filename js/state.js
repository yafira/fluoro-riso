// one settings object shared by the page, the canvas pipeline and the svg filter

var state = {
  inkA: "#ff48b0", inkB: "#0078bf",
  mode: "halftone", cell: 6, angle: 0, contrast: 1.2,
  grain: 0.08, mis: 2, opacity: 0.92, orig: false,
  fgrain: 1.5, fon: true, seed: 1,
  // set by Reprint: registration direction, ink density drift, screen phase per layer
  ax: 1, ay: 0.5, jit: 0, phase: [[0, 0], [0, 0]]
};
