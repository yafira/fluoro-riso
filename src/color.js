// color math: hex parsing and which channel each ink absorbs

export function hexRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// the channel an ink absorbs most is the one whose value is lowest in the ink color
export function channelFor(rgb) {
  return rgb.indexOf(Math.min(rgb[0], rgb[1], rgb[2]));
}

// if both inks pick the same channel, the second takes the next one
export function pickChannels(inkA, inkB) {
  const a = channelFor(hexRgb(inkA));
  let b = channelFor(hexRgb(inkB));
  if (b === a) b = (a + 1) % 3;
  return [a, b];
}
