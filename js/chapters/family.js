// Chapter 6: a family of idlis, and why an idli hardens in the fridge.
// Six steamed cakes on a banana leaf, 1 unit ≈ 2.5 cm: the everyday idli, rava idli, Kanchipuram
// (kovil) idli, thatte idli, Ramasseri idli and sanna. Shapes and sizes are typical, not exact.
// Sources for the varieties: Wikipedia (Idli, Rava idli, Sanna), The News Minute and Saveur on
// Ramasseri, Karnataka Tourism on thatte idli, press accounts of the Varadaraja Perumal temple idli.
// Staling: cooked starch re-crystallises (retrogradation), fastest just above freezing, as in bread
// and cooked rice. firmFrac() in model.js is an Avrami-type curve with illustrative rate constants.
// A finger presses the chosen idli: the softer it is, the deeper the dent and the fuller the spring back.
import { THREE, M, COL, CHART, CHART_POS, TAU, hex, rng, board, panelBg, title, note, axes, line, dot, dots, idliMesh, idliProfile, counterTop, fitNarrow, placeChart, firmFrac, clamp, lerp } from '../idli.js';

const KINDS = {
  plain: { n: 'Idli', short: 'Idli', from: 'Rice and urad dal', raise: 'Wild lactic ferment, overnight', home: 'All of south India, and far beyond', note: 'The everyday one. Mallige idli is its extra-soft cousin, button idli its small one.', R: 1.5, H: 0.9, color: 0xfbf8f0 },
  rava: { n: 'Rava idli', short: 'Rava', from: 'Semolina (rava), curd, a tadka of mustard and cashew', raise: 'No overnight ferment: curd, and today usually soda', home: 'Bengaluru. MTR says it began in the rice shortage of the Second World War', note: 'Quick to make. Coarser and more golden than a rice idli.', R: 1.5, H: 1.0, color: 0xf3e3b5, speck: [0x1c1c1c, 0xe7c98a] },
  kanchi: { n: 'Kanchipuram idli', short: 'Kanchipuram', from: 'Rice and urad with pepper, cumin, dry ginger and ghee', raise: 'Wild lactic ferment', home: 'Kanchipuram, Tamil Nadu: offered at the Varadaraja Perumal temple', note: 'Also called kovil idli. Steamed tall in baskets lined with mandharai leaves, then sliced.', R: 1.05, H: 2.3, color: 0xf2ead4, speck: [0x2a2a2a, 0x7a5a2a], tall: true },
  thatte: { n: 'Thatte idli', short: 'Thatte', from: 'Rice and urad dal', raise: 'Wild lactic ferment', home: 'Kyatsandra near Tumakuru, and Bidadi, Karnataka', note: 'Thatte means plate in Kannada: one idli fills a small plate.', R: 2.15, H: 0.8, color: 0xfbf8f0 },
  ramasseri: { n: 'Ramasseri idli', short: 'Ramasseri', from: 'Rice and urad dal', raise: 'Wild lactic ferment', home: 'Ramasseri village, Palakkad, Kerala', note: 'Thin and flat, steamed on cloth stretched over clay rings. Made by a few Mudaliar families.', R: 2.15, H: 0.4, color: 0xefe6cf },
  sanna: { n: 'Sanna', short: 'Sanna', from: 'Rice with coconut, urad in some homes', raise: 'Toddy, whose wild yeasts raise it, in Goan and Mangalurean Catholic kitchens', home: 'Goa and the Konkan coast', note: 'A little sweet. Leavened by yeast, so it is closer to bread than its looks suggest.', R: 1.4, H: 1.15, color: 0xffffff },
};
const ORDER = ['plain', 'rava', 'kanchi', 'thatte', 'ramasseri', 'sanna'];
const POS = { plain: [-4.1, 2.0], rava: [-0.7, 2.4], kanchi: [2.6, 2.0], thatte: [-3.4, -1.7], ramasseri: [1.2, -2.0], sanna: [5.0, -0.9] };
const WHERE = { counter: 'On the counter, about 30 °C', fridge: 'In the fridge, about 4 °C', freezer: 'In the freezer, about −18 °C' };
const firmOf = (s) => (s.reheat ? 0.04 : firmFrac(s.hours, s.where));
const firmWord = (f) => (f < 0.15 ? 'soft and springy' : f < 0.4 ? 'firming up' : f < 0.7 ? 'firm and crumbly' : 'hard');

export default {
  id: 'family',
  short: 'A family of idlis',
  title: 'One idea, many idlis',
  subtitle: 'Change the grain, the leaven or the mould and you get rava idli, thatte idli, Ramasseri idli or sanna. And all of them harden in the fridge for the same reason.',
  view: { pos: [0, 7.4, 8.6], target: [0, 1.2, 0] },
  learn: `<p>Steam a leavened batter and you have an idli. Every part of that sentence can change. <b>Thatte idli</b> from Karnataka is the same batter poured onto a plate. <b>Ramasseri idli</b> from Palakkad is steamed thin on a cloth. <b>Kanchipuram idli</b> is spiced with pepper, cumin and dry ginger and steamed tall in leaf-lined baskets for the temple. Along the Konkan coast batter is steamed in jackfruit-leaf baskets (<i>khotto</i>) or screwpine-leaf tubes (<i>moode</i>).</p>
    <p>Change the grain and you get <b>rava idli</b>: semolina and curd, with no overnight wait. Change the leaven and you get <b>sanna</b>, which many Goan and Mangalurean homes raise with <b>toddy</b>. Toddy carries yeast, the same kind of microbe that raises bread: see <a href="https://glassbox.how/breadclear/" target="_blank" rel="noopener">BreadClear</a>. The thin, crisp relative cooked on a hot tawa is the dosa: see <a href="https://glassbox.how/dosaclear/" target="_blank" rel="noopener">DosaClear</a>.</p>
    <p>Since 2005 many city homes buy <b>ready batter</b> in a packet. It is ground and packed fresh, with live bacteria in it, so it must stay cold from factory to shop to home. Cold slows the ferment. Left warm, the packet keeps souring and swells with gas. <b>Instant mixes</b> skip the bacteria and use an acid and soda to make the gas instead.</p>
    <p>Why does a soft idli turn <b>hard in the fridge</b>? Steaming melted the starch into a soft gel. As it cools, the starch chains slowly line up again into small crystals and squeeze water out. This is <b>retrogradation</b>, the same change that stales bread and hardens leftover rice. It runs fastest at fridge temperature, slower on the counter and hardly at all in the freezer. Heat undoes most of it, so a few minutes of re-steaming makes the idli soft again.</p>
    <p class="tip"><b>Try it:</b> pick each idli and read where it comes from. Then store one for a day in the fridge and watch the finger press it. Move it to the freezer, and then switch on <b>Steam it again</b>.</p>`,
  terms: [
    { t: 'Retrogradation', d: 'Cooked starch slowly re-forming crystals as it cools. It makes idli, rice and bread firm and dry.' },
    { t: 'Rava (semolina)', d: 'Coarsely ground wheat. Rava idli uses it in place of ground rice.' },
    { t: 'Toddy', d: 'The sap of coconut or palmyra flowers, fermented by wild yeasts. It leavens sanna.' },
    { t: 'Thatte', d: 'Kannada for plate. A thatte idli is as wide as a small plate.' },
    { t: 'Ready batter', d: 'Fresh ground batter sold chilled in packets. It is alive and keeps fermenting slowly.' },
    { t: 'Instant mix', d: 'A dry mix that makes gas from an acid and baking soda instead of from bacteria.' },
  ],
  defaults: { pick: 'plain', hours: 0, where: 'fridge', reheat: false },
  controls: [
    { key: 'pick', type: 'seg', label: 'Pick an idli', options: ORDER.map((k) => ({ v: k, label: KINDS[k].short })), fmt: (v) => KINDS[v].home },
    { key: 'hours', type: 'range', label: 'Hours since steaming', min: 0, max: 72, step: 1, ends: ['fresh', '3 days'], fmt: (v) => (v === 0 ? 'fresh from the steamer' : v + ' h') },
    { key: 'where', type: 'seg', label: 'Kept', options: [{ v: 'counter', label: 'Counter' }, { v: 'fridge', label: 'Fridge' }, { v: 'freezer', label: 'Freezer' }], fmt: (v) => WHERE[v] },
    { key: 'reheat', type: 'toggle', label: 'Steam it again', hint: 'Heat melts the starch crystals, and the idli softens.' },
  ],
  onChange(s, key) { if (key === 'hours' || key === 'where') s.reheat = false; },
  quiz: [
    { q: 'Why does a soft idli turn hard in the fridge?', options: ['It freezes', 'Its starch slowly re-forms crystals: retrogradation', 'The bacteria eat it', 'It absorbs salt'], answer: 1, why: 'Cooked starch chains line up into crystals again as they cool, fastest just above freezing. Re-steaming melts them.' },
    { q: 'What raises a traditional Goan sanna?', options: ['Baking soda', 'Yeast from toddy', 'Egg white', 'Steam alone'], answer: 1, why: 'Toddy is palm sap fermented by wild yeasts. The yeasts make carbon dioxide, as they do in bread.' },
    { q: 'Why must a packet of ready idli batter be kept cold?', options: ['To keep it white', 'Its live bacteria keep fermenting, and cold slows them', 'To freeze the bubbles', 'Cold adds vitamins'], answer: 1, why: 'The batter is alive. Warm, it goes on souring and making gas. At fridge temperature the bacteria nearly stop.' },
  ],
  reel: [
    { ms: 5400, caption: 'Rava idli, thatte idli, Ramasseri idli, Kanchipuram idli, sanna: one idea, steamed many ways.', set: { pick: 'plain', hours: 0, where: 'fridge', reheat: false }, anim: {}, view: { pos: [0.4, 7.4, 8.4], target: [0.4, 1.6, 0] }, spin: 0.5 },
    { ms: 5400, caption: 'In the fridge the starch re-forms crystals and the idli turns hard. A few minutes of steam makes it soft again.', set: { pick: 'plain', where: 'fridge', reheat: false }, anim: { hours: [0, 48] }, view: { pos: [-2.6, 4.6, 6.4], target: [-2.6, 1.5, 1.2] }, spin: 0.15 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const world = new THREE.Group(); world.position.set(-0.1, 0.4, 0); world.scale.setScalar(0.66); root.add(world);
    const rnd = rng(31), col = new THREE.Color();
    counterTop(world, 16, 9.4);
    const Y = 0.3;
    // banana leaf: a long green slab with a midrib
    const leafShape = new THREE.Shape(); leafShape.absellipse(0, 0, 7.4, 4.3, 0, TAU);
    const leaf = new THREE.Mesh(new THREE.ShapeGeometry(leafShape, 64), new THREE.MeshStandardMaterial({ color: 0x2f7a3d, roughness: 0.55 })); leaf.rotation.x = -Math.PI / 2; leaf.position.set(0.3, Y + 0.012, 0.1); leaf.receiveShadow = true; world.add(leaf);
    const rib = new THREE.Mesh(new THREE.BoxGeometry(14.6, 0.03, 0.12), M.matte(0x9fcf7a)); rib.position.set(0.3, Y + 0.03, 0.1); world.add(rib);
    for (let i = -9; i <= 9; i++) { const v = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.012, 7.2), M.matte(0x3d8b4a)); v.position.set(0.3 + i * 0.62, Y + 0.02, 0.1); world.add(v); }
    const items = {};
    ORDER.forEach((k, idx) => {
      const K = KINDS[k], g = new THREE.Group(); g.position.set(POS[k][0], Y + 0.03, POS[k][1]); world.add(g);
      const prof = K.tall ? [[0, 0], [K.R * 0.92, 0], [K.R, 0.12], [K.R, K.H - 0.25], [K.R * 0.8, K.H - 0.04], [0, K.H]] : idliProfile(K.R, K.H);
      const m = idliMesh({ profile: prof, color: K.color }); g.add(m);
      if (K.speck) {
        const n = 46, sp = dots(n, 0.045, 0xffffff, 6, true), rr = rng(60 + idx);
        for (let i = 0; i < n; i++) {
          const u = Math.sqrt(rr()) * 0.92, a = rr() * TAU, r = u * K.R;
          // sit each speck on the surface: find the profile height at this radius (top side)
          let y = K.H; if (!K.tall) y = K.H * (0.22 + 0.78 * Math.sqrt(Math.max(0, 1 - u * u))); else if (rr() < 0.5) { sp.place(i, K.R * Math.cos(a), 0.2 + rr() * (K.H - 0.5), K.R * Math.sin(a), 1); sp.tint(i, col.set(K.speck[i % 2])); continue; }
          sp.place(i, r * Math.cos(a), y, r * Math.sin(a), i % 2 ? 1.7 : 1); sp.tint(i, col.set(K.speck[i % 2]));
        }
        sp.done(); m.add(sp);
      }
      const ring = new THREE.Mesh(new THREE.TorusGeometry(K.R + 0.22, 0.035, 8, 64), M.glow(0xf59ee6)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.03; g.add(ring);
      const lab = stage.label(K.n, [POS[k][0], Y + K.H + 0.55, POS[k][1]], world, 'hot'); lab.element.style.setProperty('--c', '#f59ee6');
      m.traverse((o) => { if (o.isMesh) { o.userData.kind = k; stage.pickables.push(o); } });
      items[k] = { g, m, ring, lab, K };
    });
    // the finger that presses the chosen idli
    const finger = new THREE.Group(); world.add(finger);
    const fg1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 1.3, 8, 16), new THREE.MeshStandardMaterial({ color: 0xd9a57e, roughness: 0.6 })); fg1.position.y = 0.9; finger.add(fg1);
    const lPress = stage.label('', [0, 0, 0], world, 'hot');

    let S = { ...this.defaults }, key = '', firmK = 0;
    const chart = board(root, CHART.w, CHART.h, CHART.px, CHART.py, (g, w, h) => {
      panelBg(g, w, h);
      title(g, 'How firm the idli gets', 'illustrative curves');
      const { X, Y: YY, x0, x1 } = axes(g, w, h, { xMin: 0, xMax: 72, yMin: 0, yMax: 1, xTicks: [0, 24, 48, 72], yTicks: [0, 0.5, 1], xFmt: (v) => v + ' h', yFmt: (v) => (v === 0 ? 'soft' : v === 1 ? 'hard' : '') });
      for (const k of ['freezer', 'counter', 'fridge']) { const pts = []; for (let t = 0; t <= 72; t += 2) pts.push([t, firmFrac(t, k)]); line(g, pts, X, YY, k === S.where ? '#fff' : 'rgba(255,255,255,.3)', k === S.where ? 4 : 2, k === S.where ? null : [5, 5]); note(g, k, x1 - 6, YY(firmFrac(72, k)) + (k === 'fridge' ? 16 : -6), k === S.where ? '#fff' : 'rgba(255,255,255,.55)', 12, 'right'); }
      dot(g, X(S.hours), YY(firmOf(S)), S.reheat ? COL.good : COL.temp, 7);
      if (S.reheat) note(g, 're-steamed: soft again', X(S.hours) + 12 > x1 - 150 ? x1 - 150 : X(S.hours) + 12, YY(0.04) - 10, COL.good, 12);
    }, CHART_POS);

    return {
      pick(o) { const k = o.userData.kind; if (k) S.pick = k; },
      update(dt, s, time) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s;
        const narrow = fitNarrow(stage, []);
        placeChart(stage, chart, narrow);
        const f = firmOf(s); firmK += (f - firmK) * (1 - Math.exp(-dt * 5));
        const it = items[s.pick] || items.plain, K = it.K;
        // press cycle: down, hold, release
        const ph = (time * 0.55) % 1, down = ph < 0.3 ? ph / 0.3 : ph < 0.5 ? 1 : ph < 0.7 ? 1 - (ph - 0.5) / 0.2 : 0;
        const dent = 0.42 * (1 - 0.9 * firmK) * down;          // fraction of the height pressed in
        const lagBack = ph >= 0.7 ? (1 - firmK) * 0 + firmK * 0.12 * (1 - (ph - 0.7) / 0.3) : 0;   // a firm idli stays slightly dented and crumbly
        ORDER.forEach((k) => {
          const o = items[k], on = k === s.pick;
          o.ring.visible = on; o.lab.visible = !narrow || on;
          o.m.scale.set(1, on ? 1 - dent - lagBack : 1, 1); if (on) { const b = 1 + 0.12 * dent; o.m.scale.x = o.m.scale.z = b; }
          o.m.skin.color.set(o.K.color).lerp(col.set(0xd9d2bf), on ? firmK * 0.35 : 0);
        });
        finger.position.set(it.g.position.x + 0.25, it.g.position.y + K.H * (1 - dent) - 0.02 + (1 - down) * 0.5, it.g.position.z + 0.1); finger.rotation.z = -0.25;
        lPress.position.set(it.g.position.x + 0.3, it.g.position.y + K.H + 2.4, it.g.position.z + 0.1);
        lPress.element.style.setProperty('--c', firmK < 0.25 ? COL.good : firmK < 0.6 ? COL.temp : COL.bad);
        lPress.element.innerHTML = `<b>${firmWord(firmK)}</b>`;
        const k2 = [s.hours, s.where, s.reheat].join('|'); if (k2 !== key) { key = k2; chart.redraw(); }
      },
      readout: (s) => {
        const K = KINDS[s.pick] || KINDS.plain, f = firmOf(s);
        return `<div class="big">${K.n}</div>
          <div class="row"><span>Made from</span><b>${K.from}</b></div>
          <div class="row"><span>Raised by</span><b>${K.raise}</b></div>
          <div class="row"><span>Home</span><b>${K.home}</b></div>
          <div class="row"><span>${s.reheat ? 'Steamed again' : s.hours === 0 ? 'Fresh' : s.hours + ' h ' + (s.where === 'counter' ? 'on the counter' : 'in the ' + s.where)}</span><b style="color:${f < 0.25 ? COL.good : f < 0.6 ? COL.temp : COL.bad}">${firmWord(f)}</b></div>
          <small>${K.note}${s.where === 'counter' && s.hours > 12 && !s.reheat ? ' In warm weather a steamed idli left out this long may spoil.' : ''}</small>`;
      },
    };
  },
};
