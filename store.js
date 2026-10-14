// Persistent app state (localStorage) with a tiny pub/sub.

const KEY = 'falah.v1';
const listeners = new Set();
let state;

const zero = () => ({ fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 });

export function defaults() {
  return {
    version: 1,
    onboarded: false,
    startedOn: null, // YYYY-MM-DD; tracking begins here
    profile: { name: '' },
    location: {
      name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.139, lng: 101.6869, elv: 0,
      tz: 'Asia/Kuala_Lumpur', source: 'city',
    },
    settings: {
      method: 'JAKIM',
      asr: 'standard', // 'standard' (Shafiʿi, Maliki, Hanbali) | 'hanafi'
      highLat: 'AngleBased',
      adjust: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
      timeFormat: '12',
      theme: 'dark',
      hijriAdjust: 0,
      autoQada: true,
      notify: {
        enabled: false,
        prayers: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
        before: 10, // minutes; 0 = off
        nudge: true, // "time is running out" check-in
        nudgeMins: 30,
        sound: true,
        adhan: 'fakhri', // voice at prayer time: an ADHANS id, 'chime' or 'silent'
      },
    },
    logs: {}, // { 'YYYY-MM-DD': { fajr: { s: 'ontime', at: 1700000000000, q?: 1 } } }
    wirid: {}, // { 'YYYY-MM-DD': completed sessions }
    qada: {
      counts: zero(),
      done: 0,
      goal: 5,
      history: {}, // { 'YYYY-MM-DD': { fajr: 2, ... } }
    },
  };
}

function merge(base, saved) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return saved ?? base;
  const out = Array.isArray(base) ? [] : { ...base };
  for (const k of Object.keys(saved)) {
    const b = base?.[k];
    out[k] = b && typeof b === 'object' && !Array.isArray(b) ? merge(b, saved[k]) : saved[k];
  }
  return out;
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? merge(defaults(), JSON.parse(raw)) : defaults();
  } catch {
    state = defaults();
  }
  return state;
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable (private mode) — app keeps working in memory */
  }
}

export const get = () => state;

export function update(fn) {
  fn(state);
  persist();
  listeners.forEach((l) => l(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function replace(next) {
  state = merge(defaults(), next);
  persist();
  listeners.forEach((l) => l(state));
}

export function reset() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
  state = defaults();
  listeners.forEach((l) => l(state));
}

export function exportJSON() {
  return JSON.stringify({ app: 'falah', exportedAt: new Date().toISOString(), data: state }, null, 2);
}
