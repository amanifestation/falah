// Prayer reminders: pre-alerts, prayer-time alerts and "time is running out" check-ins.
import * as store from './store.js';
import { PRAYER, PRAYER_IDS } from './data.js';
import { addDays, timesFor, todayKey, windowOf, fmtTime } from './times.js';
import { getLog } from './tracker.js';

const FIRED_KEY = 'falah.fired';
let fired;
try {
  fired = new Set(JSON.parse(sessionStorage.getItem(FIRED_KEY) || '[]'));
} catch {
  fired = new Set();
}
const markFired = (id) => {
  fired.add(id);
  try {
    sessionStorage.setItem(FIRED_KEY, JSON.stringify([...fired].slice(-80)));
  } catch {}
};

export const supported = () => 'Notification' in window;
export const permission = () => (supported() ? Notification.permission : 'unsupported');

export async function requestPermission() {
  if (!supported()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

/** All reminder events for yesterday→tomorrow (yesterday covers the Isha window after midnight). */
export function events() {
  const { notify } = store.get().settings;
  const today = todayKey();
  const out = [];
  for (const k of [addDays(today, -1), today, addDays(today, 1)]) {
    const t = timesFor(k);
    for (const p of PRAYER_IDS) {
      if (!notify.prayers[p]) continue;
      const name = PRAYER[p].name;
      if (notify.before > 0) {
        out.push({
          id: `pre:${k}:${p}`, type: 'pre', k, p, at: new Date(+t[p] - notify.before * 60000),
          title: `${name} in ${notify.before} minutes`,
          body: `${name} begins at ${fmtTime(t[p])}. Take a moment to prepare and make wudu.`,
        });
      }
      out.push({
        id: `adhan:${k}:${p}`, type: 'adhan', k, p, at: t[p],
        title: `It's time for ${name}`,
        body: `${name} has begun (${fmtTime(t[p])}). Hayya ʿala al-Salah — come to prayer.`,
      });
      if (notify.nudge) {
        const w = windowOf(k, p);
        const at = new Date(+w.end - notify.nudgeMins * 60000);
        if (at > t[p]) {
          out.push({
            id: `nudge:${k}:${p}`, type: 'nudge', k, p, at,
            title: `${name} ends in ${notify.nudgeMins} minutes`,
            body: `Have you prayed ${name}? Tap to log it — consistency builds strength.`,
          });
        }
      }
    }
  }
  return out.sort((a, b) => a.at - b.at);
}

export function upcoming(now = new Date()) {
  return events().find((e) => e.at > now) || null;
}

/** Called every few seconds by the app; fires anything due in the last 3 minutes. */
export function tick(now, onFire) {
  if (!store.get().settings.notify.enabled) return;
  for (const ev of events()) {
    if (fired.has(ev.id) || ev.at > now || now - ev.at > 3 * 60000) continue;
    markFired(ev.id);
    if (ev.type === 'nudge' && getLog(ev.k, ev.p)) continue; // already logged — no nagging
    onFire(ev);
    showSystem(ev);
  }
}

export async function showSystem(ev) {
  if (permission() !== 'granted') return;
  const opts = {
    body: ev.body,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: ev.id,
    renotify: true,
    vibrate: [180, 80, 180],
    data: { k: ev.k, p: ev.p, type: ev.type },
    actions: ev.type === 'pre' ? [] : [{ action: 'prayed', title: '✓ I have prayed' }],
  };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) return reg.showNotification(ev.title, opts);
  } catch {}
  try {
    delete opts.actions;
    new Notification(ev.title, opts);
  } catch {}
}

// ---- sound -----------------------------------------------------------------
let ctx;
export function unlockAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  } catch {}
}

/** Soft three-note bell, synthesised (no audio files needed). */
export function chime() {
  unlockAudio();
  if (!ctx) return;
  const t0 = ctx.currentTime + 0.05;
  const master = ctx.createGain();
  master.gain.value = 0.22;
  master.connect(ctx.destination);
  [587.33, 739.99, 880].forEach((f, i) => {
    const start = t0 + i * 0.42;
    [1, 2.01, 3.02].forEach((h, j) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f * h;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime([1, 0.28, 0.1][j], start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 2.4 - j * 0.5);
      o.connect(g).connect(master);
      o.start(start);
      o.stop(start + 2.5);
    });
  });
}
