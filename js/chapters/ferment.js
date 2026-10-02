// Chapter 3: the wild ferment, under the microscope.
// Scene: a drop of batter, about 1 unit ≈ 1 µm for the bacteria. The pale lumps are bits of ground
// rice (in truth hundreds of times bigger than a bacterium: only their edges are shown).
// Blue cocci in pairs and short chains: Leuconostoc mesenteroides (cells about 0.5 to 1 µm).
// Orange cocci in pairs and fours: the later acid makers (Enterococcus, Pediococcus).
// Yellow dots: sugars freed from starch by the grains' own amylase enzymes. Red dots: lactic acid.
// Cyan bubbles: CO2, each wrapped in a green film of urad gum and protein. Real bubbles are tens to
// hundreds of µm across, so they are drawn far too small next to the bacteria.
// The number of cells drawn follows the logarithm of the modelled count. Counts, acid, pH and gas
// come from runFerment() in model.js (1% salt, rice 3 : 1 dal).
// Heterolactic fermentation: C6H12O6 → C3H6O3 (lactic acid) + C2H5OH (ethanol) + CO2.
import { THREE, M, VIEW, REEL_VIEW, COL, CHART, CHART_POS, TEAMS, TAU, hex, rng, board, panelBg, title, note, axes, line, dot, dots, tank, fitNarrow, placeChart, runFerment, rowAt, doubling, fmtN, fmtH, sourWord, N0, N_MAX, TA0, clamp, lerp } from '../idli.js';

const HOURS = 24;
const run = (T) => runFerment({ T, salt: 1, ratio: 3, hours: HOURS });
const tName = (T) => (T < 12 ? 'fridge-cold: asleep' : T < 20 ? 'a cold kitchen: slow' : T < 25 ? 'cool: slow' : T <= 33 ? 'warm: their favourite' : T <= 38 ? 'hot: sour, less gas' : 'too hot for Leuconostoc');

export default {
  id: 'ferment',
  short: 'The wild ferment',
  title: 'Nobody added a starter',
  subtitle: 'The bacteria come in on the grain. Leuconostoc eats sugar and gives out lactic acid and carbon dioxide, and urad\'s gum holds the bubbles.',
  view: VIEW,
  learn: `<p>Dahi needs a spoon of old curd. Bread needs yeast. Idli batter needs <b>nothing added</b>. The microbes are already there, on the urad dal and the rice, and a few hours of soaking wakes them up. This is a <b>wild ferment</b>.</p>
    <p>In 1965 a team in the USA led by S. K. Mukherjee tracked down the main worker: a bacterium called <b><i>Leuconostoc mesenteroides</i></b>. It is a tiny ball, usually in pairs or short chains. It feeds on <b>sugars</b> that the grain's own enzymes cut loose from starch.</p>
    <p>Most curd bacteria turn a sugar into two lactic acids and nothing else. <i>Leuconostoc</i> is different. From each glucose it makes <b>one lactic acid, one ethanol and one carbon dioxide</b>: C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> → C<sub>3</sub>H<sub>6</sub>O<sub>3</sub> + C<sub>2</sub>H<sub>5</sub>OH + CO<sub>2</sub>. The acid makes the batter <b>sour</b>. The gas makes it <b>rise</b>. Mukherjee's paper called it the first known case of a food leavened by a lactic acid bacterium alone.</p>
    <p>A gas bubble in plain rice paste would simply float up and pop. Here <b>urad dal</b> earns its place. Its gum (an <b>arabinogalactan</b>) thickens the batter, and its <b>globulin</b> protein coats each bubble like a skin. The bubbles stay put and the batter swells.</p>
    <p>As the batter turns acid, <i>Leuconostoc</i> slows down and other lactic bacteria take over. They make acid but no gas. In some batters wild <b>yeasts</b> join in too. So a batter left too long keeps getting sourer while its rise stops.</p>
    <p>What does the ferment change in the food? Studies have measured more acid, a rise in the B vitamins <b>thiamine and riboflavin</b>, and less <b>phytate</b> than in the unfermented batter (Rajalakshmi and Vanaja, 1967). That is what was measured. It is not a health promise.</p>
    <p class="tip"><b>Try it:</b> slide the hours and watch the blue pairs multiply, the yellow sugar turn into red acid, and bubbles swell. Then try 15 °C, 30 °C and 38 °C.</p>`,
  terms: [
    { t: 'Wild ferment', d: 'A fermentation started by microbes already on the food, with no starter added.' },
    { t: 'Leuconostoc mesenteroides', d: 'A lactic acid bacterium that makes lactic acid, ethanol and carbon dioxide. It leavens idli batter.' },
    { t: 'Heterofermentative', d: 'Making more than one product from sugar: here lactic acid, ethanol and CO2. Homofermentative bacteria make only lactic acid.' },
    { t: 'Leavening', d: 'Filling a dough or batter with gas so it rises.' },
    { t: 'Arabinogalactan', d: 'The gum of urad dal: a long, branched chain of sugars that makes the batter thick and slippery.' },
    { t: 'Amylase', d: 'An enzyme in grain that cuts starch into sugars the bacteria can eat.' },
  ],
  defaults: { hours: 0, T: 30 },
  controls: [
    { key: 'hours', type: 'range', label: 'Hours since grinding', min: 0, max: HOURS, step: 0.1, ends: ['0', HOURS + ' h'], fmt: (v) => fmtH(v) },
    { key: 'T', type: 'range', label: 'Batter kept at', min: 5, max: 44, step: 1, ends: ['5 °C', '44 °C'], fmt: (v) => `${v} °C · ${tName(v)}` },
  ],
  quiz: [
    { q: 'Where do the bacteria that ferment idli batter come from?', options: ['A packet of yeast', 'A spoon of old curd', 'They are already on the dal and rice', 'The steel vessel makes them'], answer: 2, why: 'Idli is a wild ferment. The lactic bacteria arrive on the grains, mostly the urad dal, and multiply during soaking and after grinding.' },
    { q: 'Why does idli batter rise when dahi does not?', options: ['Batter is warmer', 'Leuconostoc makes carbon dioxide gas along with lactic acid', 'Rice contains air', 'Salt makes gas'], answer: 1, why: 'Leuconostoc mesenteroides is heterofermentative: each glucose gives one lactic acid, one ethanol and one CO2. The gas leavens the batter.' },
    { q: 'What does urad dal do for the bubbles?', options: ['It dissolves them', 'Its gum and protein thicken the batter and coat the bubbles so they stay trapped', 'It turns them into acid', 'Nothing'], answer: 1, why: 'Urad\'s arabinogalactan gum and its surface-active globulin protein steady the foam, so the gas stays in the batter.' },
  ],
  reel: [
    { ms: 6000, caption: 'No starter is added. Bacteria from the dal turn sugar into lactic acid and carbon dioxide, and urad\'s gum traps the bubbles.', set: { T: 30 }, anim: { hours: [0, 14] }, view: REEL_VIEW, spin: 0.2 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const world = new THREE.Group(); world.position.set(0.2, -0.1, 0); world.scale.setScalar(0.84); root.add(world);
    const rnd = rng(21), col = new THREE.Color();
    const BX = 5.0, BY0 = 0.4, BY1 = 5.2, BZ = 2.0;
    tank(world, BX, BY0, BY1, BZ);
    // rice bits: lumpy pale blobs at the edges and floor of the view
    const riceMat = new THREE.MeshStandardMaterial({ color: 0xfff6e0, roughness: 0.9, transparent: true, opacity: 0.85 });
    [[-4.6, 1.0, -0.6, 1.7], [4.5, 4.6, -1.0, 1.5], [3.9, 0.5, 1.0, 1.1], [-3.4, 5.0, 1.2, 0.9]].forEach(([x, y, z, r], i) => {
      const geo = new THREE.IcosahedronGeometry(r, 2), p = geo.attributes.position, rr = rng(40 + i);
      for (let k = 0; k < p.count; k++) { const f = 0.86 + 0.25 * Math.sin(p.getX(k) * 3.1 + i) * Math.cos(p.getY(k) * 2.7); p.setXYZ(k, p.getX(k) * f, p.getY(k) * f * 0.8, p.getZ(k) * f); }
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, riceMat); m.position.set(x, y, z); world.add(m);
    });
    // organisms: each slot is a pair or short chain of cocci
    const NORG = 52, PER = 4;
    const cocci = dots(NORG * PER, 0.2, 0xffffff, 10, true); world.add(cocci);
    const org = Array.from({ length: NORG }, (_, i) => ({ late: i % 4 === 3, x: (rnd() - 0.5) * 2 * (BX - 0.9), y: BY0 + 0.5 + rnd() * (BY1 - BY0 - 1.0), z: (rnd() - 0.5) * 2 * (BZ - 0.5), a: rnd() * TAU, b: (rnd() - 0.5) * 1.0, ph: rnd() * TAU, k: 0, n: i % 4 === 3 ? (rnd() < 0.5 ? 2 : 4) : (rnd() < 0.6 ? 2 : 3 + Math.floor(rnd() * 2)) }));
    const NS = 150, sug = dots(NS, 0.075, hex(COL.sugar), 6); world.add(sug);
    const mol = Array.from({ length: NS }, () => ({ x: (rnd() - 0.5) * 2 * (BX - 0.3), y: BY0 + 0.2 + rnd() * (BY1 - BY0 - 0.4), z: (rnd() - 0.5) * 2 * (BZ - 0.2), ph: rnd() * TAU, turn: rnd() }));
    // bubbles: CO2 with a film
    const NBUB = 11, gasM = dots(NBUB, 1, hex(COL.gas), 24, false, { transparent: true, opacity: 0.2, depthWrite: false }), film = dots(NBUB, 1, hex(COL.gum), 24, false, { transparent: true, opacity: 0.16, depthWrite: false, side: THREE.BackSide });
    world.add(gasM, film);
    const bub = Array.from({ length: NBUB }, () => ({ x: (rnd() - 0.5) * 2 * (BX - 1.2), y: BY0 + 0.9 + rnd() * (BY1 - BY0 - 1.8), z: (rnd() - 0.5) * 2 * (BZ - 0.8), on: rnd(), r: 0.45 + rnd() * 0.55, ph: rnd() * TAU }));
    const lL = stage.label('<b>Leuconostoc</b> · makes acid and CO₂', [-2.4, BY1 + 0.35, 0], world, 'hot'); lL.element.style.setProperty('--c', COL.leuco);
    const lH = stage.label('later bacteria · acid only', [2.4, BY0 + 0.3, BZ], world, 'hot'); lH.element.style.setProperty('--c', COL.late);
    const lB = stage.label('CO₂ bubble in a film of urad gum', [0, 3, 0], world, 'hot'); lB.element.style.setProperty('--c', COL.gum);
    const lR = stage.label('bit of ground rice', [-4.4, 2.75, 0.6], world);
    const lS = stage.label('<span style="color:#ffd166">●</span> sugar &nbsp;<span style="color:#ff7a8a">●</span> lactic acid', [2.9, BY1 + 0.35, 0], world);

    let S = { ...this.defaults }, key = '';
    const chart = board(root, CHART.w, CHART.h, CHART.px, CHART.py, (g, w, h) => {
      panelBg(g, w, h);
      const rows = run(S.T), r = rowAt(rows, S.hours);
      title(g, 'Bacteria per gram, and pH', `at ${S.T} °C`);
      const { X, Y, x1, y0, y1 } = axes(g, w, h, { x1: w - 50, xMin: 0, xMax: HOURS, yMin: 1e5, yMax: 1e10, logY: true, xTicks: [0, 6, 12, 18, 24], yTicks: [1e6, 1e8, 1e10], xFmt: (v) => v + ' h', yFmt: (v) => fmtN(v) });
      const P = (ph) => y0 - ((ph - 3.5) / 3) * (y0 - y1);
      const pick = rows.filter((_, i) => i % 4 === 0);
      line(g, pick.map((q) => [q.t, q.nl]), X, Y, COL.leuco, 4); line(g, pick.map((q) => [q.t, Math.max(1e5, q.nh)]), X, Y, COL.late, 3);
      g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.setLineDash([7, 4]); g.beginPath(); pick.forEach((q, i) => (i ? g.lineTo(X(q.t), P(q.ph)) : g.moveTo(X(q.t), P(q.ph)))); g.stroke(); g.setLineDash([]);
      [4, 5, 6].forEach((p) => note(g, 'pH ' + p, x1 + 4, P(p) + 4, 'rgba(255,255,255,.75)', 11));
      note(g, 'Leuconostoc', X(0.6), y1 + 12, COL.leuco, 12); note(g, 'later bacteria', X(8.5), y1 + 12, COL.late, 12); note(g, '- - pH', X(18.5), y1 + 12, '#fff', 12);
      dot(g, X(r.t), Y(Math.max(1e5, r.nl)), COL.leuco, 6); dot(g, X(r.t), P(r.ph), '#fff', 5);
    }, CHART_POS);

    const L = Math.log10;
    return {
      update(dt, s, time) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s;
        const narrow = fitNarrow(stage, [lR, lS, lH]);
        placeChart(stage, chart, narrow);
        const rows = run(s.T), r = rowAt(rows, s.hours);
        // how many organisms to draw: log scale from the starting count to the ceiling
        const fracL = clamp((L(Math.max(r.nl, 1)) - L(N0) + 0.6) / (L(N_MAX) - L(N0) + 0.6), 0.06, 1), fracH = clamp((L(Math.max(r.nh, 1)) - L(N0) + 1.2) / (L(N_MAX) - L(N0) + 1.2), 0.04, 1);
        let iL = 0, iH = 0; const nLate = org.filter((o) => o.late).length, nLeu = NORG - nLate;
        org.forEach((o, i) => {
          const want = o.late ? iH++ < fracH * nLate : iL++ < fracL * nLeu;
          o.k += ((want ? 1 : 0) - o.k) * (1 - Math.exp(-dt * 5));
          const jig = 0.1, x = o.x + jig * Math.sin(time * 1.3 + o.ph), y = o.y + jig * Math.cos(time * 1.1 + o.ph * 2), z = o.z;
          const dx = Math.cos(o.a) * Math.cos(o.b), dy = Math.sin(o.b), dz = Math.sin(o.a) * Math.cos(o.b), sp = 0.36;
          for (let j = 0; j < PER; j++) {
            const id = i * PER + j;
            if (j >= o.n || o.k < 0.02) { cocci.hide(id); continue; }
            // Pediococcus-like fours sit as a square; the rest sit in a line
            let ox, oy, oz;
            if (o.late && o.n === 4) { ox = ((j % 2) - 0.5) * sp; oy = (Math.floor(j / 2) - 0.5) * sp; oz = 0; } else { const u = (j - (o.n - 1) / 2) * sp; ox = dx * u; oy = dy * u; oz = dz * u; }
            cocci.place(id, x + ox, y + oy, z + oz, o.k * (o.late ? 0.9 : 1));
            cocci.tint(id, col.set(o.late ? COL.late : COL.leuco));
          }
        });
        cocci.done();
        // sugar turns to acid as the acidity climbs
        const acidK = clamp((r.ta - TA0) / 0.55, 0, 1);
        mol.forEach((m, i) => {
          const x = m.x + 0.25 * Math.sin(time * 0.9 + m.ph), y = m.y + 0.25 * Math.cos(time * 0.7 + m.ph * 1.7);
          sug.place(i, x, y, m.z, 1); sug.tint(i, col.set(m.turn < acidK ? COL.acid : COL.sugar));
        });
        sug.done();
        // bubbles: appear as gas is made, swell with the batter's rise, fade if the batter collapses
        const gasK = clamp((r.vol - 1) / 1.0, 0, 1.2), held = clamp(r.vol / Math.max(1.01, r.peak), 0, 1);
        let shown = null;
        bub.forEach((b, i) => {
          const k = clamp((gasK * 1.25 - b.on * 0.6) / 0.5, 0, 1) * (r.vol < r.peak - 0.1 && b.on > held * 0.9 ? 0.25 : 1);
          if (k < 0.03) { gasM.hide(i); film.hide(i); return; }
          const rad = b.r * (0.35 + 0.75 * k) * (1 + 0.03 * Math.sin(time * 2 + b.ph)), y = b.y + 0.12 * Math.sin(time * 0.6 + b.ph);
          gasM.place(i, b.x, y, b.z, rad); film.place(i, b.x, y, b.z, rad * 1.09);
          if (!shown || rad > shown.rad) shown = { x: b.x, y: y + rad + 0.3, z: b.z, rad };
        });
        gasM.done(); film.done();
        lB.visible = !!shown && !narrow; if (shown) lB.position.set(shown.x, Math.min(BY1 + 0.3, shown.y), shown.z);
        const k2 = [s.T, s.hours].join('|'); if (k2 !== key) { key = k2; chart.redraw(); }
      },
      readout: (s) => {
        const rows = run(s.T), r = rowAt(rows, s.hours), d = doubling(s.T);
        return `<div class="big">${r.t < 0.3 ? 'Fresh batter' : r.ph > 5.3 ? 'Waking up' : r.ph > 4.45 ? 'Souring and rising' : 'Sour: gas has slowed'}</div>
          <div class="row"><span>Lactic bacteria per gram</span><b style="color:${COL.leuco}">${fmtN(r.N)}</b></div>
          <div class="row"><span>Leuconostoc doubles every</span><b>${d === Infinity ? 'not growing' : d > 600 ? 'over 10 h' : Math.round(d) + ' min'}</b></div>
          <div class="row"><span>pH · acidity as lactic acid</span><b style="color:${COL.acid}">${r.ph.toFixed(2)} · ${r.ta.toFixed(2)}%</b></div>
          <div class="row"><span>Taste</span><b>${sourWord(r.ph)}</b></div>
          <div class="row"><span>Batter volume</span><b style="color:${COL.gas}">× ${r.vol.toFixed(2)}</b></div>
          <small>A model fitted to measured ranges (pH 5.9 to 4.2, rise 1.6 to 3.2 times). Bubbles are drawn far too small.</small>`;
      },
    };
  },
};
