// Timezone-aware date keys, prayer windows and Hijri dates.
import { computeTimes } from './praytimes.js';
import { METHODS, PRAYER_IDS, HIJRI_MONTHS } from './data.js';
import * as store from './store.js';

export const deviceTz = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};
export const zone = () => store.get().location.tz || deviceTz();

const fmts = new Map();
function fmt(opts, tz) {
  const id = JSON.stringify(opts) + tz;
  if (!fmts.has(id)) {
    try {
      fmts.set(id, new Intl.DateTimeFormat('en-GB', { ...opts, timeZone: tz }));
    } catch {
      fmts.set(id, new Intl.DateTimeFormat('en-GB', opts)); // unknown tz
    }
  }
  return fmts.get(id);
}

/** 'YYYY-MM-DD' of an instant in the location's timezone. */
export function keyOf(date = new Date(), tz = zone()) {
  const parts = fmt({ year: 'numeric', month: '2-digit', day: '2-digit' }, tz).formatToParts(date);
  const v = (t) => parts.find((p) => p.type === t).value;
  return `${v('year')}-${v('month')}-${v('day')}`;
}

export const parseKey = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return { y, m, d };
};
const utc = (k) => {
  const { y, m, d } = parseKey(k);
  return Date.UTC(y, m - 1, d);
};
export const addDays = (k, n) => new Date(utc(k) + n * 86400000).toISOString().slice(0, 10);
export const daysBetween = (a, b) => Math.round((utc(b) - utc(a)) / 86400000);
export const weekday = (k) => new Date(utc(k)).getUTCDay(); // 0 = Sunday
export const keyLabel = (k, opts) => fmt(opts, 'UTC').format(new Date(utc(k)));
export const todayKey = () => keyOf(new Date());

export function fmtTime(date, withSuffix = true) {
  if (!date || Number.isNaN(date.getTime())) return '--:--';
  const h12 = store.get().settings.timeFormat === '12';
  const s = fmt({ hour: 'numeric', minute: '2-digit', hour12: h12 }, zone()).format(date);
  if (!h12) return s;
  const out = s.replace(/\s?(am|pm)/i, (m, ap) => (withSuffix ? ' ' + ap.toUpperCase() : ''));
  return out.replace(/^0(\d)/, '$1');
}

export function fmtCountdown(ms) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const p = (n) => String(n).padStart(2, '0');
  return h ? `${h}:${p(m)}:${p(sec)}` : `${p(m)}:${p(sec)}`;
}

export function fmtDuration(ms) {
  const mins = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

// ---- prayer times -------------------------------------------------------
const cache = new Map();
let cacheSig = '';

export function timesFor(k) {
  const { location: l, settings: s } = store.get();
  const sig = JSON.stringify([l.lat, l.lng, l.elv, s.method, s.asr, s.highLat, s.adjust]);
  if (sig !== cacheSig) {
    cache.clear();
    cacheSig = sig;
  }
  if (!cache.has(k)) {
    const M = METHODS[s.method] || METHODS.MWL;
    const offsets = {};
    for (const p of ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']) {
      offsets[p] = (M.offsets?.[p] || 0) + (Number(s.adjust?.[p]) || 0);
    }
    cache.set(
      k,
      computeTimes(parseKey(k), { lat: l.lat, lng: l.lng, elv: l.elv || 0 }, {
        fajr: M.fajr, isha: M.isha, ishaMin: M.ishaMin, maghrib: M.maghrib,
        asrFactor: s.asr === 'hanafi' ? 2 : 1, highLat: s.highLat, offsets,
      }),
    );
  }
  return cache.get(k);
}

/** Time window during which a prayer is performed "on time". */
export function windowOf(k, p) {
  const t = timesFor(k);
  const end = { fajr: t.sunrise, dhuhr: t.asr, asr: t.maghrib, maghrib: t.isha, isha: timesFor(addDays(k, 1)).fajr }[p];
  return { start: t[p], end };
}

/** Snapshot of "where we are" in the prayer day. */
export function nowState(now = new Date()) {
  const today = keyOf(now);
  const t = timesFor(today);
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);

  let current = null;
  const candidates = [{ k: yesterday, p: 'isha' }, ...PRAYER_IDS.map((p) => ({ k: today, p }))];
  for (const c of candidates) {
    const w = windowOf(c.k, c.p);
    if (now >= w.start && now < w.end) current = { ...c, ...w };
  }

  const tt = timesFor(tomorrow);
  const seq = [
    ...PRAYER_IDS.map((p) => ({ p, k: today, at: t[p] })),
    ...PRAYER_IDS.map((p) => ({ p, k: tomorrow, at: tt[p] })),
  ];
  const next = seq.find((e) => e.at > now);
  const marks = [timesFor(yesterday).isha, t.fajr, t.sunrise, t.dhuhr, t.asr, t.maghrib, t.isha];
  const prevAt = marks.filter((m) => m <= now).pop() || marks[0];

  let period = 'night';
  if (now >= t.fajr && now < t.sunrise) period = 'dawn';
  else if (now >= t.sunrise && now < t.dhuhr) period = 'morning';
  else if (now >= t.dhuhr && now < t.asr) period = 'noon';
  else if (now >= t.asr && now < t.maghrib) period = 'afternoon';
  else if (now >= t.maghrib && now < t.isha) period = 'dusk';

  const duha = !current && now >= new Date(+t.sunrise + 15 * 60000) && now < new Date(+t.dhuhr - 10 * 60000);
  return { today, current, next, prevAt, period, duha, times: t };
}

// ---- Hijri ---------------------------------------------------------------
function islamicToJd(y, m, d) {
  return d + Math.ceil(29.5 * (m - 1)) + (y - 1) * 354 + Math.floor((3 + 11 * y) / 30) + 1948439.5 - 1;
}
function tabularHijri(date) {
  const jd = Math.floor(date.getTime() / 86400000 + 2440587.5) + 0.5;
  const year = Math.floor((30 * (jd - 1948439.5) + 10646) / 10631);
  const month = Math.min(12, Math.ceil((jd - (29 + islamicToJd(year, 1, 1))) / 29.5) + 1);
  const day = jd - islamicToJd(year, month, 1) + 1;
  return { day, month, year };
}

export function hijri(date = new Date()) {
  const adj = Number(store.get().settings.hijriAdjust) || 0;
  const d = new Date(date.getTime() + adj * 86400000);
  let h;
  try {
    const parts = fmt({ day: 'numeric', month: 'numeric', year: 'numeric', calendar: 'islamic-umalqura' }, zone())
      .formatToParts(d);
    const v = (t) => parseInt(parts.find((p) => p.type === t)?.value, 10);
    h = { day: v('day'), month: v('month'), year: v('year') };
    if ([h.day, h.month, h.year].some(Number.isNaN) || h.year < 1300) throw new Error('no islamic calendar');
  } catch {
    h = tabularHijri(d);
  }
  return { ...h, monthName: HIJRI_MONTHS[h.month - 1], label: `${h.day} ${HIJRI_MONTHS[h.month - 1]} ${h.year} AH` };
}
