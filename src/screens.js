// threshold screens that turn a 0..1 coverage value into ink or no ink

export function makeBayer(n) {
  if (n === 1) return [[0]];
  const p = makeBayer(n / 2);
  const h = n / 2;
  const m = [];
  for (let y = 0; y < n; y++) m.push(new Array(n));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < h; x++) {
      const v = 4 * p[y][x];
      m[y][x] = v;
      m[y][x + h] = v + 2;
      m[y + h][x] = v + 3;
      m[y + h][x + h] = v + 1;
    }
  }
  return m;
}

export const bayer = makeBayer(8);

// rotated dot screen, returns a threshold between 0 and 1
export function dotScreen(x, y, angle, cell) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const u = (x * c + y * s) / cell;
  const v = (-x * s + y * c) / cell;
  return (Math.cos(u * 6.283185) + Math.cos(v * 6.283185)) / 4 + 0.5;
}
