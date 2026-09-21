// threshold screens that turn a 0..1 coverage value into ink or no ink

function makeBayer(n) {
  if (n === 1) return [[0]];
  var p = makeBayer(n / 2), h = n / 2, m = [], y, x;
  for (y = 0; y < n; y++) m.push(new Array(n));
  for (y = 0; y < h; y++) {
    for (x = 0; x < h; x++) {
      var v = 4 * p[y][x];
      m[y][x] = v; m[y][x + h] = v + 2; m[y + h][x] = v + 3; m[y + h][x + h] = v + 1;
    }
  }
  return m;
}

var bayer = makeBayer(8);

// rotated dot screen, returns a threshold between 0 and 1
function dotScreen(x, y, angle, cell) {
  var c = Math.cos(angle), s = Math.sin(angle);
  var u = (x * c + y * s) / cell;
  var v = (-x * s + y * c) / cell;
  return (Math.cos(u * 6.283185) + Math.cos(v * 6.283185)) / 4 + 0.5;
}
