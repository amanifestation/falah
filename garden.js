// "Garden of Salah": a tree that grows with every prayer, bears fruit, and seeds a forest.
// The whole garden is derived from the prayer log, so it can never drift out of sync.
import * as store from './store.js';
import { PRAYER_IDS } from './data.js';
import { addDays, todayKey, windowOf } from './times.js';

const PTS = { jamaah: 1.25, ontime: 1, late: 0.6 };
/** Points needed for tree n (the first trees grow quicker to reward a good start). */
export const treeNeed = (n) => Math.min(140, 60 + n * 20);

export const SPECIES = [
  { id: 'olive', name: 'Olive', leaf: ['#7E9C6B', '#97B07F', '#68875B'], fruit: '#3F4128', blossom: '#F3EFD9', canopy: 1, angle: 27 },
  { id: 'pomegranate', name: 'Pomegranate', leaf: ['#5C9A54', '#74B165', '#4B8346'], fruit: '#C4473A', blossom: '#F2876B', canopy: 0.92, angle: 32 },
  { id: 'date', name: 'Date palm', leaf: ['#6F9C56', '#88B26A', '#5C8648'], fruit: '#B07A30', blossom: '#EFE3B8', palm: true },
  { id: 'fig', name: 'Fig', leaf: ['#4E8C4B', '#63A45D', '#437B41'], fruit: '#6C3D5E', blossom: '#E8E2BF', canopy: 1.14, angle: 36 },
  { id: 'citrus', name: 'Citrus', leaf: ['#3F8A4A', '#58A45E', '#30733F'], fruit: '#E9A436', blossom: '#FFFFFF', canopy: 0.96, angle: 30 },
];

export const STAGES = [
  [0, 'Seed'], [0.04, 'Sprout'], [0.12, 'Seedling'], [0.3, 'Sapling'],
  [0.5, 'Young tree'], [0.75, 'Mature tree'], [0.88, 'Blossoming'], [0.96, 'Bearing fruit'],
];

/** Replays every logged prayer: performed prayers water the tree, missed ones make it wilt. */
export function gardenState(now = new Date()) {
  const s = store.get();
  const today = todayKey();
  const started = s.startedOn || today;
  const first = Object.keys(s.logs).sort()[0];
  const from = first && first < started ? first : started;
  let trees = 0;
  let pts = 0;
  let health = 0.85;
  for (let k = from; k <= today; k = addDays(k, 1)) {
    for (const p of PRAYER_IDS) {
      const st = s.logs[k]?.[p]?.s;
      if (PTS[st]) {
        pts += PTS[st];
        health = Math.min(1, health + 0.08);
      } else if (st === 'missed') {
        pts = Math.max(0, pts - 0.5);
        health = Math.max(0, health - 0.16);
      } else if (!st && k >= started && windowOf(k, p).end <= now) {
        health = Math.max(0, health - 0.1); // neglected: not prayed or not logged
      }
      while (pts >= treeNeed(trees)) {
        pts -= treeNeed(trees);
        trees++;
      }
    }
  }
  const need = treeNeed(trees);
  const g = pts / need;
  const stage = STAGES.filter(([t]) => g >= t).length - 1;
  const next = STAGES[stage + 1];
  return {
    trees, pts, need, g, health, stage,
    stageName: STAGES[stage][1],
    nextName: next ? next[1] : 'Fruit → new seed',
    toNext: next ? Math.max(0, Math.ceil((next[0] - g) * need)) : Math.ceil(need - pts),
    species: SPECIES[trees % SPECIES.length],
    mood: health >= 0.75 ? 'Thriving' : health >= 0.5 ? 'Healthy' : health >= 0.3 ? 'Thirsty' : 'Wilting',
  };
}

// ---- drawing ----------------------------------------------------------------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => {
  t = Math.max(0, Math.min(1, t));
  const A = hex(a);
  const B = hex(b);
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
};
const f1 = (n) => +n.toFixed(1);
const ease = (x) => 1 - (1 - x) ** 2;
const DEG = Math.PI / 180;

/** Leaf colour drifts from green to straw to brown as health falls. */
function leafTone(c, health) {
  const dry = Math.max(0, (0.78 - health) / 0.78);
  return dry < 0.6 ? mix(c, '#B9A055', dry / 0.6) : mix('#B9A055', '#8B6A45', (dry - 0.6) / 0.4);
}

// Branch skeletons are generated once per tree so a tree keeps its shape as it grows.
const skeletons = new Map();
function skeleton(seed) {
  if (skeletons.has(seed)) return skeletons.get(seed);
  const r = rng(seed * 7919 + 13);
  const make = (d) => {
    if (d > 5) return [];
    const count = d === 1 ? 2 : r() < 0.3 ? 3 : 2;
    return Array.from({ length: count }, (_, i) => ({
      a: (i - (count - 1) / 2) * (0.75 + r() * 0.55) + (r() - 0.5) * 0.3,
      lf: 0.72 + r() * 0.13,
      bend: (r() - 0.5) * 0.5,
      r: r(),
      kids: make(d + 1),
    }));
  };
  const s = { kids: make(1), r: r() };
  skeletons.set(seed, s);
  return s;
}

function cluster(x, y, rr, sp, health, cls = 'lf') {
  const c = sp.leaf.map((l) => leafTone(l, health));
  return `<g class="${cls}"><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(rr)}" fill="${c[0]}"/>`
    + `<circle cx="${f1(x - rr * 0.55)}" cy="${f1(y + rr * 0.22)}" r="${f1(rr * 0.74)}" fill="${c[2]}"/>`
    + `<circle cx="${f1(x + rr * 0.5)}" cy="${f1(y + rr * 0.12)}" r="${f1(rr * 0.7)}" fill="${c[1]}"/>`
    + `<circle cx="${f1(x - rr * 0.2)}" cy="${f1(y - rr * 0.35)}" r="${f1(rr * 0.42)}" fill="#fff" opacity="${(0.12 * health).toFixed(2)}"/></g>`;
}

function seedOrSprout(g, health, sp) {
  const soil = '<ellipse cx="200" cy="251" rx="22" ry="4" fill="#3B2E22" opacity=".55"/>';
  if (g < 0.04) {
    return `${soil}<g class="seed"><ellipse cx="200" cy="246" rx="7" ry="5" fill="#8A6236"/><ellipse cx="198" cy="244.5" rx="2.4" ry="1.4" fill="#C79A62" opacity=".8"/></g>`;
  }
  const t = (g - 0.04) / 0.08;
  const h = 8 + 26 * t;
  const c = leafTone(sp.leaf[0], health);
  const droop = (1 - health) * 10;
  return `${soil}<ellipse cx="200" cy="247" rx="6" ry="4" fill="#7A5631"/>
    <g class="sway"><path d="M200 248Q${f1(198 + droop)} ${f1(248 - h / 2)} ${f1(200 + droop * 0.6)} ${f1(248 - h)}" stroke="${mix('#7FA05F', '#A28A55', 1 - health)}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M${f1(200 + droop * 0.6)} ${f1(248 - h)}c-10 -${f1(4 - droop / 4)} -16 ${f1(2 + droop / 2)} -18 ${f1(8 + droop)}c8 1 15 -2 18 -${f1(8 - droop / 3)}z" fill="${c}"/>
    <path d="M${f1(200 + droop * 0.6)} ${f1(248 - h)}c10 -${f1(4 - droop / 4)} 16 ${f1(2 + droop / 2)} 18 ${f1(8 + droop)}c-8 1 -15 -2 -18 -${f1(8 - droop / 3)}z" fill="${leafTone(sp.leaf[1], health)}"/></g>`;
}

function broadleaf(g, health, sp, seed) {
  const sk = skeleton(seed);
  const vis = 1 + ((g - 0.12) / 0.88) * 4.7; // how many branch levels are visible
  const H = 40 + 150 * ease(g);
  const trunk = mix('#6A4F37', '#7D6A52', 1 - health);
  const droop = 1 - health;
  let back = '';
  let wood = '';
  let leaves = '';
  let extra = '';
  const walk = (node, x, y, ang, len, w, d) => {
    const frac = Math.max(0, Math.min(1, vis - d + 1));
    if (frac <= 0) return;
    const l = len * frac;
    const x2 = x + Math.cos(ang) * l;
    const y2 = y + Math.sin(ang) * l;
    const mx = (x + x2) / 2 + Math.cos(ang + Math.PI / 2) * l * (node.bend || 0) * 0.3;
    const my = (y + y2) / 2 + Math.sin(ang + Math.PI / 2) * l * (node.bend || 0) * 0.3;
    wood += `<path d="M${f1(x)} ${f1(y)}Q${f1(mx)} ${f1(my)} ${f1(x2)} ${f1(y2)}" stroke="${trunk}" stroke-width="${f1(Math.max(0.8, w))}" fill="none" stroke-linecap="round"/>`;
    const tip = d >= Math.floor(vis) || !node.kids.length;
    const leafy = d >= 2 || g > 0.25;
    if ((tip || d >= 2) && leafy && node.r < health * 1.6 + 0.2) {
      const rr = (6 + 17 * g) * (sp.canopy || 1) * (0.55 + 0.45 * health) * (tip ? 0.75 + 0.25 * frac : 0.78);
      // a soft darker mass behind the branches makes the crown read as full, not umbrella-like
      back += `<circle cx="${f1(x2)}" cy="${f1(y2 + rr * 0.2)}" r="${f1(rr * 1.45)}" fill="${mix(leafTone(sp.leaf[2], health), '#1E2A1A', 0.25)}" opacity=".9"/>`;
      leaves += cluster(x2, y2, rr, sp, health);
      if (tip && g >= 0.88 && g < 0.96 && health > 0.35 && node.r < 0.75) {
        extra += `<circle class="bloom" cx="${f1(x2 + rr * 0.4)}" cy="${f1(y2 - rr * 0.3)}" r="2.2" fill="${sp.blossom}"/><circle class="bloom" cx="${f1(x2 - rr * 0.5)}" cy="${f1(y2 + rr * 0.1)}" r="1.8" fill="${sp.blossom}"/>`;
      }
      if (tip && g >= 0.96 && health > 0.25 && node.r < 0.62) {
        extra += `<g class="fruit"><circle cx="${f1(x2 + rr * 0.15)}" cy="${f1(y2 + rr * 0.75)}" r="3.6" fill="${sp.fruit}"/><circle cx="${f1(x2 + rr * 0.15 - 1.1)}" cy="${f1(y2 + rr * 0.75 - 1.2)}" r="1" fill="#fff" opacity=".5"/></g>`;
      }
    }
    if (tip) return;
    for (const k of node.kids) {
      let a = ang + k.a * (sp.angle || 30) * DEG;
      a += droop * 0.2 * d * Math.sign(Math.cos(a) || 1); // wilting: branches sag outward and down
      walk(k, x2, y2, a, len * k.lf, w * 0.64, d + 1);
    }
  };
  walk(sk, 200, 250, -90 * DEG + (sk.r - 0.5) * 0.08, H * 0.31, 2.5 + 10 * g, 1);
  return `<g class="sway">${back}${wood}${leaves}${extra}</g>`;
}

function palm(g, health, sp) {
  const H = 34 + 160 * ease(g);
  const lean = 6 + (1 - health) * 8;
  const top = [200 + lean, 250 - H];
  const trunk = mix('#7A5E3E', '#8A7558', 1 - health);
  let rings = '';
  const n = Math.floor(H / 9);
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const x = 200 + lean * t * t;
    const y = 250 - H * t;
    rings += `<path d="M${f1(x - 4 + 2 * t)} ${f1(y)}h${f1(8 - 4 * t)}" stroke="${mix(trunk, '#3C2E20', 0.4)}" stroke-width="1"/>`;
  }
  const fronds = Math.round(4 + 6 * g);
  const len = 18 + 70 * ease(g);
  const sag = 0.25 + (1 - health) * 0.7;
  let crown = '';
  for (let i = 0; i < fronds; i++) {
    const a = (-90 + (i - (fronds - 1) / 2) * (300 / fronds)) * DEG;
    const ex = top[0] + Math.cos(a) * len;
    const ey = top[1] + Math.sin(a) * len * 0.55 + len * sag;
    const cx = top[0] + Math.cos(a) * len * 0.55;
    const cy = top[1] + Math.sin(a) * len * 0.6 - len * 0.12;
    const col = leafTone(sp.leaf[i % 3], health);
    crown += `<path class="frond" d="M${f1(top[0])} ${f1(top[1])}Q${f1(cx)} ${f1(cy)} ${f1(ex)} ${f1(ey)}" stroke="${col}" stroke-width="${f1(2 + 4 * g)}" fill="none" stroke-linecap="round"/>`;
    crown += `<path d="M${f1(top[0])} ${f1(top[1])}Q${f1(cx)} ${f1(cy)} ${f1(ex)} ${f1(ey)}" stroke="${col}" stroke-width="${f1(8 + 8 * g)}" stroke-dasharray="1.5 3" fill="none" opacity=".75"/>`;
  }
  let extra = '';
  if (g >= 0.88 && health > 0.3) {
    const c = g >= 0.96 ? sp.fruit : sp.blossom;
    for (let i = 0; i < 9; i++) {
      const x = top[0] - 9 + (i % 3) * 5 + (i > 5 ? 9 : 0);
      const y = top[1] + 6 + Math.floor(i / 3) * 4;
      extra += `<circle class="${g >= 0.96 ? 'fruit' : 'bloom'}" cx="${f1(x)}" cy="${f1(y)}" r="${g >= 0.96 ? 2.8 : 1.8}" fill="${c}"/>`;
    }
  }
  return `<g class="sway"><path d="M197 250Q${f1(200 + lean * 0.2)} ${f1(250 - H * 0.5)} ${f1(top[0])} ${f1(top[1])}" stroke="${trunk}" stroke-width="${f1(4 + 7 * g)}" fill="none" stroke-linecap="round"/>${rings}${crown}${extra}</g>`;
}

/** One tree, any species, at growth g (0..1) and health (0..1). */
export function tree(sp, g, health, seed) {
  if (g < 0.12) return seedOrSprout(g, health, sp);
  return sp.palm ? palm(g, health, sp) : broadleaf(g, health, sp, seed);
}

// Forest slots: back row first, leaving the centre for the growing tree.
const SLOTS = [
  [92, 214, 0.36], [312, 212, 0.38], [148, 206, 0.3], [262, 205, 0.31], [40, 220, 0.42], [362, 222, 0.42],
  [118, 226, 0.46], [286, 228, 0.47], [66, 206, 0.28], [340, 204, 0.29], [176, 200, 0.24], [228, 199, 0.24],
  [18, 232, 0.5], [386, 234, 0.5],
];

/** Full garden scene as an SVG string. */
let uid = 0;
export function gardenSVG(st, { completing = false } = {}) {
  const h = st.health;
  const id = `g${++uid}`;
  const sky = [mix('#2F4A47', '#4F4638', 1 - h), mix('#7B9A88', '#8C7B5D', 1 - h), mix('#E3D9B2', '#CDB582', 1 - h)];
  const hill = mix('#58784A', '#86714A', 1 - h);
  const ground = [mix('#4E6C40', '#7A6541', 1 - h), mix('#2E4127', '#4A3B26', 1 - h)];
  const forestHealth = Math.max(0.6, h);
  let forest = '';
  const shown = Math.min(st.trees, SLOTS.length);
  for (let i = 0; i < shown; i++) {
    const [x, y, s] = SLOTS[i];
    const sp = SPECIES[i % SPECIES.length];
    forest += `<g transform="translate(${x} ${y}) scale(${s}) translate(-200 -250)" class="ftree" style="--d:${(i % 5) * 0.4}s">${tree(sp, 1, forestHealth, i + 1)}</g>`;
  }
  let grass = '';
  const r = rng(99);
  for (let i = 0; i < 46; i++) {
    const x = r() * 400;
    const y = 246 + r() * 14;
    const tall = 4 + r() * 7 * (0.4 + h * 0.6);
    const lean = (r() - 0.5) * 4 + (1 - h) * 3;
    grass += `<path d="M${f1(x)} ${f1(y)}q${f1(lean / 2)} -${f1(tall / 2)} ${f1(lean)} -${f1(tall)}" stroke="${mix('#7DA25F', '#B39B5C', 1 - h)}" stroke-width="1.1" fill="none" opacity=".8"/>`;
  }
  let fallen = '';
  if (h < 0.6) {
    const n = Math.round((0.6 - h) * 30);
    for (let i = 0; i < n; i++) fallen += `<ellipse cx="${f1(150 + r() * 100)}" cy="${f1(252 + r() * 6)}" rx="2.6" ry="1.2" fill="${leafTone(st.species.leaf[0], 0.15)}" transform="rotate(${Math.round(r() * 180)} ${f1(150 + r() * 100)} 254)"/>`;
  }
  const main = tree(st.species, st.g, h, st.trees + 1);
  // Small stages are zoomed in so a seed or sprout is clearly visible.
  const z = !completing && st.g < 0.3 ? 1 + ((0.3 - st.g) / 0.3) * 1.7 : 1;
  return `<svg xmlns="http://www.w3.org/2000/svg" class="garden-svg" viewBox="0 0 400 270" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs>
      <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset=".6" stop-color="${sky[1]}"/><stop offset="1" stop-color="${sky[2]}"/></linearGradient>
      <radialGradient id="${id}u" cx=".72" cy=".3" r=".45"><stop offset="0" stop-color="#FFF4D2" stop-opacity="${(0.25 + 0.5 * h).toFixed(2)}"/><stop offset="1" stop-color="#FFF4D2" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ground[0]}"/><stop offset="1" stop-color="${ground[1]}"/></linearGradient>
    </defs>
    <rect width="400" height="270" fill="url(#${id}s)"/>
    <rect width="400" height="270" fill="url(#${id}u)"/>
    <path d="M0 214C60 196 110 204 160 199C220 193 270 205 320 197C350 193 380 198 400 196V270H0Z" fill="${hill}" opacity=".55"/>
    ${forest}
    <path d="M0 242C70 236 130 244 200 243C270 242 330 235 400 240V270H0Z" fill="url(#${id}g)"/>
    ${grass}${fallen}
    <g class="tree-main"><g transform="translate(200 250) scale(${z.toFixed(3)}) translate(-200 -250)">${main}</g></g>
    ${completing ? `<circle class="drop-fruit" cx="214" cy="146" r="4.5" fill="${st.species.fruit}"/>` : ''}
    ${h < 0.55 ? '<g class="falling"><ellipse cx="180" cy="120" rx="3" ry="1.4"/><ellipse cx="230" cy="100" rx="3" ry="1.4"/><ellipse cx="205" cy="90" rx="3" ry="1.4"/></g>' : ''}
  </svg>`;
}

/** The tree that has just finished, in full fruit, with one fruit about to fall and become a seed. */
export function completedScene(st) {
  const n = Math.max(0, st.trees - 1);
  return gardenSVG({ ...st, trees: n, g: 1, health: Math.max(0.7, st.health), species: SPECIES[n % SPECIES.length] }, { completing: true });
}
