// The numbers behind IdliClear: what the grains hold, how the wild ferment sours and raises the
// batter, and how steam cooks an idli. No 3D here, so the models can be run and checked on their own.
// Everything marked "typical" or "illustrative" is a mid-range value or a fitted constant, not a law.

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export function interp(tab, x) {
  if (x <= tab[0][0]) return tab[0][1];
  for (let i = 1; i < tab.length; i++) if (x <= tab[i][0]) { const [x0, y0] = tab[i - 1], [x1, y1] = tab[i]; return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0); }
  return tab[tab.length - 1][1];
}

// ---------------------------------------------------------------- the grains
// Rounded composition of the dry grains, grams in 100 g. Parboiled milled rice and dehusked black
// gram (urad dal) after the Indian Food Composition Tables 2017 (ICMR-NIN, Longvah et al.) and the
// USDA figures quoted on Wikipedia's Vigna mungo page (protein 25.2 g, carbohydrate 59 g). We could
// not open the IFCT tables to check the decimals, so the values are rounded and labelled "about".
export const GRAIN = {
  rice: { n: 'Idli rice (parboiled)', starch: 77, protein: 8, fibre: 3, fat: 0.6, water: 10, other: 1.4 },
  dal: { n: 'Urad dal (black gram)', starch: 47, protein: 24, fibre: 12, fat: 1.5, water: 10, other: 5.5 },
};
export const PARTS = [
  { k: 'starch', n: 'Starch and sugars', col: '#f4f1e8' },
  { k: 'protein', n: 'Protein', col: '#ffb547' },
  { k: 'fibre', n: 'Fibre and gum', col: '#8ef0c0' },
  { k: 'water', n: 'Water', col: '#6fb6ff' },
  { k: 'fat', n: 'Fat', col: '#ffd166' },
  { k: 'other', n: 'Minerals and the rest', col: '#c49bff' },
];
// ratio = parts of rice to one part of dal, by weight. Homes use 2:1 to 4:1.
export const dalFrac = (ratio) => 1 / (1 + ratio);
export function mix(ratio) {
  const d = dalFrac(ratio), o = {};
  for (const p of PARTS) o[p.k] = GRAIN.rice[p.k] * (1 - d) + GRAIN.dal[p.k] * d;
  return o;
}
// Batter: about 2 to 2.2 parts of water to one of dry grain by weight once soaked and ground
// (typical home batter; Steinkraus, Handbook of Indigenous Fermented Foods, gives similar figures).
export const WATER_PER_GRAIN = 2.0;

// ---------------------------------------------------------------- acid and pH
// Fresh batter is about pH 6 and ends near 4.2 to 4.7. Measured ranges:
//   Ghosh & Chattopadhyay 2011 (J. Food Sci. Technol. 48: 610): pH 5.9 falling to 4.2, total acidity
//   0.44 to 0.91% as lactic acid, batter volume 1.62 to 3.2 times, over 22 h at 20 to 26 °C;
//   Sridevi, Halami & Vijayendra 2010 (J. Food Sci. Technol. 47: 557): fresh batter pH 6.73, about
//   4.3 to 4.4 after long storage; Mukherjee et al. 1965 (Applied Microbiology 13: 227) for the microbes.
// The table joins those end points with a smooth buffered curve (the shape is typical, not measured).
const TITRATION = [[0.40, 6.1], [0.44, 5.9], [0.50, 5.6], [0.58, 5.2], [0.66, 4.9], [0.75, 4.6], [0.83, 4.4], [0.91, 4.2], [1.05, 4.0], [1.25, 3.8], [1.6, 3.6]];
export const TA0 = 0.42;
export const phOfAcid = (ta) => interp(TITRATION, ta);

// ---------------------------------------------------------------- the microbes
// Nobody adds a starter. The bacteria ride in on the grains, mostly the dal (Mukherjee et al. 1965).
// Two teams:
//   leuco: Leuconostoc mesenteroides, heterofermentative. From each glucose it makes one lactic
//          acid, one CO2 and one ethanol (or acetate). It grows best near 30 °C and tolerates salt
//          (to about 3%, some strains 6.5%), but its own acid stops it near pH 4.4.
//   late:  the homofermentative lactic bacteria that follow it (Enterococcus faecalis, called
//          Streptococcus faecalis in 1965, then Pediococcus). Two lactic acids per glucose and no
//          gas. They like it warmer (best about 37 °C) and stand more acid.
// Growth against temperature: the cardinal temperature model of Rosso et al. (1993). The peak rates
// are typical for lactic bacteria in a rich medium (doubling in about 45 to 60 minutes).
// Yeasts (Saccharomyces, Debaryomyces, Trichosporon; Soni & Sandhu 1989 to 1991) join in some
// batters and add flavour and vitamins. They are left out of the arithmetic here.
export const TEAMS = {
  leuco: { n: 'Leuconostoc mesenteroides', Tmin: 6, Topt: 30, Tmax: 41, mu: 0.92, phStop: 4.3, salt: 0.07, col: '#8fb0ff' },
  late: { n: 'Later acid makers (Enterococcus, Pediococcus)', Tmin: 12, Topt: 37, Tmax: 47, mu: 0.80, phStop: 3.7, salt: 0.16, col: '#ff8a5c' },
};
export function ctmi(T, { Tmin, Topt, Tmax, mu }) {
  if (T <= Tmin || T >= Tmax) return 0;
  const a = (T - Tmax) * (T - Tmin) * (T - Tmin), b = (Topt - Tmin) * ((Topt - Tmin) * (T - Topt) - (Topt - Tmax) * (Topt + Tmin - 2 * T));
  return Math.max(0, (mu * a) / b);
}
export const doubling = (T, team = TEAMS.leuco) => { const m = ctmi(T, team); return m > 1e-6 ? (Math.LN2 / m) * 60 : Infinity; };
// Counts per gram of batter. The bacteria already multiply during the hours of soaking, so fresh
// batter starts with around a million lactic bacteria per gram (typical; reports vary widely) and
// ends near a billion (reported peaks: 10⁸ to 10⁹, sometimes 10¹⁰ per gram).
export const N0 = 3e6, N_MAX = 1.5e9, LAG_H = 1.0;
// Acid making (Luedeking & Piret 1959): rate = α × growth + β × number alive.
// α and β are fitted so that 3:1 batter with 1% salt at 30 °C is ready (pH about 4.6, about twice
// its volume) in 10 to 12 hours, and at 22 °C needs most of a day, as homes and the papers report.
const ALPHA = 0.17 / 1e9, BETA = 0.03 / 1e9;
// Gas. Heterofermentation gives one CO2 (44 g) for each lactic acid (90 g). One mole of gas at
// 30 °C fills about 24.9 litres. So 1 g of Leuconostoc's lactic acid comes with 0.28 L of CO2.
export const CO2_L_PER_G_ACID = (1 / 90) * 24.9;
// Water holds about 0.66 L of CO2 per litre at 30 °C under pure CO2 (Henry's law), so the first
// gas dissolves before any bubble grows (batter is about two-thirds water; bubbles are not pure CO2).
const CO2_DISSOLVE = 0.3;
// Counting only this CO2 gives too small a rise against the measured 1.6 to 3.2 times. Batter also
// gets gas from yeasts where they are present, starts with air beaten in by the grinder, and the
// measured "acidity" misses acid already neutralised by the batter's buffers. GAS_FIT lumps these
// together. It is a fitted constant, chosen to land in the measured range of rise.
const GAS_FIT = 2.3;
// How much of the gas the batter keeps: urad's gum (an arabinogalactan) and its surface-active
// globulin protein make and steady the foam (Susheelamma & Rao 1979). More dal, better hold.
// Illustrative fit: 4:1 holds about 40%, 2:1 about 62%.
export const holdFrac = (ratio) => clamp(0.07 + 1.65 * dalFrac(ratio), 0.15, 0.7);

// Run a batch. T = temperature the batter is kept at (°C), salt in % of batter weight (added before
// fermenting), ratio = rice parts per one dal, hours. One row every STEP hours:
// { t, nl, nh, N, ta, ph, co2 (litres made per kg), vol (times the starting volume), peak }.
export const STEP = 0.1;
const cache = new Map();
export function runFerment({ T = 30, salt = 1, ratio = 3, hours = 36 } = {}) {
  const key = [T, salt, ratio, hours].join('|');
  if (cache.has(key)) return cache.get(key);
  const d = dalFrac(ratio), hold = holdFrac(ratio), rows = [];
  let nl = N0 * (d / 0.25) * 0.8, nh = N0 * 0.2, ta = TA0, co2 = 0, gas = 0, peak = 1;
  const sub = 6, h = STEP / sub;
  for (let i = 0; i <= Math.round(hours / STEP); i++) {
    const t = i * STEP, ph = phOfAcid(ta), vol = 1 + gas;
    peak = Math.max(peak, vol);
    rows.push({ t, nl, nh, N: nl + nh, ta, ph, co2, vol, peak });
    for (let j = 0; j < sub; j++) {
      const tt = t + j * h, p = phOfAcid(ta), lag = clamp(tt / LAG_H, 0.15, 1), room = Math.max(0, 1 - (nl + nh) / N_MAX);
      let dA = 0, dAl = 0;
      for (const k of ['leuco', 'late']) {
        const tm = TEAMS[k], n = k === 'leuco' ? nl : nh;
        const fs = Math.max(0, 1 - tm.salt * salt), fp = clamp((p - tm.phStop) / 0.7, 0, 1), mu = ctmi(T, tm) * fs;
        const grow = mu * n * room * fp * lag;
        const a = ALPHA * grow + BETA * n * (mu / tm.mu) * fp;
        dA += a; if (k === 'leuco') dAl = a;
        if (k === 'leuco') nl += grow * h; else nh += grow * h;
      }
      ta += dA * h;
      // litres of CO2 per kg of batter: dAl is % (g per 100 g) per hour, so ×10 for g per kg
      const made = dAl * 10 * CO2_L_PER_G_ACID * GAS_FIT * h;
      const before = co2; co2 += made;
      const free = Math.max(0, co2 - CO2_DISSOLVE) - Math.max(0, before - CO2_DISSOLVE);
      // bubbles leak: slowly always, faster once the batter is sour (the protein film weakens) and
      // once the foam is tall (big bubbles merge and break at the top). Illustrative.
      const leak = 0.02 + 0.22 * clamp((4.45 - p) / 0.45, 0, 1) + 0.05 * clamp(gas - 1.6, 0, 1);
      gas = Math.max(0, gas + free * hold * (1 / 0.95) - leak * gas * h);   // 1 kg of batter is about 0.95 L
    }
  }
  if (cache.size > 300) cache.clear();
  cache.set(key, rows);
  return rows;
}
export const rowAt = (rows, t) => rows[clamp(Math.round(t / STEP), 0, rows.length - 1)];
export const timeTo = (rows, f) => { const r = rows.find(f); return r ? r.t : Infinity; };
export const peakOf = (rows) => rows.reduce((b, r) => (r.vol > b.vol ? r : b), rows[0]);
export function verdict(r) {
  if (r.vol < 1.12 && r.ph > 5.3) return { k: 'flat', n: r.t < 3 ? 'Fresh batter' : 'Not risen: still raw batter', col: '#6fb6ff' };
  if (r.vol < r.peak - 0.12 && r.ph < 4.45) return { k: 'over', n: 'Over-fermented: sour and sinking', col: '#ff6b6b' };
  if (r.ph < 4.15) return { k: 'over', n: 'Over-fermented: very sour', col: '#ff6b6b' };
  if (r.vol >= 1.6 && r.ph <= 4.95) return { k: 'ready', n: 'Ready: light and mildly sour', col: '#5ce1a9' };
  if (r.ph <= 4.7) return { k: 'sourflat', n: 'Sour but poorly risen', col: '#ffb547' };
  return { k: 'rising', n: 'Rising', col: '#ffd166' };
}
export const sourWord = (ph) => (ph > 5.6 ? 'not sour' : ph > 5.0 ? 'faintly sour' : ph > 4.5 ? 'mildly sour' : ph > 4.2 ? 'sour' : 'sharply sour');

// ---------------------------------------------------------------- steaming
// Steam at 100 °C condenses on the cooler batter and gives up its latent heat, 2,257 kJ per kg,
// so the surface of the idli reaches 100 °C almost at once. Inside, heat creeps in by conduction.
// An idli is a thick lens: we treat it as a slab of thickness L heated from both faces (the plate
// under it is thin, perforated metal with steam below). Centre temperature from the Fourier series
// for a slab. Thermal diffusivity of the foamy batter: about 1.6 × 10⁻⁷ m²/s (conductivity about
// 0.3 W/m·K, density about 600 kg/m³ for risen batter, specific heat about 3.3 kJ/kg·K: typical
// values for a wet starch foam, not measured on idli).
export const LATENT = 2257, C_BATTER = 3.3, ALPHA_T = 1.6e-7;
// steamT: temperature of the gas around the idlis. Lid on and water boiling: 100 °C at sea level.
export function slabT(x, tSec, { L = 0.024, T0 = 28, steamT = 100 } = {}) {
  // x from 0 (centre) to 1 (surface)
  if (tSec <= 0) return T0;
  const a = L / 2; let s = 0;
  for (let n = 0; n < 40; n++) { const m = 2 * n + 1; s += ((n % 2 ? -1 : 1) / m) * Math.exp((-m * m * Math.PI * Math.PI * ALPHA_T * tSec) / (4 * a * a)) * Math.cos((m * Math.PI * x) / 2); }
  return steamT - (steamT - T0) * clamp((4 / Math.PI) * s, 0, 1);
}
export function meanT(tSec, o) { let s = 0; for (let i = 0; i < 12; i++) s += slabT((i + 0.5) / 12, tSec, o); return s / 12; }
// Rice starch gelatinises at roughly 65 to 78 °C and the dal proteins set over about the same
// range. We call the idli done when its centre passes 85 °C, safely above both (a working
// threshold, not a standard).
export const GEL_T = [65, 78], DONE_T = 85;
// How far a spot has set, 0 to 1, from its temperature.
export const setFrac = (T) => clamp((T - GEL_T[0]) / (DONE_T - GEL_T[0]), 0, 1);
export function doneTime(o) { for (let t = 0; t <= 3600; t += 10) if (slabT(0, t, o) >= DONE_T) return t; return Infinity; }
// Grams of steam that must condense to heat one idli of mass m (g) from T0 to about 97 °C.
export const steamNeeded = (m = 40, T0 = 28) => (m * C_BATTER * (97 - T0)) / LATENT;
// Bubbles swell in the heat. A dry gas alone grows by 373/301 = 1.24 (Charles's law). Water
// evaporating into the bubbles pushes them further until the batter sets around them.
// Height gain of the idli, illustrative: up to about 25% for a well-risen batter.
export const steamRise = (meanTemp, T0 = 28) => 1 + 0.25 * clamp((meanTemp - T0) / (80 - T0), 0, 1);

// ---------------------------------------------------------------- the grinder
// A table-top wet grinder: the steel drum with a granite floor turns at about 150 rpm (typical for
// 2-litre models) under two granite roller stones on a fixed arm. The floor drags the rollers
// round on their own axles; the grain is crushed in the nip between roller and floor.
// Rollers are truncated cones whose tips point at the drum's axis, so they roll without slipping:
// spin rate = drum rate × (distance from the axis ÷ roller radius at that distance).
export const GRINDER = { rpm: 150, watts: 150, stoneKg: 6, cStone: 0.79, cBatter: 3.5 };
// Particle size while grinding, illustrative first-order fall. Urad is ground until smooth and
// fluffy (about 20 to 30 minutes); rice is stopped while still slightly gritty, like fine rava
// (a few tenths of a millimetre), which gives the idli its grain and lets steam through.
export const GRIND = {
  dal: { n: 'Urad dal', start: 4, end: 0.05, tau: 4.5, kg: 0.25, water: 0.75, fluff: 1.9 },
  rice: { n: 'Idli rice', start: 5, end: 0.12, tau: 4.5, kg: 0.75, water: 0.75, fluff: 1.0 },
};
export const grainSize = (what, min) => { const g = GRIND[what]; return g.end + (g.start - g.end) * Math.exp(-min / g.tau); };   // mm
// Air beaten into urad batter: its gum and protein hold fine bubbles, so the batter grows to nearly
// twice the volume of the paste (cooks test it by dropping a bit in water: it floats). Illustrative.
export const fluffOf = (what, min) => 1 + (GRIND[what].fluff - 1) * (1 - Math.exp(-min / 9));
// Friction warms the batter: we take about 45% of the motor rating as heat into stone and batter
// (estimate), which gives the 8 to 12 °C rise cooks notice over a 25 to 30 minute grind.
export function grindTemp(what, min, T0 = 28, rpmK = 1) {
  const g = GRIND[what], C = (g.kg + g.water) * GRINDER.cBatter + GRINDER.stoneKg * GRINDER.cStone;   // kJ/K
  const tau = 55;   // minutes: loss to the air (estimate)
  const rise = ((GRINDER.watts * 0.45 * rpmK * 60) / 1000 / C) * tau;   // K at steady state
  return T0 + rise * (1 - Math.exp(-min / tau));
}

// ---------------------------------------------------------------- staling
// Cooked starch slowly re-forms crystals (retrogradation) and the idli firms up. It is fastest just
// above freezing, slow at room temperature and almost stopped in the freezer, as with bread and
// rice. Avrami-type curve; the rate constants are illustrative, set so a day in the fridge firms
// an idli about as much as two or three days would at 30 °C if it did not spoil first.
export function firmFrac(hoursStored, where = 'fridge') {
  const k = { counter: 0.012, fridge: 0.045, freezer: 0.002 }[where];
  return 1 - Math.exp(-k * hoursStored);
}
