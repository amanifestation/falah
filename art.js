// Procedural abstract Islamic artwork rendered as SVG — no image assets needed.
// Scenes: crescent (dawn over hills), arcade (receding arches), dome (mosque &
// reflecting pool), arch (mihrab window), lantern (night lanterns), girih (star lattice).

let uid = 0;
const W = 400;
const H = 520;

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
  const A = hex(a);
  const B = hex(b);
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
};
const f = (n) => +n.toFixed(1);

export const PALETTES = {
  dawn: { sky: ['#232637', '#5E5670', '#C99C8A'], ground: ['#35333D', '#17161C'], glow: '#F4CDB2', ink: '#14131A', accent: '#F6E6CF' },
  day: { sky: ['#7C795F', '#B3AB88', '#E8DFC2'], ground: ['#5E5A43', '#2E2C21'], glow: '#FFF3D2', ink: '#2A281D', accent: '#FFFDF4' },
  golden: { sky: ['#4E4330', '#9B7744', '#E3BD80'], ground: ['#43382A', '#1D1912'], glow: '#FFE0A3', ink: '#1A150E', accent: '#FFF1D3' },
  dusk: { sky: ['#2A2230', '#77464A', '#D58A62'], ground: ['#352829', '#140E10'], glow: '#FFC79D', ink: '#130C0E', accent: '#FFE6CF' },
  night: { sky: ['#0E1215', '#1C2527', '#3A4440'], ground: ['#121716', '#070909'], glow: '#F0D49B', ink: '#050707', accent: '#F4E6C4' },
  olive: { sky: ['#2F2E23', '#5F5C46', '#9F9A7B'], ground: ['#3A392C', '#1C1B14'], glow: '#F1E5C2', ink: '#18170F', accent: '#F3EBD3' },
};

export const PRAYER_ART = {
  fajr: ['crescent', 'dawn'],
  dhuhr: ['arcade', 'day'],
  asr: ['dome', 'golden'],
  maghrib: ['arch', 'dusk'],
  isha: ['lantern', 'night'],
};
export const PERIOD_ART = {
  night: ['lantern', 'night'],
  dawn: ['crescent', 'dawn'],
  morning: ['arcade', 'day'],
  noon: ['arcade', 'day'],
  afternoon: ['dome', 'golden'],
  dusk: ['arch', 'dusk'],
};

// ---- primitives -------------------------------------------------------------
const lin = (id, stops, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
    .join('')}</linearGradient>`;
const rad = (id, stops, cx = 0.5, cy = 0.5, r = 0.5) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
    .join('')}</radialGradient>`;

/** Pointed (Islamic) arch from the springing line up to the apex. */
export function archPath(cx, w, base, spring, top) {
  const x1 = cx - w / 2;
  const x2 = cx + w / 2;
  const h = spring - top;
  return `M${f(x1)} ${f(base)}V${f(spring)}C${f(x1)} ${f(spring - h * 0.55)} ${f(cx - w * 0.14)} ${f(top + h * 0.18)} ${f(cx)} ${f(top)}C${f(cx + w * 0.14)} ${f(top + h * 0.18)} ${f(x2)} ${f(spring - h * 0.55)} ${f(x2)} ${f(spring)}V${f(base)}Z`;
}

const dome = (cx, by, r) =>
  `M${f(cx - r)} ${f(by)}C${f(cx - r * 1.12)} ${f(by - r * 0.95)} ${f(cx - r * 0.45)} ${f(by - r * 1.3)} ${f(cx)} ${f(by - r * 1.62)}C${f(cx + r * 0.45)} ${f(by - r * 1.3)} ${f(cx + r * 1.12)} ${f(by - r * 0.95)} ${f(cx + r)} ${f(by)}Z`;

function mosque(cx, by, s, fill, glow) {
  const hallW = 150 * s;
  const hallH = 34 * s;
  const drumTop = by - hallH - 14 * s;
  let g = `<g fill="${fill}">`;
  g += `<rect x="${f(cx - hallW / 2)}" y="${f(by - hallH)}" width="${f(hallW)}" height="${f(hallH)}"/>`;
  g += `<rect x="${f(cx - 36 * s)}" y="${f(drumTop)}" width="${f(72 * s)}" height="${f(14 * s + 1)}"/>`;
  g += `<path d="${dome(cx, drumTop, 40 * s)}"/>`;
  g += `<rect x="${f(cx - 1.2 * s)}" y="${f(drumTop - 40 * s * 1.62 - 16 * s)}" width="${f(2.4 * s)}" height="${f(17 * s)}"/>`;
  for (const dx of [-52, 52]) g += `<path d="${dome(cx + dx * s, by - hallH, 16 * s)}"/>`;
  for (const dx of [-92, 92]) {
    const mx = cx + dx * s;
    const mh = 150 * s;
    g += `<rect x="${f(mx - 5 * s)}" y="${f(by - mh)}" width="${f(10 * s)}" height="${f(mh)}"/>`;
    g += `<rect x="${f(mx - 8 * s)}" y="${f(by - mh * 0.72)}" width="${f(16 * s)}" height="${f(4 * s)}"/>`;
    g += `<rect x="${f(mx - 7 * s)}" y="${f(by - mh * 0.45)}" width="${f(14 * s)}" height="${f(3 * s)}"/>`;
    g += `<path d="M${f(mx - 6 * s)} ${f(by - mh)}L${f(mx)} ${f(by - mh - 26 * s)}L${f(mx + 6 * s)} ${f(by - mh)}Z"/>`;
  }
  g += '</g>';
  if (glow) {
    for (let i = -2; i <= 2; i++) {
      g += `<path d="${archPath(cx + i * 24 * s, 9 * s, by - 4 * s, by - 18 * s, by - 26 * s)}" fill="${glow}" opacity=".85"/>`;
    }
  }
  return g;
}

function stars(r, n, maxY) {
  let s = '';
  for (let i = 0; i < n; i++) {
    s += `<circle cx="${f(r() * W)}" cy="${f(r() * maxY)}" r="${(r() * 1.1 + 0.3).toFixed(2)}" fill="#fff" opacity="${(r() * 0.6 + 0.2).toFixed(2)}"/>`;
  }
  return s;
}

function starPatternDefs(id, color, opacity, size = 64) {
  const c = size / 2;
  const q = size * 0.3;
  const sq = `M${c - q} ${c - q}H${c + q}V${c + q}H${c - q}Z`;
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
    <g fill="none" stroke="${color}" stroke-width="1" opacity="${opacity}">
      <path d="${sq}"/><path d="${sq}" transform="rotate(45 ${c} ${c})"/>
      <circle cx="${c}" cy="${c}" r="${size * 0.12}"/>
      <path d="M0 ${c}H${c - q * 1.41}M${c + q * 1.41} ${c}H${size}M${c} 0V${c - q * 1.41}M${c} ${c + q * 1.41}V${size}"/>
    </g></pattern>`;
}

// ---- scenes -----------------------------------------------------------------
const SCENES = {
  crescent(P, id) {
    const r = rng(7);
    const defs =
      lin(`${id}s`, [[0, P.sky[0]], [0.55, P.sky[1]], [1, P.sky[2]]]) +
      rad(`${id}g`, [[0, P.glow, 0.55], [1, P.glow, 0]], 0.5, 0.72, 0.6) +
      lin(`${id}m`, [[0, '#fff', 0], [0.5, '#fff', 0.2], [1, '#fff', 0]]) +
      lin(`${id}d`, [[0, P.ground[0]], [1, P.ground[1]]]) +
      `<mask id="${id}c"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="293" cy="110" r="30" fill="#000"/></mask>`;
    const body = `<rect width="${W}" height="${H}" fill="url(#${id}s)"/>${stars(r, 46, H * 0.5)}
      <rect width="${W}" height="${H}" fill="url(#${id}g)"/>
      <circle cx="280" cy="120" r="34" fill="${P.accent}" mask="url(#${id}c)"/>
      <path d="M0 330L60 282L110 300L170 232L215 270L260 246L320 290L360 266L400 286V520H0Z" fill="${P.sky[0]}" opacity=".5"/>
      <rect y="262" width="${W}" height="100" fill="url(#${id}m)"/>
      <path d="M0 362C80 332 140 346 200 352C270 360 330 330 400 340V520H0Z" fill="url(#${id}d)" opacity=".9"/>
      ${mosque(268, 350, 0.42, P.ink, P.glow)}
      <path d="M0 425C90 398 170 432 250 418C320 405 360 412 400 402V520H0Z" fill="${P.ground[1]}"/>`;
    return [defs, body];
  },

  arcade(P, id) {
    const vx = 200;
    const vy = 250;
    const defs =
      rad(`${id}l`, [[0, P.accent], [0.35, P.glow], [1, P.sky[1]]], 0.5, 0.48, 0.55) +
      lin(`${id}f`, [[0, P.glow, 0.9], [1, P.ground[1]]]);
    let body = `<rect width="${W}" height="${H}" fill="url(#${id}l)"/>
      <path d="M${vx - 10} ${vy + 40}L${vx + 10} ${vy + 40}L${W + 160} ${H}L-160 ${H}Z" fill="url(#${id}f)"/>
      <ellipse cx="${vx}" cy="${vy + 170}" rx="26" ry="150" fill="${P.accent}" opacity=".18"/>`;
    for (let i = 7; i >= 0; i--) {
      const s = 0.74 ** i;
      const col = mix(P.ink, P.sky[1], i / 8);
      const ox = 270 * s;
      const rect = `M${f(vx - ox)} ${f(vy - 360 * s)}H${f(vx + ox)}V${f(vy + 320 * s)}H${f(vx - ox)}Z`;
      body += `<path fill-rule="evenodd" fill="${col}" d="${rect}${archPath(vx, 300 * s, vy + 320 * s, vy - 80 * s, vy - 250 * s)}"/>`;
      body += `<path fill="none" stroke="${P.accent}" stroke-opacity="${(0.08 + i * 0.015).toFixed(3)}" d="${archPath(vx, 300 * s, vy + 320 * s, vy - 80 * s, vy - 250 * s)}"/>`;
    }
    return [defs, body];
  },

  dome(P, id) {
    const defs =
      lin(`${id}s`, [[0, P.sky[0]], [0.6, P.sky[1]], [1, P.sky[2]]]) +
      rad(`${id}g`, [[0, P.glow, 0.95], [0.35, P.glow, 0.35], [1, P.glow, 0]], 0.5, 0.5, 0.5) +
      lin(`${id}w`, [[0, P.sky[2]], [0.5, P.sky[1]], [1, P.ground[1]]]) +
      lin(`${id}r`, [[0, '#fff', 1], [1, '#fff', 0]]) +
      `<mask id="${id}k"><rect y="388" width="${W}" height="140" fill="url(#${id}r)"/></mask>`;
    const ripples = [404, 418, 436, 458, 486]
      .map((y, i) => `<rect x="${60 + i * 18}" y="${y}" width="${280 - i * 36}" height="1.2" fill="${P.accent}" opacity="${0.22 - i * 0.03}"/>`)
      .join('');
    const body = `<rect width="${W}" height="${H}" fill="url(#${id}s)"/>
      <circle cx="200" cy="300" r="190" fill="url(#${id}g)"/>
      <circle cx="200" cy="300" r="58" fill="${P.accent}" opacity=".92"/>
      <rect y="292" width="${W}" height="10" fill="#fff" opacity=".07"/>
      <rect y="320" width="${W}" height="18" fill="#fff" opacity=".05"/>
      ${mosque(200, 390, 1, P.ink, P.glow)}
      <rect y="388" width="${W}" height="140" fill="url(#${id}w)"/>
      <g mask="url(#${id}k)" opacity=".35"><g transform="translate(0 778) scale(1 -1)">${mosque(200, 390, 1, P.ink)}</g></g>
      ${ripples}
      <path d="M0 470C70 455 120 470 180 478V520H0Z" fill="${P.ground[1]}" opacity=".85"/>`;
    return [defs, body];
  },

  arch(P, id) {
    const open = archPath(200, 230, 470, 190, 60);
    const defs =
      lin(`${id}wall`, [[0, mix(P.ink, P.ground[0], 0.4)], [1, P.ink]]) +
      lin(`${id}s`, [[0, P.sky[0]], [0.6, P.sky[1]], [1, P.sky[2]]]) +
      rad(`${id}g`, [[0, P.glow, 0.9], [1, P.glow, 0]], 0.5, 0.55, 0.5) +
      lin(`${id}b`, [[0, P.glow, 0.32], [1, P.glow, 0]]) +
      `<clipPath id="${id}c"><path d="${open}"/></clipPath>` +
      starPatternDefs(`${id}p`, P.accent, 0.12, 48);
    const body = `<rect width="${W}" height="${H}" fill="url(#${id}wall)"/>
      <rect width="${W}" height="${H}" fill="url(#${id}p)"/>
      <g clip-path="url(#${id}c)">
        <rect width="${W}" height="${H}" fill="url(#${id}s)"/>
        <circle cx="200" cy="380" r="150" fill="url(#${id}g)"/>
        <circle cx="200" cy="380" r="34" fill="${P.accent}"/>
        <path d="M60 420C120 395 170 410 210 412C260 414 300 396 340 402V470H60Z" fill="${P.ground[0]}"/>
        <path d="M60 448C140 432 220 446 340 436V470H60Z" fill="${P.ground[1]}"/>
      </g>
      <path d="${archPath(200, 262, 470, 186, 40)}" fill="none" stroke="${P.accent}" stroke-opacity=".28" stroke-width="1.4"/>
      <path d="${archPath(200, 300, 470, 182, 18)}" fill="none" stroke="${P.accent}" stroke-opacity=".14" stroke-width="1.2"/>
      <path d="M85 470L315 470L400 520L0 520Z" fill="url(#${id}b)"/>
      <rect y="470" width="${W}" height="50" fill="${P.ground[1]}" opacity=".55"/>`;
    return [defs, body];
  },

  lantern(P, id) {
    const r = rng(11);
    const metal = mix(P.glow, '#5A4320', 0.55);
    const defs =
      rad(`${id}bg`, [[0, P.sky[2]], [0.55, P.sky[1]], [1, P.sky[0]]], 0.5, 0.25, 0.85) +
      rad(`${id}h`, [[0, P.glow, 0.5], [1, P.glow, 0]]) +
      rad(`${id}in`, [[0, '#FFF6DC'], [0.45, P.glow], [1, mix(P.glow, '#6B4513', 0.6)]], 0.5, 0.45, 0.6) +
      `<filter id="${id}bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>` +
      starPatternDefs(`${id}p`, P.accent, 0.07, 56);
    let bokeh = '';
    for (let i = 0; i < 16; i++) {
      bokeh += `<circle cx="${f(r() * W)}" cy="${f(r() * H)}" r="${f(6 + r() * 22)}" fill="${P.glow}" opacity="${(0.04 + r() * 0.14).toFixed(2)}"/>`;
    }
    const lantern = (x, y, s) => `
      <circle cx="${x}" cy="${y}" r="${80 * s}" fill="url(#${id}h)"/>
      <line x1="${x}" y1="0" x2="${x}" y2="${f(y - 46 * s)}" stroke="${metal}" stroke-opacity=".7" stroke-width="1.2"/>
      <path d="${dome(x, y - 28 * s, 13 * s)}" fill="${metal}"/>
      <path d="M${f(x - 16 * s)} ${f(y - 28 * s)}L${f(x + 16 * s)} ${f(y - 28 * s)}L${f(x + 23 * s)} ${f(y)}L${f(x + 16 * s)} ${f(y + 30 * s)}L${f(x - 16 * s)} ${f(y + 30 * s)}L${f(x - 23 * s)} ${f(y)}Z" fill="url(#${id}in)" stroke="${metal}" stroke-width="${f(1.6 * s)}"/>
      <path d="M${x} ${f(y - 28 * s)}V${f(y + 30 * s)}M${f(x - 8 * s)} ${f(y - 28 * s)}L${f(x - 11 * s)} ${f(y)}L${f(x - 8 * s)} ${f(y + 30 * s)}M${f(x + 8 * s)} ${f(y - 28 * s)}L${f(x + 11 * s)} ${f(y)}L${f(x + 8 * s)} ${f(y + 30 * s)}M${f(x - 23 * s)} ${f(y)}H${f(x + 23 * s)}" stroke="${metal}" stroke-width="${f(1 * s)}" fill="none" opacity=".7"/>
      <path d="M${f(x - 16 * s)} ${f(y + 30 * s)}L${f(x + 16 * s)} ${f(y + 30 * s)}L${x} ${f(y + 46 * s)}Z" fill="${metal}"/>`;
    const body = `<rect width="${W}" height="${H}" fill="url(#${id}bg)"/>
      <rect width="${W}" height="${H}" fill="url(#${id}p)"/>
      <g filter="url(#${id}bl)">${bokeh}</g>
      ${lantern(255, 170, 0.8)}${lantern(118, 262, 1.15)}${lantern(322, 318, 1.4)}`;
    return [defs, body];
  },

  girih(P, id) {
    const defs =
      lin(`${id}bg`, [[0, P.sky[1]], [1, P.sky[0]]], 1, 1) +
      rad(`${id}g`, [[0, P.glow, 0.5], [1, P.glow, 0]], 0.3, 0.28, 0.6) +
      rad(`${id}v`, [[0, '#000', 0], [0.7, '#000', 0.1], [1, '#000', 0.55]]) +
      rad(`${id}mg`, [[0, '#fff', 1], [1, '#fff', 0.15]], 0.45, 0.4, 0.7) +
      `<mask id="${id}m"><rect width="${W}" height="${H}" fill="url(#${id}mg)"/></mask>` +
      starPatternDefs(`${id}p`, P.accent, 0.55, 80);
    const body = `<rect width="${W}" height="${H}" fill="url(#${id}bg)"/>
      <rect width="${W}" height="${H}" fill="url(#${id}g)"/>
      <rect width="${W}" height="${H}" fill="url(#${id}p)" mask="url(#${id}m)"/>
      <path d="${archPath(200, 300, 560, 230, 60)}" fill="none" stroke="${P.accent}" stroke-opacity=".4" stroke-width="1.5"/>
      <path d="${archPath(200, 250, 560, 240, 100)}" fill="${P.ink}" fill-opacity=".25" stroke="${P.accent}" stroke-opacity=".25"/>
      <rect width="${W}" height="${H}" fill="url(#${id}v)"/>`;
    return [defs, body];
  },
};

/** Render a scene to an SVG string. */
export function art(scene = 'girih', palette = 'olive', cls = '') {
  const id = `a${++uid}`;
  const P = PALETTES[palette] || PALETTES.olive;
  const [defs, body] = (SCENES[scene] || SCENES.girih)(P, id);
  return `<svg class="art ${cls}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>${defs}</defs>${body}</svg>`;
}
