// seeded noise, so the same seed always pulls the same print

export function mulberry(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function noiseArr(n, seed) {
  const r = mulberry(seed);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = r();
  return a;
}
