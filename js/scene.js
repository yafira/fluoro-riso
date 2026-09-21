// built-in sample image, drawn with canvas paths

function drawScene(c) {
  c.width = 640; c.height = 440;
  var g = c.getContext("2d");
  var sky = g.createLinearGradient(0, 0, 0, 440);
  sky.addColorStop(0, "#6ec1e4"); sky.addColorStop(0.55, "#fdeccf"); sky.addColorStop(1, "#f9c49a");
  g.fillStyle = sky; g.fillRect(0, 0, 640, 440);
  var sun = g.createRadialGradient(440, 170, 10, 440, 170, 120);
  sun.addColorStop(0, "#fff6b8"); sun.addColorStop(0.5, "#ffc25a"); sun.addColorStop(1, "rgba(255,160,80,0)");
  g.fillStyle = sun; g.fillRect(0, 0, 640, 440);
  g.fillStyle = "#fffdf7";
  [[120, 90, 62, 22], [190, 112, 48, 17], [520, 64, 56, 19], [82, 124, 40, 14]].forEach(function (e) {
    g.beginPath(); g.ellipse(e[0], e[1], e[2], e[3], 0, 0, Math.PI * 2); g.fill();
  });
  g.fillStyle = "#8a5fb0";
  g.beginPath(); g.moveTo(0, 300); g.bezierCurveTo(120, 226, 240, 272, 360, 250);
  g.bezierCurveTo(470, 232, 560, 282, 640, 254); g.lineTo(640, 440); g.lineTo(0, 440); g.fill();
  g.fillStyle = "#2f8f6d";
  g.beginPath(); g.moveTo(0, 340); g.bezierCurveTo(140, 290, 260, 350, 400, 318);
  g.bezierCurveTo(500, 296, 580, 330, 640, 312); g.lineTo(640, 440); g.lineTo(0, 440); g.fill();
  g.fillStyle = "#1d5a52";
  g.beginPath(); g.moveTo(0, 392); g.bezierCurveTo(160, 360, 300, 410, 460, 384);
  g.bezierCurveTo(540, 372, 600, 390, 640, 380); g.lineTo(640, 440); g.lineTo(0, 440); g.fill();
  g.fillStyle = "#173f3a";
  [[80, 330], [128, 346], [520, 360], [566, 352]].forEach(function (t) {
    g.beginPath(); g.moveTo(t[0], t[1] - 60); g.lineTo(t[0] - 20, t[1]); g.lineTo(t[0] + 20, t[1]); g.closePath(); g.fill();
  });
}
