// Chapter 2: soak and grind. A table-top stone wet grinder, drawn with a see-through drum.
// Scale: 1 unit ≈ 4 cm (the drum is about 19 cm across).
// How it turns: the motor in the base spins the steel drum and its granite floor about the upright
// axis, about 150 rpm for a 2-litre machine (typical). The two granite roller stones hang from an arm
// that is locked to the body, so they do not travel round. The moving floor drags them, and each
// roller spins on its own axle. The rollers are cones whose tips meet on the drum's axis, so they
// roll on the floor without skidding: spin rate = drum rate ÷ sin(half-angle of the cone).
// With a 25° half-angle that is 2.4 turns of the roller for each turn of the drum.
// Seen from above the drum turns anticlockwise here; under the right-hand roller the floor moves
// away from the viewer, so the top of that roller comes towards the viewer.
// The motion on screen is slowed 6 times so the eye can follow it.
// Particle size, fluffing and warming come from model.js (illustrative curves, typical end points).
import { THREE, M, VIEW, COL, CHART, CHART_POS, GRINDER, GRIND, TAU, hex, rng, board, panelBg, title, note, axes, line, dot, dots, counterTop, fitNarrow, placeChart, grainSize, fluffOf, grindTemp, clamp, lerp } from '../idli.js';

const BETA = (25 * Math.PI) / 180, SLOW = 6;
const sizeWord = (mm) => (mm > 2 ? 'whole grains' : mm > 0.6 ? 'broken bits' : mm > 0.25 ? 'coarse rava' : mm > 0.09 ? 'fine rava: gritty' : 'smooth paste');
const fmtMm = (mm) => (mm >= 1 ? mm.toFixed(1) + ' mm' : Math.round(mm * 1000) + ' µm');

export default {
  id: 'grind',
  short: 'Soak and grind',
  title: 'Stone on stone',
  subtitle: 'Soaked grain goes into a wet grinder. Urad is ground until it is smooth and full of air. Rice is stopped while still a little gritty.',
  view: { pos: [0, 6.6, 9.4], target: [0, 2.7, 0] },
  learn: `<p>First the grains are <b>soaked</b>, rice and dal in separate bowls, for four to six hours. Dry grain is hard as a pebble. Soaked grain is swollen and soft enough to crush. Soaking also wakes up the bacteria living on the grain, which matters in the next chapter.</p>
    <p>Then they are ground with water. For centuries that meant a stone mortar, the <i>aattukal</i>, and an hour of hard work. Today a <b>wet grinder</b> does it. The <b>drum turns</b> and its floor is a slab of granite. Two granite <b>roller stones</b> hang from a fixed arm and roll on that floor. Grain is dragged into the gap and crushed between stone and stone. A mixie with blades can do the job too, but it cuts instead of crushing and heats the batter more: see <a href="https://glassbox.how/mixerclear/" target="_blank" rel="noopener">MixerClear</a>.</p>
    <p>The two grains are ground <b>differently</b>. <b>Urad dal</b> goes for 20 to 30 minutes with water added a little at a time, until it is smooth, white and <b>fluffy</b>. Its gum and protein trap air, and the batter swells to nearly twice its size. Cooks test it by dropping a blob in water: good urad batter floats. <b>Rice</b> is stopped earlier, while it still feels like <b>fine rava</b> between the fingers. That grit gives the idli its grain and keeps it from turning into a sticky cake.</p>
    <p>Grinding also <b>warms</b> the batter by rubbing. A warm batter ferments well, but a hot one can turn sour too fast, so cooks use cold water in summer. Then the two batters are mixed, usually with salt, by hand.</p>
    <p class="tip"><b>Try it:</b> slide the minutes and watch the bits shrink on the chart. Switch between urad and rice and compare where each should stop. Follow one roller stone: which way does it spin when the drum turns?</p>`,
  terms: [
    { t: 'Wet grinder', d: 'A machine with a turning drum and granite roller stones that crushes soaked grain with water into batter.' },
    { t: 'Aattukal', d: 'The Tamil name for the old stone mortar with a hand-turned pestle, used to grind batter before motors.' },
    { t: 'Roller stone', d: 'A cone of granite that spins on its own axle as the drum floor moves under it.' },
    { t: 'Aeration', d: 'Beating air into a batter. Urad batter holds the air as fine bubbles.' },
    { t: 'Rava texture', d: 'A fine grit, a few tenths of a millimetre across, like semolina.' },
    { t: 'Friction', d: 'The rubbing force between surfaces. It turns motion into heat, so grinding warms the batter.' },
  ],
  defaults: { what: 'dal', min: 0, run: true, T0: 28 },
  controls: [
    { key: 'what', type: 'seg', label: 'In the drum', options: [{ v: 'dal', label: 'Urad dal' }, { v: 'rice', label: 'Idli rice' }], fmt: (v) => (v === 'dal' ? 'grind until smooth and fluffy' : 'stop while slightly gritty') },
    { key: 'min', type: 'range', label: 'Minutes of grinding', min: 0, max: 40, step: 0.5, ends: ['0', '40 min'], fmt: (v, s) => `${v.toFixed(0)} min · ${sizeWord(grainSize(s.what, v))}` },
    { key: 'T0', type: 'range', label: 'Kitchen and water temperature', min: 10, max: 40, step: 1, ends: ['10 °C', '40 °C'], fmt: (v) => v + ' °C' },
    { key: 'run', type: 'toggle', label: 'Motor on', hint: 'The motion is shown six times slower than real.' },
  ],
  quiz: [
    { q: 'In a table-top wet grinder, what does the motor turn?', options: ['The roller stones travel round a still drum', 'The drum and its stone floor, while the rollers stay in place and spin on their axles', 'A set of steel blades', 'Only the lid'], answer: 1, why: 'The drum turns. The roller stones hang from a locked arm, and the moving floor makes them spin where they are.' },
    { q: 'Why is rice ground a little coarse, like rava?', options: ['To save electricity', 'The grit gives the idli its grain and stops it becoming a dense, sticky cake', 'Coarse rice is sweeter', 'Fine rice kills bacteria'], answer: 1, why: 'Slightly gritty rice sets into an open crumb. A fine rice paste packs tight and steams into a sticky, heavy idli.' },
    { q: 'Good urad batter floats when a blob is dropped in water. Why?', options: ['It is full of tiny air bubbles beaten in during grinding', 'Dal is lighter than water', 'It contains oil', 'It is frozen'], answer: 0, why: 'Urad\'s gum and protein trap air as fine bubbles, so the fluffy batter is less dense than water.' },
  ],
  reel: [
    { ms: 5600, caption: 'In a wet grinder the drum turns and two granite stones roll in place, crushing soaked grain between stone and stone.', set: { what: 'dal', run: true, T0: 28 }, anim: { min: [0, 25] }, view: { pos: [0.4, 6.4, 7.4], target: [0.4, 2.3, 0] }, spin: 0.25 },
    { ms: 5000, caption: 'Urad dal is ground smooth and fluffy with air. Rice is left a little gritty, like rava.', set: { what: 'rice', run: true, T0: 28 }, anim: { min: [0, 18] }, view: { pos: [0.4, 6.4, 7.4], target: [0.4, 2.3, 0] }, spin: 0.25 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const world = new THREE.Group(); world.position.set(-0.3, 0.45, 0); world.scale.setScalar(0.86); root.add(world);
    const rnd = rng(9), col = new THREE.Color();
    counterTop(world, 10.5, 5.6);
    const Y0 = 0.3;
    // ---- body with the motor
    const body = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.4, 1.5, 56), M.plastic(0xb23a3a, { roughness: 0.4 })); body.position.y = Y0 + 0.75; body.castShadow = true; world.add(body);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(2.27, 2.27, 0.12, 56), M.plastic(0xe9e2d6)); band.position.y = Y0 + 1.42; world.add(band);
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 20), M.plastic(0x22252b)); knob.rotation.x = Math.PI / 2; knob.position.set(0, Y0 + 0.75, 2.36); world.add(knob);
    // ---- the drum (turns)
    const DR = 2.0, DH = 2.3, DY = Y0 + 1.55;
    const drum = new THREE.Group(); drum.position.y = DY; world.add(drum);
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(DR, DR, DH, 64, 1, true), new THREE.MeshStandardMaterial({ color: 0xdfe6ee, metalness: 0.6, roughness: 0.25, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false })); wall.position.y = DH / 2; drum.add(wall);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(DR, 0.06, 10, 64), M.metal(0xdfe3ea)); rim.rotation.x = Math.PI / 2; rim.position.y = DH; drum.add(rim);
    const rimLo = new THREE.Mesh(new THREE.TorusGeometry(DR, 0.05, 10, 64), M.metal(0xdfe3ea)); rimLo.rotation.x = Math.PI / 2; rimLo.position.y = 0.02; drum.add(rimLo);
    const FLOOR = 0.3;
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(DR - 0.03, DR - 0.03, FLOOR, 56), M.matte(hex(COL.stone))); floor.position.y = FLOOR / 2; floor.receiveShadow = true; drum.add(floor);
    // marks on the drum so its turning can be seen
    for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU, mk = new THREE.Mesh(new THREE.BoxGeometry(0.12, DH * 0.86, 0.03), M.glow(0x8ef0ff, { transparent: true, opacity: 0.75 })); mk.position.set(DR * Math.sin(a), DH / 2, DR * Math.cos(a)); mk.rotation.y = a; drum.add(mk); }
    for (let i = 0; i < 10; i++) { const a = rnd() * TAU, r = 0.3 + rnd() * 1.5, sp = new THREE.Mesh(new THREE.CircleGeometry(0.05 + rnd() * 0.07, 8), M.matte(0x8b9097)); sp.rotation.x = -Math.PI / 2; sp.position.set(r * Math.cos(a), FLOOR + 0.004, r * Math.sin(a)); drum.add(sp); }
    // ---- roller assembly (does not travel)
    const asm = new THREE.Group(); asm.position.y = DY + FLOOR; world.add(asm);
    const S0 = 0.5, S1 = 1.85, tanB = Math.tan(BETA);
    const rollers = [0, Math.PI].map((ang, i) => {
      const arm = new THREE.Group(); arm.rotation.y = ang; asm.add(arm);
      const tilt = new THREE.Group(); tilt.rotation.z = BETA; arm.add(tilt);          // axis rises from the centre at the cone's half-angle
      const spin = new THREE.Group(); tilt.add(spin);
      const geo = new THREE.CylinderGeometry(S1 * tanB, S0 * tanB, S1 - S0, 40); geo.rotateZ(-Math.PI / 2);   // along +x, wide end outward
      const stone = new THREE.Mesh(geo, M.matte(0x6a6f77)); stone.position.x = (S0 + S1) / 2; stone.castShadow = true; spin.add(stone);
      // speckles and a painted stripe so the spin shows
      for (let j = 0; j < 4; j++) {
        const h = new THREE.Group(); h.rotation.x = (j / 4) * TAU; spin.add(h);
        const sm = (S0 + S1) / 2, st = new THREE.Mesh(new THREE.BoxGeometry((S1 - S0) / Math.cos(BETA) - 0.12, 0.03, 0.09), M.glow(j === 0 ? 0xffb547 : 0xaab0b8));
        st.position.set(sm, sm * tanB + 0.012, 0); st.rotation.z = BETA; h.add(st);
      }
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16), M.metal(0xdfe3ea)); cap.rotation.z = Math.PI / 2; cap.position.x = S1 + 0.05; spin.add(cap);
      const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, S1 + 0.1, 12), M.metal(0xb9bec8)); axle.rotation.z = Math.PI / 2; axle.position.x = (S1 + 0.1) / 2; tilt.add(axle);
      return spin;
    });
    const hubY = 0.0;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, DH + 0.5, 16), M.metal(0xb9bec8)); post.position.y = hubY + (DH + 0.5) / 2 - 0.05; asm.add(post);
    const hub = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), M.metal(0xdfe3ea)); hub.position.y = 0.02; asm.add(hub);
    // locking arm across the top to a pillar on the body: this is what stops the rollers travelling
    const TOP = DH - FLOOR + 0.42;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(DR + 0.75, 0.16, 0.3), M.plastic(0x22252b)); bar.position.set(-(DR + 0.75) / 2 + 0.1, TOP, 0); asm.add(bar);
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.3, DH + 0.5, 0.42), M.plastic(0x22252b)); pillar.position.set(-DR - 0.5, TOP - (DH + 0.5) / 2, 0); asm.add(pillar);
    // scraper: a fixed plastic blade that pushes batter off the wall back to the stones
    const scraper = new THREE.Mesh(new THREE.BoxGeometry(0.06, DH * 0.7, 0.5), M.plastic(0xe9e2d6)); scraper.position.set(0.55, DH * 0.42, -(DR - 0.32)); scraper.rotation.y = 0.5; asm.add(scraper);
    const scArm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, DR - 0.3), M.plastic(0x22252b)); scArm.position.set(0.28, TOP - 0.05, -(DR - 0.3) / 2); scArm.rotation.y = 0.3; asm.add(scArm);
    // ---- batter and grain bits
    const batMat = new THREE.MeshStandardMaterial({ color: hex(COL.batter), roughness: 0.45, transparent: true, opacity: 0.93 });
    const bat = new THREE.Mesh(new THREE.CylinderGeometry(DR - 0.06, DR - 0.06, 1, 56), batMat); drum.add(bat);
    const NB = 260, bits = dots(NB, 1, 0xffffff, 8, true, { roughness: 0.6 }); world.add(bits);
    const bit = Array.from({ length: NB }, () => ({ r: 0.35 + Math.sqrt(rnd()) * (DR - 0.5), a: rnd() * TAU, h: rnd(), w: 0.75 + rnd() * 0.4, ry: rnd() * TAU, ph: rnd() * TAU }));
    // ---- arrows showing the turning
    const arc = (R, y, a0, a1, color, parent) => {
      const pts = []; for (let i = 0; i <= 24; i++) { const a = a0 + ((a1 - a0) * i) / 24; pts.push(new THREE.Vector3(R * Math.sin(a), y, R * Math.cos(a))); }
      const g = new THREE.Group(), t = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.035, 8), M.glow(color)); g.add(t);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.3, 12), M.glow(color)); const e = pts[24], d = e.clone().sub(pts[23]).normalize(); head.position.copy(e); head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); g.add(head);
      parent.add(g); return g;
    };
    const drumArrow = arc(DR + 0.28, DY + DH * 0.55, -0.9, 0.9, 0x8ef0ff, world);   // anticlockwise seen from above: +z side moves towards +x
    // ---- soaking bowls beside the grinder
    const soak = (x, z, color, name) => {
      const g = new THREE.Group(); g.position.set(x, Y0, z); world.add(g);
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.6, 0.7, 36, 1, true), M.metal(0xc9ced6, { side: THREE.DoubleSide, roughness: 0.3 })); b.position.y = 0.35; g.add(b);
      const fl = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.04, 36), M.metal(0xc9ced6)); fl.position.y = 0.02; g.add(fl);
      const gr = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.62, 0.36, 36), M.matte(color)); gr.position.y = 0.24; g.add(gr);
      const wt = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.74, 0.18, 36), M.clear(0x6fb6ff, 0.35)); wt.position.y = 0.5; g.add(wt);
      return stage.label(name, [x, Y0 + 1.15, z], world);
    };
    const lS1 = soak(3.9, 1.3, hex(COL.dal), 'urad, soaking'), lS2 = soak(4.3, -0.9, hex(COL.rice), 'rice, soaking');
    const lDrum = stage.label('<b>drum turns</b> · 150 rpm', [DR + 0.6, DY + DH * 0.55 + 0.45, 1.3], world, 'hot'); lDrum.element.style.setProperty('--c', COL.gas);
    const lRoll = stage.label('', [1.35, DY + DH + 0.75, 0], world, 'hot'); lRoll.element.style.setProperty('--c', COL.temp);
    const lArm = stage.label('locked arm: rollers stay put', [-DR - 0.5, DY + DH + 1.0, 0], world);
    const lFloor = stage.label('granite floor', [-1.2, DY + 0.1, DR + 0.1], world);
    const lBat = stage.label('', [0.3, Y0 + 1.15, 2.45], world, 'hot');

    let S = { ...this.defaults }, key = '', ang = 0, lvl = 0.5;
    const chart = board(root, CHART.w, CHART.h, CHART.px, CHART.py, (g, w, h) => {
      panelBg(g, w, h);
      title(g, 'Size of the bits', 'illustrative curve · log scale');
      const { X, Y, x0, x1 } = axes(g, w, h, { xMin: 0, xMax: 40, yMin: 0.03, yMax: 6, logY: true, xTicks: [0, 10, 20, 30, 40], yTicks: [0.05, 0.1, 0.3, 1, 5], xFmt: (v) => v + ' min', yFmt: (v) => (v >= 1 ? v + ' mm' : v * 1000 + ' µm') });
      g.fillStyle = 'rgba(255,181,71,.14)'; g.fillRect(x0, Y(0.5), x1 - x0, Y(0.2) - Y(0.5)); note(g, 'rava: stop rice here', x1 - 6, Y(0.3) + 4, COL.temp, 12, 'right');
      for (const k of ['dal', 'rice']) { const pts = []; for (let m = 0; m <= 40; m += 1) pts.push([m, grainSize(k, m)]); line(g, pts, X, Y, k === S.what ? '#fff' : 'rgba(255,255,255,.3)', k === S.what ? 4 : 2, k === S.what ? null : [5, 5]); }
      note(g, 'urad', X(34), Y(grainSize('dal', 34)) + 16, S.what === 'dal' ? '#fff' : 'rgba(255,255,255,.5)', 12); note(g, 'rice', X(34), Y(grainSize('rice', 34)) - 8, S.what === 'rice' ? '#fff' : 'rgba(255,255,255,.5)', 12);
      dot(g, X(S.min), Y(grainSize(S.what, S.min)), COL.temp, 7);
    }, CHART_POS);

    return {
      update(dt, s, time) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s;
        const narrow = fitNarrow(stage, [lS1, lS2, lFloor, lArm]);
        placeChart(stage, chart, narrow);
        const w = s.run ? ((GRINDER.rpm / 60) * TAU) / SLOW : 0;   // rad/s on screen
        ang += w * dt;
        drum.rotation.y = ang;                                   // +y rotation: anticlockwise seen from above
        rollers.forEach((r) => { r.rotation.x = ang / Math.sin(BETA); });
        drumArrow.visible = s.run;
        const g = GRIND[s.what], mm = grainSize(s.what, s.min), fl = fluffOf(s.what, s.min);
        // batter level: grain + water (added bit by bit over the first minutes) + air
        const filled = (g.kg + g.water * clamp(0.35 + s.min / 12, 0, 1)) * fl;
        const target = 0.2 + 0.36 * filled;
        lvl += (target - lvl) * (1 - Math.exp(-dt * 5));
        bat.scale.y = lvl; bat.position.y = FLOOR + lvl / 2;
        const smooth = clamp(1 - (Math.log10(mm) + 1.3) / 2, 0, 1);
        batMat.color.set(s.what === 'dal' ? 0xf0e4c0 : 0xf1ece0).lerp(col.set(0xffffff), smooth * 0.6);
        batMat.opacity = 0.34 + 0.26 * smooth;
        // bits ride round with the batter (a little slower than the drum) and shrink
        const sz = clamp(mm / 5, 0.012, 1), base = s.what === 'dal' ? 0.09 : 0.11, elong = s.what === 'dal' ? 1.25 : 2.3;
        bit.forEach((b, i) => {
          b.a += w * 0.8 * dt * (0.8 + 0.4 * b.h);
          const y = DY + FLOOR + 0.05 + b.h * Math.max(0.05, lvl - 0.02) + 0.02 * Math.sin(time * 3 + b.ph);
          const k = base * (0.25 + 0.75 * Math.sqrt(sz)) * b.w, e = lerp(1, elong, sz);
          bits.place(i, b.r * Math.sin(b.a), y, b.r * Math.cos(b.a), k * e, k, b.ry + b.a, 0, k);
          bits.tint(i, col.set(s.what === 'dal' ? COL.dal : COL.rice).multiplyScalar(0.92));
        });
        bits.done();
        const T = grindTemp(s.what, s.min, s.T0);
        lRoll.element.innerHTML = `<b>roller stones</b> spin in place · ${Math.round(GRINDER.rpm / Math.sin(BETA))} rpm`;
        lBat.element.style.setProperty('--c', T > 40 ? COL.bad : COL.good);
        lBat.element.innerHTML = `<b>${g.n}: ${sizeWord(mm)}</b> · ${T.toFixed(0)} °C`;
        const k2 = [s.what, s.min].join('|'); if (k2 !== key) { key = k2; chart.redraw(); }
      },
      readout: (s) => {
        const mm = grainSize(s.what, s.min), T = grindTemp(s.what, s.min, s.T0), fl = fluffOf(s.what, s.min);
        const done = s.what === 'dal' ? (mm < 0.09 && fl > 1.7 ? 'Smooth and fluffy: stop' : 'Keep grinding') : mm > 0.5 ? 'Keep grinding' : mm > 0.2 ? 'Fine rava: stop here' : 'Too smooth for a good idli';
        return `<div class="big">${done}</div>
          <div class="row"><span>Typical size of the bits</span><b>${fmtMm(mm)} · ${sizeWord(mm)}</b></div>
          <div class="row"><span>Batter volume from air</span><b style="color:${COL.gas}">× ${fl.toFixed(2)}</b></div>
          <div class="row"><span>Batter temperature</span><b style="color:${T > 40 ? COL.bad : COL.temp}">${T.toFixed(0)} °C${T > 40 ? ' · too warm' : ''}</b></div>
          <div class="row"><span>Drum · roller stones</span><b>${GRINDER.rpm} rpm · ${Math.round(GRINDER.rpm / Math.sin(BETA))} rpm</b></div>
          <small>Illustrative curves with typical end points. A ${GRINDER.watts} W, 2-litre grinder; yours will differ.</small>`;
      },
    };
  },
};
