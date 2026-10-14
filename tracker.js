// Prayer logging, Qada ledger, statistics, streaks and achievements.
import * as store from './store.js';
import { PRAYER_IDS, PERFORMED, ON_TIME } from './data.js';
import { addDays, daysBetween, todayKey, windowOf, timesFor } from './times.js';
import { gardenState } from './garden.js';

const S = () => store.get();

export const getLog = (k, p) => S().logs[k]?.[p] || null;
export const statusOf = (k, p) => getLog(k, p)?.s || null;

export function setLog(k, p, status) {
  store.update((s) => {
    const day = s.logs[k] || (s.logs[k] = {});
    const prev = day[p];
    if (prev?.q) s.qada.counts[p] = Math.max(0, s.qada.counts[p] - 1);
    if (!status) {
      delete day[p];
      if (!Object.keys(day).length) delete s.logs[k];
      return;
    }
    const entry = { s: status, at: Date.now() };
    if (status === 'missed' && s.settings.autoQada) {
      s.qada.counts[p] += 1;
      entry.q = 1;
    }
    day[p] = entry;
  });
}

/** Has this prayer's time begun (so it can be logged)? */
export const isDue = (k, p, now = new Date()) => timesFor(k)[p] <= now;

export function dayPerformed(k) {
  return PRAYER_IDS.filter((p) => PERFORMED.has(statusOf(k, p))).length;
}
export const dayComplete = (k) => dayPerformed(k) === 5;

/** Past prayers whose window has closed without a log, since tracking began. */
export function unlogged(days = 7, now = new Date()) {
  const start = S().startedOn;
  if (!start) return [];
  const today = todayKey();
  const out = [];
  for (let i = days; i >= 0; i--) {
    const k = addDays(today, -i);
    if (k < start) continue;
    for (const p of PRAYER_IDS) {
      if (!getLog(k, p) && windowOf(k, p).end <= now) out.push({ k, p });
    }
  }
  return out;
}

export function rangeStats(from, to, now = new Date()) {
  const start = S().startedOn || to;
  const st = { due: 0, performed: 0, onTime: 0, jamaah: 0, late: 0, missed: 0, unlogged: 0, score: 0 };
  const per = Object.fromEntries(PRAYER_IDS.map((p) => [p, { due: 0, performed: 0, onTime: 0 }]));
  for (let k = from < start ? start : from; k <= to; k = addDays(k, 1)) {
    for (const p of PRAYER_IDS) {
      if (!isDue(k, p, now)) continue;
      const s = statusOf(k, p);
      st.due++;
      per[p].due++;
      if (!s) {
        st.unlogged++;
        continue;
      }
      if (PERFORMED.has(s)) {
        st.performed++;
        per[p].performed++;
      }
      if (ON_TIME.has(s)) {
        st.onTime++;
        per[p].onTime++;
      }
      if (s === 'jamaah') st.jamaah++;
      if (s === 'late') st.late++;
      if (s === 'missed') st.missed++;
      st.score += { jamaah: 1, ontime: 1, late: 0.5, missed: 0 }[s];
    }
  }
  st.per = per;
  st.completion = st.due ? st.performed / st.due : 0;
  st.onTimeRate = st.due ? st.onTime / st.due : 0;
  return st;
}

export function currentStreak() {
  let k = todayKey();
  if (!dayComplete(k)) k = addDays(k, -1);
  let n = 0;
  while (dayComplete(k)) {
    n++;
    k = addDays(k, -1);
  }
  return n;
}

function bestRun(test) {
  const keys = Object.keys(S().logs).sort();
  if (!keys.length) return 0;
  let best = 0;
  let run = 0;
  const end = todayKey();
  for (let k = keys[0]; k <= end; k = addDays(k, 1)) {
    if (test(k)) best = Math.max(best, ++run);
    else run = 0;
  }
  return best;
}
export const bestStreak = () => bestRun(dayComplete);

export function totals() {
  let logged = 0;
  let jamaah = 0;
  for (const day of Object.values(S().logs)) {
    for (const e of Object.values(day)) {
      logged++;
      if (e.s === 'jamaah') jamaah++;
    }
  }
  return { logged, jamaah };
}

export function achievements() {
  const t = totals();
  const best = bestStreak();
  const fajrRun = bestRun((k) => ON_TIME.has(statusOf(k, 'fajr')));
  const q = S().qada;
  const qRemaining = qadaRemaining();
  const wirid = Object.values(S().wirid || {}).reduce((a, n) => a + n, 0);
  const garden = gardenState();
  const forest = garden.trees;
  return [
    { id: 'wirid10', title: 'Ahl al-Dhikr', desc: 'Complete the wirid 10 times', got: wirid >= 10, icon: 'beads', progress: Math.min(1, wirid / 10) },
    { id: 'first', title: 'First Step', desc: 'Log your first prayer', got: t.logged > 0, icon: 'sparkle' },
    { id: 'fullday', title: 'Complete Day', desc: 'All five prayers in one day', got: best >= 1, icon: 'check' },
    { id: 's7', title: 'Steadfast', desc: '7-day prayer streak', got: best >= 7, icon: 'flame', progress: Math.min(1, best / 7) },
    { id: 's30', title: 'Istiqamah', desc: '30-day prayer streak', got: best >= 30, icon: 'flame', progress: Math.min(1, best / 30) },
    { id: 'fajr7', title: 'Dawn Riser', desc: 'Fajr on time 7 days running', got: fajrRun >= 7, icon: 'fajr', progress: Math.min(1, fajrRun / 7) },
    { id: 'jamaah40', title: 'People of the Masjid', desc: '40 prayers in congregation', got: t.jamaah >= 40, icon: 'users', progress: Math.min(1, t.jamaah / 40) },
    { id: 'fruit1', title: 'First Fruit', desc: 'Grow your first tree to fruit', got: forest >= 1, icon: 'sparkle', progress: Math.min(1, garden.g) },
    { id: 'forest5', title: 'Lush Forest', desc: 'Five trees in your garden', got: forest >= 5, icon: 'heart', progress: Math.min(1, forest / 5) },
    { id: 'qada1', title: 'Turning Back', desc: 'Complete your first Qada prayer', got: q.done >= 1, icon: 'rotate' },
    { id: 'qada100', title: 'Clearing the Debt', desc: '100 Qada prayers completed', got: q.done >= 100, icon: 'rotate', progress: Math.min(1, q.done / 100) },
    { id: 'qadaZero', title: 'Slate Restored', desc: 'Bring your Qada list to zero', got: q.done > 0 && qRemaining === 0, icon: 'trophy' },
  ];
}

export const wiridToday = () => (S().wirid || {})[todayKey()] || 0;
export function wiridComplete() {
  store.update((s) => {
    const k = todayKey();
    s.wirid ||= {};
    s.wirid[k] = (s.wirid[k] || 0) + 1;
  });
}

// ---- Qada ledger ---------------------------------------------------------
export const qadaRemaining = () => PRAYER_IDS.reduce((a, p) => a + (S().qada.counts[p] || 0), 0);
export const qadaToday = () => {
  const h = S().qada.history[todayKey()] || {};
  return PRAYER_IDS.reduce((a, p) => a + (h[p] || 0), 0);
};

/** Record completed qada prayers (n may be negative to undo). Returns how many applied. */
export function qadaPray(p, n = 1) {
  let applied = 0;
  store.update((s) => {
    const k = todayKey();
    const h = s.qada.history[k] || (s.qada.history[k] = {});
    if (n > 0) applied = Math.min(n, s.qada.counts[p]);
    else applied = -Math.min(-n, h[p] || 0);
    if (!applied) return;
    s.qada.counts[p] -= applied;
    h[p] = (h[p] || 0) + applied;
    s.qada.done = Math.max(0, s.qada.done + applied);
    if (!h[p]) delete h[p];
  });
  return applied;
}

export function qadaAdd(p, n) {
  store.update((s) => {
    s.qada.counts[p] = Math.max(0, (s.qada.counts[p] || 0) + n);
  });
}

export function qadaSet(p, n) {
  store.update((s) => {
    s.qada.counts[p] = Math.max(0, Math.floor(n) || 0);
  });
}

export function qadaHistory(days = 14) {
  const today = todayKey();
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const k = addDays(today, -i);
    const h = S().qada.history[k] || {};
    out.push({ k, n: PRAYER_IDS.reduce((a, p) => a + (h[p] || 0), 0) });
  }
  return out;
}

/** Projected completion date at the daily goal. */
export function qadaProjection() {
  const remaining = qadaRemaining();
  const goal = Math.max(1, S().qada.goal);
  const days = Math.ceil(remaining / goal);
  return { days, finish: addDays(todayKey(), days) };
}

export { daysBetween };
