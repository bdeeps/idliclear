// Shared parts for IdliClear: the models (model.js), chart boards and the 3D pieces every chapter
// uses: the idli itself with a sponge cut face, steel vessels, grains and glowing dots.
import { THREE, M, clamp, lerp } from './kit.js';

export * from './model.js';
export { THREE, M, clamp, lerp };
export const TAU = Math.PI * 2;

export const COL = {
  rice: '#f4f1e8', dal: '#f3e7c4', batter: '#f1ead8', idli: '#fbf8f0', water: '#6fb6ff', steam: '#cfe8ff',
  sugar: '#ffd166', acid: '#ff7a8a', gas: '#8ef0ff', gum: '#8ef0c0', leuco: '#8fb0ff', late: '#ff8a5c',
  good: '#5ce1a9', bad: '#ff6b6b', text: '#e8eef8', temp: '#ffb547', steel: '#c9ced6', stone: '#5b5f66',
};
export const hex = (c) => new THREE.Color(c).getHex();
export const fmtH = (h) => (h === Infinity ? 'never' : h < 1 ? Math.round(h * 60) + ' min' : h.toFixed(1).replace('.0', '') + ' h');
export const fmtN = (n) => { if (n < 1) return '0'; const e = Math.floor(Math.log10(n)), m = n / Math.pow(10, e); const sup = String(e).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]); return (m < 1.5 ? '' : m.toFixed(0) + ' × ') + '10' + sup; };
export const smoothK = (k) => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };
export function rng(seed = 1) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// ---------------------------------------------------------------- views
// Every chapter frames its model in the lower part of the stage (the readout sits upper left) and
// floats its chart upper right. Scenes span about x −5…5, y 0…5.5.
export const VIEW = { pos: [0, 5.2, 10.4], target: [0, 2.3, 0] };
export const REEL_VIEW = { pos: [0, 4.6, 9.2], target: [0, 2.5, 0] };
export const CHART = { w: 4.4, h: 3.16, px: 440, py: 316 };
export const CHART_POS = [3.0, 7.0, 0];
export const inReel = () => document.body.classList.contains('gb-reel');
const tallReel = (stage) => inReel() && stage.camera.aspect < 0.75;
// The readout covers the upper left of the stage, so the picture is shifted down: by 17% of the
// stage height on a desktop, 22% on a phone, 8% in a tall reel (where the chart floats on top).
export function fitNarrow(stage, minor = []) {
  const narrow = stage.host.clientWidth < 560, r = inReel();
  minor.forEach((l) => { if (l) l.visible = !narrow; });
  const y = r ? (tallReel(stage) ? -0.08 : 0.02) : narrow ? -0.22 : -0.17;
  if (!stage.shift || stage.shift[1] !== y) stage.setShift(0, y);
  // on a phone the readout takes over half the stage, so the model is drawn a little smaller
  const k = narrow && !r ? 0.8 : 1;
  if (stage.root.scale.x !== k) stage.root.scale.setScalar(k);
  return narrow;
}
// Place the chart in screen space, facing the camera. Normal page: upper right, beside the readout
// (hidden when the stage is too narrow for both). Wide reel: hidden. Tall reel: across the top.
const tmp = new THREE.Vector3(), dir = new THREE.Vector3(), up = new THREE.Vector3(), right = new THREE.Vector3();
export function placeChart(stage, chart, narrow = false) {
  const m = chart.mesh, cam = stage.camera, reel = inReel();
  if (reel && !tallReel(stage)) { m.visible = false; return false; }
  const wpx = stage.host.clientWidth, hpx = stage.host.clientHeight;
  const { width, height } = m.geometry.parameters;
  let cw, cx, cy;   // chart width, centre x and centre y as fractions of the stage (from the centre, up positive)
  if (reel) { cw = Math.min(0.86, (0.26 * hpx * (width / height)) / wpx); cx = 0; cy = 0.29; }
  else {
    const avail = wpx - 452 - 16;   // right of the readout (max 420 px wide + margins)
    if (narrow || avail < 190) { m.visible = false; return false; }
    const px = Math.min(avail, 0.3 * hpx * (width / height), 380), ph = px * (height / width);
    cw = px / wpx; cx = 0.5 - (16 + px / 2) / wpx; cy = 0.5 - (78 + ph / 2) / hpx;
  }
  const D = cam.position.distanceTo(stage.controls.target), H = 2 * D * Math.tan((cam.fov * Math.PI) / 360), W = H * cam.aspect;
  cam.getWorldDirection(dir); up.set(0, 1, 0).applyQuaternion(cam.quaternion); right.set(1, 0, 0).applyQuaternion(cam.quaternion);
  const sh = stage.shift ? stage.shift[1] : 0;
  tmp.copy(cam.position).addScaledVector(dir, D).addScaledVector(right, cx * W).addScaledVector(up, H * (cy - sh));
  m.position.copy(tmp); m.quaternion.copy(cam.quaternion); m.scale.setScalar((cw * W) / width); m.visible = true;
  return true;
}

// ---------------------------------------------------------------- boards (live charts in 3D)
export function panelBg(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,.9)'; g.fillRect(0, 0, w, h); }
export function board(root, w, h, pxW, pxH, draw, pos) {
  const c = document.createElement('canvas'); c.width = pxW * 2; c.height = pxH * 2;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const redraw = () => { g.setTransform(2, 0, 0, 2, 0, 0); draw(g, pxW, pxH); tex.needsUpdate = true; };
  redraw();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide, depthTest: false }));
  m.renderOrder = 20; m.position.set(...pos); root.add(m);
  return { tex, redraw, canvas: c, mesh: m, home: pos };
}
export function axes(g, w, h, { x0 = 54, x1 = w - 32, y0 = h - 40, y1 = 62, xMax, yMax, xMin = 0, yMin = 0, xTicks, yTicks, xFmt = String, yFmt = String, logY = false }) {
  const L = Math.log10;
  const X = (x) => x0 + ((x - xMin) / (xMax - xMin)) * (x1 - x0);
  const Y = logY ? (y) => y0 - ((L(Math.max(y, 1e-30)) - L(yMin)) / (L(yMax) - L(yMin))) * (y0 - y1) : (y) => y0 - ((y - yMin) / (yMax - yMin)) * (y0 - y1);
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.fillStyle = 'rgba(255,255,255,.65)'; g.font = '14px sans-serif';
  for (const t of xTicks) { g.beginPath(); g.moveTo(X(t), y1); g.lineTo(X(t), y0); g.stroke(); const s = xFmt(t); g.fillText(s, X(t) - g.measureText(s).width / 2, y0 + 18); }
  for (const t of yTicks) { g.beginPath(); g.moveTo(x0, Y(t)); g.lineTo(x1, Y(t)); g.stroke(); const s = yFmt(t); g.fillText(s, x0 - 7 - g.measureText(s).width, Y(t) + 5); }
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
  return { X, Y, x0, x1, y0, y1 };
}
export function title(g, text, sub = '') {
  g.fillStyle = COL.text; g.font = 'bold 19px sans-serif'; g.fillText(text, 14, 26);
  if (sub) { g.font = '13px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText(sub, 14, 44); }
}
export function line(g, pts, X, Y, col, wdt = 4, dash = null) {
  if (pts.length < 2) return;
  g.strokeStyle = col; g.lineWidth = wdt; g.setLineDash(dash || []); g.lineJoin = 'round'; g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
  g.stroke(); g.setLineDash([]);
}
export function dot(g, x, y, col, r = 7) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
export function note(g, text, x, y, col = 'rgba(255,255,255,.8)', font = 13, align = 'left') {
  g.font = `${font}px sans-serif`; g.fillStyle = col;
  const w = g.measureText(text).width;
  g.fillText(text, align === 'right' ? x - w : align === 'center' ? x - w / 2 : x, y);
}
export function dashH(g, X0, X1, y, col = 'rgba(255,255,255,.5)') { g.strokeStyle = col; g.setLineDash([6, 5]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(X0, y); g.lineTo(X1, y); g.stroke(); g.setLineDash([]); }

// ---------------------------------------------------------------- 3D pieces
// Glowing or shaded dots: one instanced mesh, each with its own colour and size.
export function dots(n, r, color = 0xffffff, seg = 8, lit = false, opts = {}) {
  const mat = lit ? new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, ...opts }) : new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, ...opts });
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), mat, n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  const o = new THREE.Object3D(), col = new THREE.Color(color);
  for (let i = 0; i < n; i++) mesh.setColorAt(i, col);
  mesh.place = (i, x, y, z, s = 1, sy = s, ry = 0, rz = 0, sz = s) => { o.position.set(x, y, z); o.rotation.set(0, ry, rz); o.scale.set(Math.max(1e-4, s), Math.max(1e-4, sy), Math.max(1e-4, sz)); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); };
  mesh.hide = (i) => mesh.place(i, 0, -99, 0, 1e-4);
  mesh.tint = (i, c) => mesh.setColorAt(i, c);
  mesh.done = () => { mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; };
  return mesh;
}
// A canvas of sponge: cream crumb full of gas cells. Used on the cut face of an idli.
export function spongeTexture(seed = 5, size = 512, holes = 520, tint = '#fbf7ec') {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), rnd = rng(seed);
  g.fillStyle = tint; g.fillRect(0, 0, size, size);
  for (let i = 0; i < holes; i++) {
    const x = rnd() * size, y = rnd() * size, r = 2 + Math.pow(rnd(), 2.2) * 15;
    for (const [dx, dy] of [[0, 0], [size, 0], [-size, 0], [0, size], [0, -size]]) {
      const gr = g.createRadialGradient(x + dx - r * 0.25, y + dy - r * 0.25, r * 0.1, x + dx, y + dy, r);
      gr.addColorStop(0, '#8f8266'); gr.addColorStop(0.75, '#c2b79c'); gr.addColorStop(1, '#efe7d4');
      g.fillStyle = gr; g.beginPath(); g.ellipse(x + dx, y + dy, r, r * (0.7 + rnd() * 0.3), rnd() * 3, 0, TAU); g.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.anisotropy = 4;
  return tex;
}
// The outline of an idli: a lens with a domed top (the side that sat in the mould) and a flatter
// base. Returns [r, y] pairs from the bottom centre round to the top centre. R = radius, H = height.
export function idliProfile(R = 1, H = 0.36, n = 14) {
  const p = [[0, 0]];
  for (let i = 1; i <= 5; i++) { const a = (i / 5) * (Math.PI / 2); p.push([R * (0.72 + 0.28 * Math.sin(a)), H * 0.22 * (1 - Math.cos(a))]); }
  for (let i = 1; i <= n; i++) { const a = (i / n) * (Math.PI / 2); p.push([R * Math.cos(a), H * (0.22 + 0.78 * Math.sin(a))]); }
  p[p.length - 1][0] = 0;
  return p;
}
// A solid of revolution about Y from a profile, swept through phiLength, with sponge cut faces.
// g.skin and g.face are the materials.
export function idliMesh({ R = 1, H = 0.36, phiStart = 0, phiLength = TAU, tex = null, color = 0xfbf8f0, profile = null } = {}) {
  const g = new THREE.Group(), prof = profile || idliProfile(R, H);
  const skin = new THREE.MeshStandardMaterial({ color, roughness: 0.82, side: THREE.DoubleSide });
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 56, phiStart, phiLength), skin);
  body.castShadow = body.receiveShadow = true; g.add(body); g.skin = skin; g.body = body;
  if (phiLength < TAU - 1e-3) {
    const sh = new THREE.Shape(); prof.forEach(([r, y], i) => (i ? sh.lineTo(r, y) : sh.moveTo(r, y))); sh.closePath();
    const face = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex, roughness: 0.9, side: THREE.DoubleSide });
    if (tex) { tex.repeat.set(0.55, 0.55); }
    for (const phi of [phiStart, phiStart + phiLength]) {
      const f = new THREE.Mesh(new THREE.ShapeGeometry(sh), face); f.rotation.y = phi - Math.PI / 2; f.receiveShadow = true; g.add(f);
    }
    g.face = face;
  }
  return g;
}
// An open steel vessel standing on y = 0: wall, floor and a rolled rim. phiLength < 2π cuts it away.
export function steelPot(R, H, { phiStart = 0, phiLength = TAU, color = 0xc9ced6, rim = true } = {}) {
  const g = new THREE.Group(), steel = M.metal(color, { side: THREE.DoubleSide, roughness: 0.32 });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 64, 1, true, phiStart, phiLength), steel); wall.position.y = H / 2; wall.castShadow = true; g.add(wall);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.06, 64, 1, false, phiStart, phiLength), steel); base.position.y = 0.03; g.add(base);
  if (rim) { const t = new THREE.Mesh(new THREE.TorusGeometry(R + 0.03, 0.06, 10, 64, phiLength), M.metal(0xdfe3ea)); t.rotation.x = Math.PI / 2; t.rotation.z = -(phiStart + phiLength) + Math.PI / 2; t.position.y = H; g.add(t); }
  g.steel = steel; g.wall = wall;
  return g;
}
export function counterTop(parent, w = 11.4, d = 5, color = 0x3a2f28) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, d), M.matte(color)); m.position.y = 0.15; m.receiveShadow = true; parent.add(m);
  return m;
}
// A see-through tank for the microscope view.
export function tank(g, bx, y0, y1, bz, color = 0xf1ead8) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(bx * 2, y1 - y0, bz * 2), M.clear(color, 0.07)); b.position.y = (y0 + y1) / 2; g.add(b);
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry), new THREE.LineBasicMaterial({ color: 0x8a8f7a, transparent: true, opacity: 0.6 })); e.position.copy(b.position); g.add(e);
  return b;
}
