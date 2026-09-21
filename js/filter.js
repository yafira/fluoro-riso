// svg filter version of the same idea, applied to live DOM

// svg filter, rebuilt from the current inks
function invRows(ch) {
  var r = [0, 0, 0, 0, 1]; r[ch] = -1;
  var row = r.join(" ");
  return row + "  " + row + "  " + row + "  0 0 0 0 1";
}

function tintRows(rgb) {
  return rgb.map(function (v) { return (-(1 - v / 255)).toFixed(3) + " 0 0 0 1"; }).join("  ") + "  0 0 0 0 1";
}

function inkFilter(tag, ch, rgb, seed, dx, dy, gr) {
  return '<feColorMatrix in="SourceGraphic" type="matrix" values="' + invRows(ch) + '" result="cov' + tag + '"/>' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="' + seed + '" result="n' + tag + '0"/>' +
    '<feColorMatrix in="n' + tag + '0" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="n' + tag + '"/>' +
    '<feComposite in="cov' + tag + '" in2="n' + tag + '" operator="arithmetic" k1="0" k2="1" k3="' + gr + '" k4="' + (-gr / 2) + '" result="j' + tag + '"/>' +
    '<feComponentTransfer in="j' + tag + '" result="b' + tag + '"><feFuncR type="discrete" tableValues="0 1"/></feComponentTransfer>' +
    '<feColorMatrix in="b' + tag + '" type="matrix" values="' + tintRows(rgb) + '" result="t' + tag + '"/>' +
    '<feOffset in="t' + tag + '" dx="' + dx + '" dy="' + dy + '" result="ink' + tag + '"/>';
}

function buildFilter() {
  var ch = channels(), m = state.mis, gr = state.fgrain;
  $("filterHost").innerHTML =
    '<filter id="riso" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
    '<feFlood flood-color="' + PAPER + '" result="paper"/>' +
    inkFilter("A", ch[0], hexRgb(state.inkA), (state.seed * 3) % 997 + 1, 0, 0, gr) +
    inkFilter("B", ch[1], hexRgb(state.inkB), (state.seed * 5) % 991 + 2, m, Math.round(m / 2), gr) +
    '<feBlend in="inkA" in2="paper" mode="multiply" result="p1"/>' +
    '<feBlend in="inkB" in2="p1" mode="multiply"/>' +
    '</filter>';
}
