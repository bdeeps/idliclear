// Chapter 5: steaming. An idli cooker cut open: water boiling at the bottom, a stand of three
// perforated plates with four idlis each, a lid on top, and beside it one idli cut through.
// Scale: 1 unit ≈ 3 cm for the cooker. The cut idli is drawn larger.
// Physics (model.js): steam at 100 °C condenses on the batter and releases 2,257 kJ per kg, so the
// surface is at 100 °C almost at once. Heat then conducts inwards: the centre temperature is the
// series solution for a slab heated from both faces with thermal diffusivity 1.6 × 10⁻⁷ m²/s
// (typical for a wet starch foam). Rice starch gelatinises at about 65 to 78 °C; we call the idli
// done when its centre passes 85 °C. A 2.4 cm idli from room-temperature batter takes about
// 11 minutes, matching the 10 to 12 minutes cooks use.
// With the lid off, steam mixes with room air: we take about 80 °C around the idlis (an estimate).
import { THREE, M, COL, CHART, CHART_POS, TAU, hex, rng, board, panelBg, title, note, axes, line, dot, dashH, dots, idliMesh, idliProfile, steelPot, counterTop, fitNarrow, placeChart, slabT, meanT, setFrac, doneTime, steamNeeded, steamRise, GEL_T, DONE_T, LATENT, clamp, lerp } from '../idli.js';

const opts = (s) => ({ L: s.thick / 100, T0: s.from === 'fridge' ? 5 : 28, steamT: s.lid ? 100 : 80 });
const fmtMin = (sec) => (sec === Infinity ? 'never' : (sec / 60).toFixed(sec < 600 ? 1 : 0) + ' min');
const RAW = new THREE.Color(0xe9dfc2), SET = new THREE.Color(0xfdfbf5);

export default {
  id: 'steam',
  short: 'Steaming',
  title: 'Ten minutes in a cloud',
  subtitle: 'Steam condenses on the cool batter and pours heat into it. The bubbles swell, the starch sets around them, and the foam becomes a sponge.',
  view: { pos: [0, 5.6, 11.0], target: [0, 2.6, 0] },
  learn: `<p>Risen batter is ladled gently into the oiled hollows of an <b>idli plate</b>, the plates are stacked on their stand, and the stand goes into a pot with a little boiling water and a tight lid. Stirring hard would knock out the gas, so the batter is barely touched.</p>
    <p>The idlis never touch the water. They cook in <b>steam</b>. When steam at 100 °C meets cool batter it <b>condenses</b> back into water, and in doing so it hands over a huge amount of heat: <b>2,257 kilojoules for every kilogram</b>, the <b>latent heat</b> that went in when the water boiled. That is why steam cooks far faster than dry air at the same temperature. <a href="https://glassbox.how/boilclear/" target="_blank" rel="noopener">BoilClear</a> shows where that heat comes from.</p>
    <p>Inside the batter three things happen as the heat creeps inwards. The <b>gas cells swell</b>, because warm gas takes more room and water evaporates into the bubbles, so the idli puffs up. Between about 65 and 78 °C the rice <b>starch gelatinises</b>: its granules drink water, swell and stick together. The dal <b>proteins set</b>, like egg white. The wet foam is now a soft solid that keeps its holes.</p>
    <p>Heat has to travel from the surface to the middle, so a <b>thicker idli takes much longer</b>: double the thickness and the time goes up about four times. A normal idli needs about <b>10 to 12 minutes</b>. Test it with a wet finger or a knife: nothing should stick. Then rest it a minute or two and ease it out with a wet spoon.</p>
    <p class="tip"><b>Try it:</b> slide the minutes and watch the white, set layer grow inwards on the cut idli. Make it 4 cm thick. Use batter straight from the fridge. Then take the lid off.</p>`,
  terms: [
    { t: 'Condensation', d: 'A gas turning back to liquid. When steam condenses it gives out the heat it took in when it boiled.' },
    { t: 'Latent heat', d: 'Heat taken in or given out when a substance changes state without changing temperature. For water at 100 °C: 2,257 kJ per kg.' },
    { t: 'Gelatinisation', d: 'Starch granules absorbing hot water, swelling and losing their crystal order. It turns batter into a soft solid.' },
    { t: 'Conduction', d: 'Heat passing through a material from the hot side to the cold side.' },
    { t: 'Idli stand', d: 'A stack of perforated plates with shallow hollows, on a central rod, that holds the batter in the steam.' },
    { t: 'Sponge', d: 'A solid full of connected holes. A steamed idli is a sponge of cooked starch and protein.' },
  ],
  defaults: { min: 0, thick: 2.4, from: 'counter', lid: true },
  controls: [
    { key: 'min', type: 'range', label: 'Minutes in the steamer', min: 0, max: 25, step: 0.25, ends: ['0', '25 min'], fmt: (v) => v.toFixed(v % 1 ? 1 : 0) + ' min' },
    { key: 'thick', type: 'range', label: 'Thickness of the idli', min: 1.2, max: 4, step: 0.1, ends: ['thin', 'very thick'], fmt: (v) => `${v.toFixed(1)} cm · done in ${fmtMin(doneTime({ L: v / 100 }))} from 28 °C` },
    { key: 'from', type: 'seg', label: 'Batter comes from', options: [{ v: 'counter', label: 'The counter, 28 °C' }, { v: 'fridge', label: 'The fridge, 5 °C' }] },
    { key: 'lid', type: 'toggle', label: 'Lid on', hint: 'Lid off: steam mixes with air and the idlis sit at about 80 °C (an estimate).' },
  ],
  quiz: [
    { q: 'Why does steam at 100 °C cook an idli faster than hot air at 100 °C would?', options: ['Steam is hotter than 100 °C', 'Steam condenses on the batter and releases its latent heat', 'Steam is heavier', 'Air cannot touch batter'], answer: 1, why: 'Each kilogram of steam that condenses gives up 2,257 kJ. Hot dry air carries far less heat to the surface.' },
    { q: 'What turns the wet foam of batter into a solid sponge?', options: ['The salt dries it', 'Starch gelatinises and proteins set around the gas cells', 'The bubbles freeze', 'Acid dissolves the rice'], answer: 1, why: 'Between about 65 and 78 °C rice starch swells and gels, and dal proteins set. The structure holds its holes.' },
    { q: 'A thatte idli is wide but not much thicker than a normal idli. A very thick idli takes far longer. Why?', options: ['Wide idlis have more salt', 'Heat must conduct to the centre, and the time grows with the square of the thickness', 'Thick batter has no bubbles', 'Steam avoids thick idlis'], answer: 1, why: 'Conduction time goes as thickness squared. Width hardly matters because heat enters through the top and bottom faces.' },
  ],
  reel: [
    { ms: 6000, caption: 'Steam condenses on the batter and releases 2,257 kilojoules per kilogram. Starch sets around the bubbles in about ten minutes.', set: { thick: 2.4, from: 'counter', lid: true }, anim: { min: [0, 12] }, view: { pos: [0.6, 5.2, 9.4], target: [0.6, 2.9, 0] }, spin: 0.15 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const world = new THREE.Group(); world.position.set(0.1, 0.3, 0); world.scale.setScalar(0.76); root.add(world);
    const rnd = rng(17), col = new THREE.Color();
    counterTop(world, 12, 5.6);
    const PX = -2.0, Y = 0.3, LEG = 0.75, R = 2.5, H = 4.7, CUT = 2.1;
    // ---- burner and flame
    const burner = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 0.35, 32), M.matte(0x22252b)); burner.position.set(PX, Y + 0.18, 0); world.add(burner);
    const NF = 16, flames = [];
    for (let i = 0; i < NF; i++) { const a = (i / NF) * TAU, f = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.5, 8), M.glow(0x5fa8ff, { transparent: true, opacity: 0.85 })); f.position.set(PX + 1.0 * Math.sin(a), Y + 0.55, 1.0 * Math.cos(a)); world.add(f); flames.push(f); }
    for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU + 0.5, leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, LEG, 0.14), M.matte(0x30343c)); leg.position.set(PX + 2.0 * Math.sin(a), Y + LEG / 2, 2.0 * Math.cos(a)); world.add(leg); }
    // ---- the pot, cut away at the front
    const pot = steelPot(R, H, { phiStart: CUT / 2, phiLength: TAU - CUT }); pot.position.set(PX, Y + LEG, 0); world.add(pot);
    const WATER = 0.7;
    const water = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.05, R - 0.05, WATER, 48), new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.1, transparent: true, opacity: 0.5, depthWrite: false })); water.position.y = 0.06 + WATER / 2; pot.add(water);
    const NWB = 26, wb = dots(NWB, 0.07, 0xffffff, 8, false, { transparent: true, opacity: 0.7 }); pot.add(wb);
    const wbs = Array.from({ length: NWB }, () => ({ r: Math.sqrt(rnd()) * (R - 0.3), a: rnd() * TAU, ph: rnd() }));
    // ---- stand: rod, three plates, twelve idlis
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, H - 0.9, 12), M.metal(0xb9bec8)); rod.position.y = 0.06 + (H - 0.9) / 2 + 0.2; pot.add(rod);
    const feet = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 0.9, 16, 1, true), M.metal(0xb9bec8, { side: THREE.DoubleSide })); feet.position.y = 0.06 + 0.45; pot.add(feet);
    const TIERS = [1.25, 2.4, 3.55], IR = 0.86, idlis = [];
    const plateMat = M.metal(0xd5dae2, { side: THREE.DoubleSide, roughness: 0.35 });
    TIERS.forEach((ty, t) => {
      const tier = new THREE.Group(); tier.position.y = ty; tier.rotation.y = t * (Math.PI / 4); pot.add(tier);
      const disc = new THREE.Mesh(new THREE.RingGeometry(0.1, R - 0.25, 48), plateMat); disc.rotation.x = -Math.PI / 2; tier.add(disc);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + Math.PI / 4, x = 1.3 * Math.sin(a), z = 1.3 * Math.cos(a);
        // the hollow: a shallow steel dish with tiny steam holes, hanging below the plate
        const dish = new THREE.Mesh(new THREE.SphereGeometry(IR + 0.03, 24, 8, 0, TAU, Math.PI * 0.72, Math.PI * 0.28), plateMat); dish.scale.y = 0.55; dish.position.set(x, (IR + 0.03) * 0.55 * 0.63, z); tier.add(dish);
        const g = idliMesh({ profile: idliProfile(IR, 0.5).map(([r, y]) => [r, 0.5 - y]).reverse() });   // dome down, in the hollow
        g.position.set(x, -0.3, z); tier.add(g); idlis.push(g);
      }
    });
    // ---- lid
    const lid = new THREE.Group(); world.add(lid);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(R + 0.1, 48, 12, CUT / 2, TAU - CUT, 0, Math.PI / 2), M.metal(0xd5dae2, { side: THREE.DoubleSide, roughness: 0.3 })); dome.scale.y = 0.28; lid.add(dome);
    const lknob = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), M.plastic(0x22252b)); lknob.position.y = (R + 0.1) * 0.28 + 0.15; lid.add(lknob);
    // ---- steam
    const NS = 170, steam = dots(NS, 0.07, hex(COL.steam), 6, false, { transparent: true, opacity: 0.6, depthWrite: false }); world.add(steam);
    const sp = Array.from({ length: NS }, () => ({ r: 0.4 + Math.sqrt(rnd()) * (R - 0.6), a: rnd() * TAU, ph: rnd(), v: 0.6 + rnd() * 0.7, w: (rnd() - 0.5) * 1.2 }));
    // ---- one idli cut through, drawn large
    const DX = 3.3, DR = 1.75, DS = DR / 3.8;   // units per cm for the cut idli (7.6 cm across)
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.12, 48), M.metal(0xc9ced6, { roughness: 0.3 })); stand.position.set(DX, Y + 0.06, 0.6); world.add(stand);
    const face = document.createElement('canvas'); face.width = 512; face.height = 256;
    const fg = face.getContext('2d'), ftex = new THREE.CanvasTexture(face); ftex.colorSpace = THREE.SRGBColorSpace;
    const holes = Array.from({ length: 150 }, () => ({ u: rnd(), v: rnd(), r: 3 + Math.pow(rnd(), 2) * 13 }));
    let demo = null, demoL = 0;
    const makeDemo = (Lcm) => {
      if (demo) { world.remove(demo); demo.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
      const Hh = Lcm * DS;
      demo = idliMesh({ R: DR, H: Hh, phiStart: Math.PI / 2, phiLength: Math.PI, tex: ftex });
      ftex.repeat.set(1 / DR, 1 / Hh); ftex.wrapS = ftex.wrapT = THREE.ClampToEdgeWrapping;
      demo.position.set(DX, Y + 0.12, 0.6); world.add(demo); demoL = Lcm;
    };
    const paintFace = (o, tSec, puff) => {
      const W = 512, Hh = 256;
      for (let y = 0; y < Hh; y += 4) {
        const v = y / Hh, x = Math.abs(2 * v - 1), T = slabT(x, tSec, o), k = setFrac(T);
        col.copy(RAW).lerp(SET, k); fg.fillStyle = `rgb(${(col.r * 255) | 0},${(col.g * 255) | 0},${(col.b * 255) | 0})`; fg.fillRect(0, y, W, 4);
      }
      holes.forEach((h) => {
        const x = Math.abs(2 * h.v - 1), k = setFrac(slabT(x, tSec, o)), r = h.r * puff;
        fg.fillStyle = k > 0.5 ? 'rgba(170,158,132,.75)' : 'rgba(196,184,150,.55)'; fg.beginPath(); fg.arc(h.u * W, h.v * Hh, r, 0, TAU); fg.fill();
      });
      ftex.needsUpdate = true;
    };
    const lSteam = stage.label('steam, 100 °C', [PX + R + 1.3, Y + LEG + H - 0.5, 0.4], world, 'hot'); lSteam.element.style.setProperty('--c', COL.steam);
    const lWater = stage.label('boiling water', [PX + R + 0.2, Y + LEG + 0.4, 1.3], world);
    const lPlate = stage.label('idli plates on a stand', [PX - R - 0.2, Y + LEG + 2.5, 1.2], world);
    const lCut = stage.label('', [DX, Y + 2.35, 0.6], world, 'hot');
    const lCore = stage.label('', [DX, Y - 0.1, 2.9], world, 'hot'); lCore.element.style.setProperty('--c', COL.temp);

    let S = { ...this.defaults }, key = '', lidK = 1, fkey = '';
    const chart = board(root, CHART.w, CHART.h, CHART.px, CHART.py, (g, w, h) => {
      panelBg(g, w, h);
      const o = opts(S);
      title(g, 'Temperature inside one idli', `${S.thick.toFixed(1)} cm thick`);
      const { X, Y: YY, x0, x1 } = axes(g, w, h, { xMin: 0, xMax: 25, yMin: 0, yMax: 105, xTicks: [0, 5, 10, 15, 20, 25], yTicks: [0, 25, 50, 75, 100], xFmt: (v) => v + ' min', yFmt: (v) => v + '°' });
      g.fillStyle = 'rgba(255,209,102,.16)'; g.fillRect(x0, YY(GEL_T[1]), x1 - x0, YY(GEL_T[0]) - YY(GEL_T[1])); note(g, 'starch gelatinises', x1 - 6, YY(69), COL.sugar, 11, 'right');
      dashH(g, x0, x1, YY(DONE_T), COL.good); note(g, 'done: centre 85 °C', x1 - 6, YY(DONE_T) - 5, COL.good, 11, 'right');
      for (const [x, c, wd] of [[0.85, 'rgba(255,255,255,.45)', 2], [0.5, 'rgba(255,255,255,.7)', 2.5], [0, COL.temp, 4]]) { const pts = []; for (let m = 0; m <= 25; m += 0.5) pts.push([m, slabT(x, m * 60, o)]); line(g, pts, X, YY, c, wd); }
      note(g, 'near the surface', X(1.2), YY(100) + 14, 'rgba(255,255,255,.6)', 11); note(g, 'centre', X(5.2), YY(slabT(0, 312, o)) + 20, COL.temp, 12);
      dot(g, X(S.min), YY(slabT(0, S.min * 60, o)), COL.temp, 6);
    }, CHART_POS);

    return {
      update(dt, s, time) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s;
        const narrow = fitNarrow(stage, [lWater, lPlate]);
        placeChart(stage, chart, narrow);
        const o = opts(s), tSec = s.min * 60, Tc = slabT(0, tSec, o), Tm = meanT(tSec, o), puff = steamRise(Tm, o.T0), k = setFrac(Tc);
        if (demoL !== s.thick) makeDemo(s.thick);
        const fk = [s.min, s.thick, s.from, s.lid].join('|'); if (fk !== fkey) { fkey = fk; paintFace(o, tSec, 0.8 + 0.5 * (puff - 1) / 0.25); }
        demo.scale.y = puff; demo.skin.color.copy(RAW).lerp(SET, setFrac(slabT(0.9, tSec, o)));
        // idlis in the cooker: height from thickness (1 unit ≈ 3 cm), puffing as they heat
        const hy = ((s.thick * (IR / 3.8)) / 0.5) * puff;   // same proportions as a 7.6 cm idli
        const skinC = setFrac(slabT(0.9, tSec, o));
        idlis.forEach((g) => { g.scale.y = Math.min(hy, 1.9); g.skin.color.copy(RAW).lerp(SET, skinC); });
        // lid
        lidK += ((s.lid ? 1 : 0) - lidK) * (1 - Math.exp(-dt * 5));
        lid.position.set(PX + (1 - lidK) * -3.4, Y + LEG + H + 0.02 + (1 - lidK) * 0.6, (1 - lidK) * -1.0); lid.rotation.z = (1 - lidK) * 0.5;
        // boiling and steam
        wbs.forEach((b, i) => { const p = (time * 1.4 + b.ph) % 1; wb.place(i, b.r * Math.cos(b.a), 0.1 + p * (WATER - 0.05), b.r * Math.sin(b.a), 0.5 + p); }); wb.done();
        const topY = Y + LEG + H, y0 = Y + LEG + WATER + 0.1;
        sp.forEach((q, i) => {
          const span = (lidK > 0.5 ? H - WATER - 0.2 : H + 2.2), p = (time * q.v * 0.22 + q.ph) % 1, y = y0 + p * span;
          const a = q.a + q.w * p * 2 + time * 0.2, spread = y > topY ? 1 + (y - topY) * 0.25 : 1;
          steam.place(i, PX + q.r * spread * Math.sin(a), y, q.r * spread * Math.cos(a), (0.7 + 0.8 * p) * (y > topY ? 1.5 : 1));
        });
        steam.done();
        flames.forEach((f, i) => { f.scale.y = 0.85 + 0.25 * Math.sin(time * 14 + i * 1.7); });
        const done = Tc >= DONE_T;
        lSteam.element.innerHTML = s.lid ? 'steam, 100 °C' : 'lid off: about 80 °C';
        lCut.element.style.setProperty('--c', done ? COL.good : COL.sugar);
        lCut.element.innerHTML = `<b>${tSec === 0 ? 'raw batter' : done ? 'set all the way through' : k > 0 ? 'centre setting' : 'set layer growing inwards'}</b>`;
        lCore.element.innerHTML = `centre <b>${Tc.toFixed(0)} °C</b>`;
        const k2 = [s.min, s.thick, s.from, s.lid].join('|'); if (k2 !== key) { key = k2; chart.redraw(); }
      },
      readout: (s) => {
        const o = opts(s), tSec = s.min * 60, Tc = slabT(0, tSec, o), Tm = meanT(tSec, o), td = doneTime(o), puff = steamRise(Tm, o.T0);
        const mass = 40 * (s.thick / 2.4), done = Tc >= DONE_T;
        const big = tSec === 0 ? 'Raw batter' : done ? (tSec > td + 480 ? 'Done long ago: take them out' : 'Done: set to the centre') : Tc >= GEL_T[0] ? 'Centre is setting' : 'Raw in the middle';
        return `<div class="big" style="color:${done ? COL.good : COL.text}">${big}</div>
          <div class="row"><span>Centre · surface</span><b style="color:${COL.temp}">${Tc.toFixed(0)} °C · ${slabT(0.95, tSec, o).toFixed(0)} °C</b></div>
          <div class="row"><span>Done (centre at ${DONE_T} °C) after</span><b>${fmtMin(td)}</b></div>
          <div class="row"><span>Steam condensed on one idli so far</span><b style="color:${COL.steam}">${((mass * 3.3 * (Tm - o.T0)) / LATENT).toFixed(1)} g</b></div>
          <div class="row"><span>Heat taken in by one idli</span><b>${((mass * 3.3 * (Tm - o.T0)) / 1000).toFixed(1)} kJ</b></div>
          <div class="row"><span>Height gained as gas swells</span><b style="color:${COL.gas}">+${Math.round((puff - 1) * 100)}%</b></div>
          <small>Conduction model with typical properties. One idli of this thickness is about ${Math.round(mass)} g of batter.</small>`;
      },
    };
  },
};
