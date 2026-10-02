// Chapter 4: the overnight rise. A steel vessel of batter on the counter, drawn with the front cut
// away, a thermometer and a clock. 1 unit ≈ 3 cm. The vessel is filled to 40% so good batter has
// room to more than double.
// The batch comes from runFerment() in model.js: two teams of lactic bacteria growing by the
// cardinal temperature model, acid by Luedeking and Piret, pH from a buffered titration curve fitted
// to measured end points, gas from Leuconostoc's share of the acid, held by the urad foam and
// slowly lost once the batter turns sour. Measured ranges it is fitted to: pH 5.9 falling to 4.2 and
// volume 1.62 to 3.2 times in up to 22 h at 20 to 26 °C (Ghosh & Chattopadhyay 2011).
// "Oven with the light on" holds about 32 °C: an estimate for a closed oven warmed by its lamp.
import { THREE, M, VIEW, REEL_VIEW, COL, CHART, CHART_POS, TAU, hex, rng, board, panelBg, title, note, axes, line, dot, dashH, dots, steelPot, counterTop, fitNarrow, placeChart, runFerment, rowAt, timeTo, peakOf, verdict, sourWord, dalFrac, fmtN, fmtH, clamp, lerp } from '../idli.js';

const HOURS = 36, OVEN_T = 32;
const tempOf = (s) => (s.place === 'oven' ? Math.max(s.room, OVEN_T) : s.room);
const batch = (s) => runFerment({ T: tempOf(s), salt: s.salt, ratio: s.ratio, hours: HOURS });
const roomName = (v) => (v <= 12 ? 'a north Indian winter night' : v <= 20 ? 'a cool night' : v <= 27 ? 'a mild night' : v <= 34 ? 'a warm coastal night' : 'a very hot day');

export default {
  id: 'rise',
  short: 'Rise overnight',
  title: 'Warmth, time, salt and dal',
  subtitle: 'The same batter doubles by morning in Chennai and sits flat in a Delhi winter. Run your own batch and see why.',
  view: VIEW,
  learn: `<p>Mixed batter is left in a deep vessel, covered, for the night. By morning it should have <b>risen to about twice its height</b>, smell pleasantly sour and be full of bubbles. Studies have measured the batter growing to between 1.6 and 3.2 times its volume, while its <b>pH falls from about 6 to about 4.3 to 4.7</b>.</p>
    <p><b>Temperature</b> sets the pace. Around <b>25 to 35 °C</b>, a normal night in much of south India, the batter is ready in 8 to 14 hours. Below about 20 °C the bacteria crawl. That is why batter refuses to rise in a north Indian winter, or in London. The tricks all add warmth: the oven with only its light on, a spot near the stove, a vessel wrapped in a blanket, or warm water for grinding.</p>
    <p>Too hot is a problem as well. <i>Leuconostoc</i>, the gas maker, likes about 30 °C. Much hotter and the acid-only bacteria win: the batter turns sour quickly without rising much.</p>
    <p>Leave it too long and it <b>over-ferments</b>. The acid keeps building, the bubbles merge and escape, and the batter sinks back, sharp and flat. The fridge is the brake: at about 5 °C the bacteria nearly stop, which is how a pot of batter lasts the week.</p>
    <p><b>Salt</b> slows microbes a little, and <i>Leuconostoc</i> stands it better than most. Practice differs. Many cooks salt before fermenting. In hot weather some add less, and in cold places some add it only in the morning so nothing holds the bacteria back. More <b>urad dal</b> means more gum and protein to hold the gas, so a 2 : 1 batter rises higher than a 4 : 1. A pinch of <b>methi</b> seeds is a common extra: cooks say it helps the rise, and its own gum does thicken the batter.</p>
    <p class="tip"><b>Try it:</b> set the kitchen to 10 °C and slide the hours: nothing. Now move the vessel to the oven with the light on. Then run a warm night out to 36 hours and watch the batter sink.</p>`,
  terms: [
    { t: 'pH', d: 'A scale of acidity. Fresh batter is about 6 and ready batter about 4.5. Each step down is ten times more acid.' },
    { t: 'Over-fermented', d: 'Left too long: very sour, with the gas escaping and the batter sinking.' },
    { t: 'Lag phase', d: 'The quiet first hour or two while bacteria adjust before they start multiplying fast.' },
    { t: 'Foam', d: 'Gas bubbles held in a liquid by a film. Risen batter is a foam steadied by urad gum and protein.' },
    { t: 'Titratable acidity', d: 'How much acid a food holds, measured in a lab and counted as lactic acid.' },
    { t: 'Cold chain', d: 'Keeping food chilled all the way from factory to shop to home, so its microbes stay slow.' },
  ],
  defaults: { hours: 0, room: 28, place: 'counter', salt: 1, ratio: 3 },
  controls: [
    { key: 'hours', type: 'range', label: 'Hours since the batter was mixed', min: 0, max: HOURS, step: 0.1, ends: ['0', HOURS + ' h'], fmt: (v) => fmtH(v) },
    { key: 'room', type: 'range', label: 'Kitchen temperature', min: 5, max: 42, step: 1, ends: ['5 °C', '42 °C'], fmt: (v) => `${v} °C · ${roomName(v)}` },
    { key: 'place', type: 'seg', label: 'The vessel sits', options: [{ v: 'counter', label: 'On the counter' }, { v: 'oven', label: 'In the oven, light on' }], fmt: (v, s) => `batter at about ${tempOf(s)} °C` },
    { key: 'salt', type: 'range', label: 'Salt added before fermenting', min: 0, max: 3, step: 0.1, ends: ['none yet', '3%'], fmt: (v) => (v === 0 ? 'none: salt it in the morning' : v.toFixed(1) + '% of the batter') },
    { key: 'ratio', type: 'range', label: 'Rice for one part of urad dal', min: 2, max: 4, step: 0.5, ends: ['2 : 1', '4 : 1'], fmt: (v) => `${v} : 1 · dal ${Math.round(dalFrac(v) * 100)}%` },
  ],
  quiz: [
    { q: 'Why does idli batter often fail to rise on a winter night in north India?', options: ['The air is too dry', 'Below about 20 °C the bacteria grow very slowly', 'Cold water has no oxygen', 'Winter rice has no starch'], answer: 1, why: 'Leuconostoc grows best near 30 °C. In a cold kitchen it takes far longer, so cooks move the vessel somewhere warm, such as an oven with the light on.' },
    { q: 'What happens to batter left out far too long?', options: ['It keeps rising for ever', 'It turns very sour and sinks as the bubbles escape', 'It turns sweet', 'It dries into flour'], answer: 1, why: 'Acid keeps building after the gas slows. The foam weakens, bubbles merge and escape, and the batter collapses.' },
    { q: 'Why does a batter with more urad dal rise higher?', options: ['Dal is lighter than rice', 'Dal brings more gum and protein to hold the gas, and more of the bacteria', 'Dal contains baking soda', 'Dal absorbs acid'], answer: 1, why: 'Urad\'s arabinogalactan and globulin steady the bubbles. The grain also carries the Leuconostoc that makes the gas.' },
  ],
  reel: [
    { ms: 6000, caption: 'On a warm night the batter doubles in 10 to 12 hours while its pH falls from about 6 to about 4.5.', set: { room: 28, place: 'counter', salt: 1, ratio: 3 }, anim: { hours: [0, 13] }, view: { pos: [0.3, 4.0, 9.4], target: [0.3, 2.3, 0] }, spin: 0.15 },
    { ms: 5200, caption: 'At 10 °C the bacteria barely grow and the batter stays flat. Cold kitchens need a warm spot.', set: { room: 10, place: 'counter', salt: 1, ratio: 3 }, anim: { hours: [0, 14] }, view: { pos: [0.3, 4.0, 9.4], target: [0.3, 2.3, 0] }, spin: 0.15 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const world = new THREE.Group(); world.position.set(0.4, 0.4, 0); world.scale.setScalar(0.86); root.add(world);
    const rnd = rng(3), col = new THREE.Color();
    counterTop(world, 11, 4.8);
    const PX = -1.2, R = 1.7, H = 4.4, Y = 0.3, FILL = 0.4;
    // vessel with the front third cut away so the batter level shows
    const CUT = 1.9, pot = steelPot(R, H, { phiStart: CUT / 2, phiLength: TAU - CUT }); pot.position.set(PX, Y, 0); world.add(pot);
    const batMat = new THREE.MeshStandardMaterial({ color: hex(COL.batter), roughness: 0.6 });
    const bat = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.05, R - 0.05, 1, 56), batMat); bat.castShadow = true; pot.add(bat);
    const topMat = new THREE.MeshStandardMaterial({ color: 0xfaf5e8, roughness: 0.8 });
    const top = new THREE.Mesh(new THREE.SphereGeometry(R - 0.05, 48, 16, 0, TAU, 0, Math.PI / 2), topMat); pot.add(top);
    const mark = new THREE.Mesh(new THREE.TorusGeometry(R - 0.03, 0.025, 8, 64), M.glow(0xffffff, { transparent: true, opacity: 0.6 })); mark.rotation.x = Math.PI / 2; mark.position.y = 0.06 + H * FILL; pot.add(mark);
    // bubbles seen through the cut
    const NB = 150, bubs = dots(NB, 1, 0xc9bd9e, 10, true, { roughness: 0.95 }); pot.add(bubs);
    const bub = Array.from({ length: NB }, () => { const a = (rnd() - 0.5) * (CUT - 0.3), h = rnd(); return { a, h, r: 0.03 + Math.pow(rnd(), 2) * 0.09, on: rnd(), ph: rnd() * TAU }; });
    // lid: rests on the rim, lifted by batter that overflows
    const lid = new THREE.Group(); pot.add(lid);
    const lidD = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.12, R + 0.12, 0.06, 56), M.metal(0xd5dae2)); lid.add(lidD);
    const lidK = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), M.plastic(0x22252b)); lidK.position.y = 0.2; lid.add(lidK);
    const spill = new THREE.Mesh(new THREE.TorusGeometry(R + 0.06, 0.13, 10, 48), new THREE.MeshStandardMaterial({ color: 0xfaf5e8, roughness: 0.8 })); spill.rotation.x = Math.PI / 2; spill.scale.z = 2.2; spill.position.y = H - 0.12; pot.add(spill);
    // oven box
    const oven = new THREE.Mesh(new THREE.BoxGeometry(5.2, 5.6, 4.4), M.clear(0xffb547, 0.07)); oven.position.set(PX, Y + 2.8, 0); world.add(oven);
    const ovenE = new THREE.LineSegments(new THREE.EdgesGeometry(oven.geometry), new THREE.LineBasicMaterial({ color: 0xffb547, transparent: true, opacity: 0.7 })); ovenE.position.copy(oven.position); world.add(ovenE);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), M.glow(0xffe08a)); lamp.position.set(PX + 2.2, Y + 5.2, -1.8); world.add(lamp);
    // thermometer beside the vessel
    const th = new THREE.Group(); th.position.set(PX + 2.6, Y, 0.6); world.add(th);
    const tb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.4, 0.08), M.matte(0xf2efe6)); tb.position.y = 1.8; th.add(tb);
    const merc = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1, 10), M.glow(0xff5a4e)); merc.position.z = 0.06; th.add(merc);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), M.glow(0xff5a4e)); bulb.position.set(0, 0.32, 0.06); th.add(bulb);
    // wall clock
    const clock = new THREE.Group(); clock.position.set(PX + 4.6, Y + 2.6, -1.2); world.add(clock);
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.1, 40), M.matte(0xf2efe6)); face.rotation.x = Math.PI / 2; clock.add(face);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.07, 10, 40), M.matte(0x30343c)); clock.add(ring);
    for (let i = 0; i < 12; i++) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.02), M.matte(0x30343c)); const a = (i / 12) * TAU; t.position.set(0.78 * Math.sin(a), 0.78 * Math.cos(a), 0.07); t.rotation.z = -a; clock.add(t); }
    const hHand = new THREE.Group(), mHand = new THREE.Group(); hHand.position.z = mHand.position.z = 0.08; clock.add(hHand, mHand);
    const hh = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.5, 0.02), M.matte(0x16181d)); hh.position.y = 0.22; hHand.add(hh);
    const mh = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.74, 0.02), M.matte(0xd04a3c)); mh.position.y = 0.34; mHand.add(mh);
    const lT = stage.label('', [PX + 2.6, Y + 3.95, 0.6], world, 'hot'); lT.element.style.setProperty('--c', COL.temp);
    const lPot = stage.label('', [PX, Y - 0.1, 2.3], world, 'hot');
    const lClock = stage.label('', [PX + 4.6, Y + 1.35, -1.2], world);
    const lMark = stage.label('level when mixed', [PX - R - 0.75, Y + H * FILL + 0.1, 0.9], world);
    const lVol = stage.label('', [PX - R - 0.6, Y + 3, 0.9], world, 'hot'); lVol.element.style.setProperty('--c', COL.gas);

    let S = { ...this.defaults }, key = '', volK = 1;
    const chart = board(root, CHART.w, CHART.h, CHART.px, CHART.py, (g, w, h) => {
      panelBg(g, w, h);
      const rows = batch(S), r = rowAt(rows, S.hours);
      title(g, 'Volume and pH', `batter at ${tempOf(S)} °C`);
      const { X, Y, x0, x1, y0, y1 } = axes(g, w, h, { x1: w - 50, xMin: 0, xMax: HOURS, yMin: 1, yMax: 3, xTicks: [0, 12, 24, 36], yTicks: [1, 1.5, 2, 2.5, 3], xFmt: (v) => v + ' h', yFmt: (v) => '×' + v });
      const P = (ph) => y0 - ((ph - 3.5) / 3) * (y0 - y1);
      g.fillStyle = 'rgba(92,225,169,.15)'; g.fillRect(x0, P(4.95), x1 - x0, P(4.3) - P(4.95)); note(g, 'pH for good idli', x1 - 6, P(4.5), COL.good, 11, 'right');
      const pick = rows.filter((_, i) => i % 3 === 0);
      line(g, pick.map((q) => [q.t, Math.min(3, q.vol)]), X, Y, COL.gas, 4);
      g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.setLineDash([7, 4]); g.beginPath(); pick.forEach((q, i) => (i ? g.lineTo(X(q.t), P(q.ph)) : g.moveTo(X(q.t), P(q.ph)))); g.stroke(); g.setLineDash([]);
      [4, 5, 6].forEach((p) => note(g, 'pH ' + p, x1 + 4, P(p) + 4, 'rgba(255,255,255,.75)', 11));
      note(g, 'volume', x0 + 8, y1 + 12, COL.gas, 12); note(g, '- - pH', x0 + 70, y1 + 12, '#fff', 12);
      dot(g, X(r.t), Y(Math.min(3, r.vol)), COL.gas, 6); dot(g, X(r.t), P(r.ph), '#fff', 5);
    }, CHART_POS);

    return {
      update(dt, s, time) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s;
        const narrow = fitNarrow(stage, [lClock, lMark]);
        placeChart(stage, chart, narrow);
        const rows = batch(s), r = rowAt(rows, s.hours), v = verdict(r), T = tempOf(s);
        volK += (r.vol - volK) * (1 - Math.exp(-dt * 8));
        const cap = 1 / FILL, shown = Math.min(volK, cap), bh = H * FILL * shown - 0.06, over = volK > cap - 0.02;
        bat.scale.y = bh; bat.position.y = 0.06 + bh / 2;
        const dome = 0.05 + 0.13 * clamp(volK - 1, 0, 1) - (r.vol < r.peak - 0.1 ? 0.1 : 0);   // domed when rising, dished when it sinks
        top.scale.set(1, Math.max(0.01, Math.abs(dome)) / (R - 0.05), 1); top.position.y = 0.06 + bh; top.rotation.x = dome < 0 ? Math.PI : 0;
        const sour = clamp((5.2 - r.ph) / 1.2, 0, 1);
        batMat.color.set(COL.batter).lerp(col.set(0xfffdf6), clamp(volK - 1, 0, 1) * 0.6); topMat.color.copy(batMat.color);
        const gasK = clamp((volK - 1) / 1.0, 0, 1.3);
        bub.forEach((b, i) => {
          const k = clamp((gasK * 1.3 - b.on * 0.7) / 0.4, 0, 1);
          if (k < 0.03) { bubs.hide(i); return; }
          // on the cut face: the wall is missing between −CUT/2 and CUT/2 around +z
          const y = 0.12 + b.h * Math.max(0.1, bh - 0.12), rr = (R - 0.07);
          bubs.place(i, rr * Math.sin(b.a), y, rr * Math.cos(b.a), b.r * (0.5 + 0.8 * k) * (1 + 0.5 * sour * b.on), b.r * (0.5 + 0.8 * k), 0, 0, b.r * 0.4);
        });
        bubs.done();
        lid.position.y = Math.max(H + 0.04, 0.06 + bh + Math.max(0, dome) + 0.05); lid.rotation.z = over ? 0.08 : 0;
        spill.visible = over;
        oven.visible = ovenE.visible = lamp.visible = s.place === 'oven';
        const mlen = 0.2 + clamp(T / 50, 0, 1) * 2.9; merc.scale.y = mlen; merc.position.y = 0.35 + mlen / 2;
        const hr = (21 + s.hours) % 24, h12 = Math.floor(hr) % 12 || 12;
        hHand.rotation.z = -(hr / 12) * TAU; mHand.rotation.z = -(s.hours % 1) * TAU;
        lT.element.innerHTML = `<b>${T} °C</b>`;
        lPot.element.style.setProperty('--c', v.col); lPot.element.innerHTML = `<b>${v.n}</b>`;
        lClock.element.innerHTML = `${h12}:${String(Math.floor((hr % 1) * 60)).padStart(2, '0')} ${hr >= 12 ? 'pm' : 'am'}${s.hours >= 24 ? ' · next day' : ''}`;
        lVol.element.innerHTML = `<b>× ${r.vol.toFixed(2)}</b>${over ? ' · overflowing' : ''}`;
        const k2 = [s.hours, s.room, s.place, s.salt, s.ratio].join('|'); if (k2 !== key) { key = k2; chart.redraw(); }
      },
      readout: (s) => {
        const rows = batch(s), r = rowAt(rows, s.hours), v = verdict(r), pk = peakOf(rows);
        const t0 = timeTo(rows, (q) => verdict(q).k === 'ready'), t1 = t0 === Infinity ? Infinity : timeTo(rows, (q) => q.t > t0 && verdict(q).k !== 'ready');
        return `<div class="big" style="color:${v.col}">${v.n}</div>
          <div class="row"><span>Batter volume</span><b style="color:${COL.gas}">× ${r.vol.toFixed(2)}</b></div>
          <div class="row"><span>pH · taste</span><b style="color:${COL.acid}">${r.ph.toFixed(2)} · ${sourWord(r.ph)}</b></div>
          <div class="row"><span>Lactic bacteria per gram</span><b style="color:${COL.leuco}">${fmtN(r.N)}</b></div>
          <div class="row"><span>Highest rise</span><b>${pk.vol < 1.1 ? 'none within 36 h' : '× ' + pk.vol.toFixed(1) + ' at ' + fmtH(pk.t)}</b></div>
          <div class="row"><span>Good for idli</span><b style="color:${COL.good}">${t0 === Infinity ? 'not within 36 h' : fmtH(t0) + ' to ' + (t1 === Infinity ? '36 h+' : fmtH(t1))}</b></div>
          <small>A model with fitted constants, not a kitchen timer. Grain, water and the microbes on them vary.</small>`;
      },
    };
  },
};
