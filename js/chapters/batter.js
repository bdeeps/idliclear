// Chapter 1: what is in the batter. An idli on a steel plate that splits to show its sponge, and the
// two grains it is made from: idli rice (parboiled) and urad dal (dehusked black gram).
// Scale: 1 unit ≈ 2 cm. The idli is drawn 7.6 cm across and 2.3 cm thick.
// Composition figures are rounded from IFCT 2017 and USDA values (see model.js): "about", not exact.
// A fresh idli is roughly two-thirds water (the batter is one part grain to about two of water and
// little is lost in the steamer), and batter that doubled leaves about half the idli as gas cells.
import { THREE, M, VIEW, COL, CHART, CHART_POS, PARTS, GRAIN, TAU, hex, rng, board, panelBg, title, note, dots, idliMesh, spongeTexture, counterTop, fitNarrow, placeChart, mix, dalFrac, clamp, smoothK } from '../idli.js';

const RATIOS = { 2: '2 : 1', 3: '3 : 1', 4: '4 : 1' };

export default {
  id: 'batter',
  short: 'What is in the batter',
  title: 'Two grains and a lot of air',
  subtitle: 'An idli is rice and urad dal, ground with water, soured by wild bacteria and steamed. Cut one open and about half of it is tiny holes.',
  view: { pos: [0, 5.4, 10.6], target: [0, 1.5, 0] },
  learn: `<p>An <b>idli</b> has only four things in it: <b>rice</b>, <b>urad dal</b>, water and salt. No yeast, no baking soda, no egg, no oil. Yet it comes out of the steamer as a soft white sponge.</p>
    <p>The rice is usually <b>idli rice</b>, a short, fat grain that has been <b>parboiled</b>: soaked, steamed and dried while still in its husk. That cooks the starch once and makes the grain hard, so it grinds into a fine grit like rava instead of a paste, and the idli keeps its shape and its bite. The dal is <b>urad</b> (black gram, <i>ulundu</i> in Tamil, <i>uddu</i> in Kannada, <i>minumulu</i> in Telugu) with the black skin taken off. It brings <b>protein</b> and a slippery <b>gum</b> that will hold gas bubbles later.</p>
    <p>Homes use anything from <b>two to four parts of rice for one of dal</b>, by weight. More dal gives a softer, lighter idli. More rice gives a firmer, whiter one and costs less. Many cooks add a pinch of <b>methi</b> (fenugreek) seeds as well.</p>
    <p>Now look at the cut face. It is full of <b>gas cells</b>. They were bubbles of carbon dioxide made by bacteria while the batter stood overnight, and steam set the batter around them. That overnight change is called <b>fermentation</b>, and it is the heart of this box. The bacteria are cousins of the ones that set dahi: see <a href="https://glassbox.how/curdclear/" target="_blank" rel="noopener">CurdClear</a>.</p>
    <p class="tip"><b>Try it:</b> slide <b>Open the idli</b> to split it and see the sponge. Then switch the ratio from 2 : 1 to 4 : 1 and watch the heaps and the protein bar change.</p>`,
  terms: [
    { t: 'Idli rice', d: 'Short, bold rice that has been parboiled. It grinds to a fine grit and makes a firm, white idli.' },
    { t: 'Parboiling', d: 'Soaking and steaming paddy before milling. The starch cooks and sets hard inside the husk.' },
    { t: 'Urad dal (black gram)', d: 'A small bean, Vigna mungo, with a black skin and a creamy inside. About a quarter of it is protein.' },
    { t: 'Starch', d: 'Long chains of glucose that plants store in grains. Rice is about three-quarters starch.' },
    { t: 'Batter', d: 'A thick liquid of ground grain and water. Idli batter is about one part grain to two of water.' },
    { t: 'Fermentation', d: 'Microbes feeding on sugars without oxygen and leaving behind acid, gas or alcohol.' },
  ],
  defaults: { open: 0, ratio: 3 },
  controls: [
    { key: 'open', type: 'range', label: 'Open the idli', min: 0, max: 1, step: 0.01, ends: ['whole', 'cut open'], fmt: (v) => (v < 0.05 ? 'whole' : v > 0.9 ? 'cut open' : Math.round(v * 100) + '%') },
    { key: 'ratio', type: 'seg', label: 'Rice to urad dal, by weight', options: [{ v: 2, label: '2 : 1' }, { v: 3, label: '3 : 1' }, { v: 4, label: '4 : 1' }], fmt: (v) => `dal is ${Math.round(dalFrac(v) * 100)}% of the grain` },
  ],
  quiz: [
    { q: 'What makes the holes inside an idli?', options: ['Baking soda added to the batter', 'Gas made by bacteria while the batter ferments', 'Boiling water inside the batter', 'Air pumped in by the steamer'], answer: 1, why: 'Wild lactic acid bacteria make carbon dioxide overnight. The bubbles stay trapped in the thick batter and steam sets the batter around them.' },
    { q: 'Why is idli rice parboiled?', options: ['To make it sweeter', 'So the hard, once-cooked grain grinds to a grit and the idli holds its shape', 'To remove all the starch', 'To kill the bacteria needed later'], answer: 1, why: 'Parboiling cooks and hardens the starch in the grain. It grinds to a fine rava-like grit, not a sticky paste.' },
    { q: 'What does urad dal bring that rice does not?', options: ['Sugar and fat', 'Plenty of protein and a gum that holds gas bubbles', 'Colour', 'Salt'], answer: 1, why: 'Urad dal is about a quarter protein, and its gum and proteins make a foam that traps the gas from fermentation.' },
  ],
  reel: [
    { ms: 5200, caption: 'An idli is just rice, urad dal, water and salt. Cut it open and about half of it is gas cells.', set: { ratio: 3 }, anim: { open: [0, 1] }, view: { pos: [-0.6, 4.4, 7.6], target: [-0.6, 1.4, 0] }, spin: 0.15 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const world = new THREE.Group(); world.position.set(0.55, 0.5, 0); world.scale.setScalar(0.84); root.add(world);
    const rnd = rng(11);
    counterTop(world, 11.6, 5.6);
    // ---- plate and idli
    const PX = -1.9, PY = 0.3;
    const plate = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [2.5, 0], [2.95, 0.22], [3.0, 0.22], [2.55, -0.06], [0, -0.06]].map(([r, y]) => new THREE.Vector2(r, y + 0.07)), 72), M.metal(0xc9ced6, { roughness: 0.3, side: THREE.DoubleSide }));
    plate.position.set(PX, PY, 0.2); plate.receiveShadow = true; world.add(plate);
    const R = 1.9, H = 1.15, tex = spongeTexture(5);
    const idli = new THREE.Group(); idli.position.set(PX, PY + 0.08, 0.2); idli.rotation.y = -Math.PI / 2; world.add(idli);
    const back = idliMesh({ R, H, phiStart: Math.PI, phiLength: Math.PI, tex }); idli.add(back);
    const frontPivot = new THREE.Group(); idli.add(frontPivot);
    const front = idliMesh({ R, H, phiStart: 0, phiLength: Math.PI, tex }); frontPivot.add(front);
    // ---- bowls of grain
    const bowl = (x, z, r) => {
      const g = new THREE.Group(); g.position.set(x, PY, z); world.add(g);
      const prof = []; for (let i = 0; i <= 12; i++) { const a = (i / 12) * (Math.PI / 2); prof.push(new THREE.Vector2(r * (0.45 + 0.55 * Math.sin(a)), r * 0.62 * (1 - Math.cos(a)))); }
      const m = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), M.metal(0xc9ced6, { side: THREE.DoubleSide, roughness: 0.3 })); m.castShadow = true; g.add(m);
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.45, r * 0.45, 0.05, 32), M.metal(0xb9bec8)); foot.position.y = 0.02; g.add(foot);
      return g;
    };
    const heap = (parent, n, len, wid, color, r, seed) => {
      const rr = rng(seed), mesh = dots(n, 1, color, 8, true, { roughness: 0.6 }), col = new THREE.Color(), list = [];
      for (let i = 0; i < n; i++) {
        const u = Math.sqrt(rr()), a = rr() * TAU, lay = rr();
        list.push({ x: u * Math.cos(a), z: u * Math.sin(a), lay, ry: rr() * TAU, rz: (rr() - 0.5) * 0.9, sh: 0.86 + rr() * 0.14 });
        mesh.tint(i, col.set(color).multiplyScalar(list[i].sh));
      }
      parent.add(mesh);
      // k = how full, 0 to 1
      mesh.fill = (k) => {
        const top = r * (0.25 + 0.42 * k);
        list.forEach((p, i) => {
          const rad = r * 0.7 * (0.55 + 0.45 * k), dome = top * (1 - 0.55 * (p.x * p.x + p.z * p.z)) * (0.55 + 0.45 * p.lay);
          mesh.place(i, p.x * rad, Math.max(r * 0.12, dome), p.z * rad, len, wid, p.ry, p.rz, wid);
        });
        mesh.done();
      };
      return mesh;
    };
    const bRice = bowl(2.0, 0.9, 1.45), bDal = bowl(4.35, -0.6, 1.2), bMethi = bowl(4.5, 1.9, 0.55);
    const rice = heap(bRice, 420, 0.17, 0.062, hex(COL.rice), 1.45, 3), dal = heap(bDal, 300, 0.11, 0.085, hex(COL.dal), 1.2, 4), methi = heap(bMethi, 60, 0.07, 0.055, 0xc79a3a, 0.55, 5);
    methi.fill(0.5);
    // ---- labels
    const lCell = stage.label('gas cells: CO₂ bubbles, set in place', [PX - 0.2, PY + 2.25, 0.4], world, 'hot'); lCell.element.style.setProperty('--c', COL.gas);
    const lIdli = stage.label('<b>idli</b> · steamed, fermented batter', [PX, PY - 0.05, 2.95], world);
    const lRice = stage.label('', [2.0, PY + 1.75, 0.9], world, 'hot'); lRice.element.style.setProperty('--c', COL.rice);
    const lDal = stage.label('', [4.35, PY + 1.6, -0.6], world, 'hot'); lDal.element.style.setProperty('--c', COL.temp);
    const lMethi = stage.label('methi seeds, a pinch', [4.5, PY + 0.85, 1.9], world);

    let S = { ...this.defaults }, key = '', openK = 0;
    const chart = board(root, CHART.w, CHART.h, CHART.px, CHART.py, (g, w, h) => {
      panelBg(g, w, h);
      title(g, 'What 100 g of dry grain holds', 'about, rounded from IFCT 2017');
      const rows = [['Idli rice', GRAIN.rice], ['Urad dal', GRAIN.dal], [`Mix ${RATIOS[S.ratio]}`, mix(S.ratio)]];
      const x0 = 96, x1 = w - 18, bw = x1 - x0;
      rows.forEach(([n, c], i) => {
        const y = 66 + i * 62; let x = x0;
        g.font = 'bold 15px sans-serif'; g.fillStyle = COL.text; g.fillText(n, 12, y + 24);
        const tot = PARTS.reduce((a, p) => a + c[p.k], 0);
        PARTS.forEach((p) => { const ww = (c[p.k] / tot) * bw; g.fillStyle = p.col; g.fillRect(x, y, Math.max(1, ww - 1), 36); if (ww > 34) { g.fillStyle = '#10131a'; g.font = 'bold 13px sans-serif'; g.fillText(Math.round(c[p.k]) + '', x + 5, y + 23); } x += ww; });
      });
      let lx = 12, ly = h - 46;
      PARTS.forEach((p, i) => { if (i === 3) { lx = 12; ly += 20; } g.fillStyle = p.col; g.fillRect(lx, ly, 11, 11); g.font = '12.5px sans-serif'; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText(p.n, lx + 16, ly + 10); lx += 30 + g.measureText(p.n).width; });
    }, CHART_POS);

    return {
      update(dt, s) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s;
        const narrow = fitNarrow(stage, [lMethi, lIdli]);
        placeChart(stage, chart, narrow);
        openK += (s.open - openK) * (1 - Math.exp(-dt * 8));
        const k = smoothK(openK);
        // the front half slides out towards the camera side and swings round to show its cut face
        frontPivot.position.set(1.5 * k, 0, 1.2 * k);
        frontPivot.rotation.y = -2.0 * k;
        back.rotation.x = 0; back.position.x = -0.35 * k;
        lCell.visible = k > 0.5;
        const d = dalFrac(s.ratio);
        rice.fill(clamp((1 - d) / 0.8, 0.2, 1)); dal.fill(clamp(d / 0.34, 0.2, 1));
        lRice.element.innerHTML = `<b>idli rice</b> · parboiled · ${Math.round((1 - d) * 100)}%`;
        lDal.element.innerHTML = `<b>urad dal</b> · skinned black gram · ${Math.round(d * 100)}%`;
        const k2 = String(s.ratio); if (k2 !== key) { key = k2; chart.redraw(); }
      },
      readout: (s) => {
        const m = mix(s.ratio), d = dalFrac(s.ratio);
        return `<div class="big">Rice ${RATIOS[s.ratio]} urad dal</div>
          <div class="row"><span>Urad dal in the dry grain</span><b>${Math.round(d * 100)}%</b></div>
          <div class="row"><span>Protein in the dry mix</span><b style="color:${COL.temp}">about ${m.protein.toFixed(0)} g per 100 g</b></div>
          <div class="row"><span>Starch in the dry mix</span><b>about ${m.starch.toFixed(0)} g per 100 g</b></div>
          <div class="row"><span>Water in a fresh idli</span><b style="color:${COL.water}">about two-thirds</b></div>
          <div class="row"><span>Gas cells, if the batter doubled</span><b style="color:${COL.gas}">about half the volume</b></div>
          <small>Typical, rounded values. Grain varies with variety and season.</small>`;
      },
    };
  },
};
