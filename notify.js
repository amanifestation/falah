// Prayer reminders: pre-alerts, prayer-time alerts and "time is running out" check-ins.
import * as store from './store.js';
import { PRAYER, PRAYER_IDS, ADHANS, ADHAN } from './data.js';
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

// ---- native app (Capacitor) ------------------------------------------------
// Inside the Android/iOS app the reminders are handed to the operating system,
// so they fire even when Falah is closed. In the browser the in-app timer is used.
const plugins = () => (window.Capacitor?.isNativePlatform?.() ? window.Capacitor.Plugins : null);
export const isNative = () => !!plugins();
const LN = () => plugins()?.LocalNotifications;
let nativePerm = 'default';

export const supported = () => isNative() || 'Notification' in window;
export const permission = () => {
  if (isNative()) return nativePerm;
  return 'Notification' in window ? Notification.permission : 'unsupported';
};

export async function requestPermission() {
  if (isNative()) {
    try {
      const r = await LN().requestPermissions();
      nativePerm = r.display === 'granted' ? 'granted' : r.display === 'denied' ? 'denied' : 'default';
    } catch {
      nativePerm = 'denied';
    }
    syncNative();
    return nativePerm;
  }
  if (!('Notification' in window)) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

// ---- adhan voices -----------------------------------------------------------
const available = new Set(ADHANS.filter((a) => !a.optional).map((a) => a.id));
/** Optional voices (your own adhan) are offered only when their file is actually present. */
export async function probeAdhans() {
  await Promise.all(ADHANS.filter((a) => a.optional).map(async (a) => {
    try {
      const r = await fetch(a.file, { method: 'HEAD', cache: 'no-store' });
      if (r.ok && !/text\/html/.test(r.headers.get('content-type') || '')) available.add(a.id);
    } catch {}
  }));
  return available;
}
export const adhanAvailable = (id) => available.has(id);
/** The chosen voice, falling back to the first bundled one if it is missing. */
export function adhanVoice() {
  const v = store.get().settings.notify.adhan;
  if (v === 'chime' || v === 'silent') return v;
  return available.has(v) ? v : ADHANS[0].id;
}

let player = null;
export function playAdhan(id, onEnd) {
  stopAdhan();
  const a = ADHAN[id];
  if (!a) return false;
  player = new Audio(a.file);
  player.dataset.id = id;
  player.onended = () => {
    player = null;
    onEnd?.();
  };
  player.play().catch(() => {
    player = null;
    onEnd?.();
  });
  return true;
}
export function stopAdhan() {
  if (!player) return;
  player.pause();
  player = null;
}
export const playingAdhan = () => player?.dataset.id || null;

const channelFor = (ev) => {
  if (ev.type !== 'adhan') return 'falah_reminders';
  const v = adhanVoice();
  return v === 'silent' ? 'falah_quiet' : v === 'chime' ? 'falah_reminders' : `adhan_${v}`;
};

/** Android 8+: every sound needs its own notification channel (sound files live in res/raw). */
async function createChannels(ln) {
  const ch = [
    { id: 'falah_reminders', name: 'Prayer reminders', description: 'Before-prayer alerts and check-ins', importance: 4, vibration: true },
    { id: 'falah_quiet', name: 'Prayer times (silent)', description: 'Prayer-time alerts without sound', importance: 2 },
    ...ADHANS.filter((a) => available.has(a.id)).map((a) => ({
      id: `adhan_${a.id}`, name: `Adhan · ${a.name}`, description: 'Plays the adhan when a prayer time begins',
      importance: 5, visibility: 1, sound: a.file, vibration: true,
    })),
  ];
  for (const c of ch) {
    try {
      await ln.createChannel(c);
    } catch {}
  }
}

/** One-time native setup: permission state, the "I have prayed" action and tap handling. */
export async function initNative(onAction) {
  const ln = LN();
  if (!ln) return;
  try {
    await probeAdhans();
    await createChannels(ln);
    const r = await ln.checkPermissions();
    nativePerm = r.display === 'granted' ? 'granted' : r.display === 'denied' ? 'denied' : 'default';
    await ln.registerActionTypes({ types: [{ id: 'PRAYED', actions: [{ id: 'prayed', title: '✓ I have prayed' }] }] });
    ln.addListener('localNotificationActionPerformed', (e) => {
      const x = e.notification?.extra || {};
      if (x.k) onAction(e.actionId === 'prayed' ? 'prayed' : 'open', x);
    });
  } catch {}
  syncNative();
}

let syncTimer;
/** (Re)schedule the next six days of reminders with the OS. Debounced; safe to call often. */
export function syncNative() {
  if (!LN()) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    const ln = LN();
    try {
      const pending = await ln.getPending();
      if (pending.notifications?.length) await ln.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
      const { notify } = store.get().settings;
      if (!notify.enabled || nativePerm !== 'granted') return;
      const now = Date.now();
      const list = events(6)
        .filter((ev) => +ev.at > now + 5000)
        .filter((ev) => !(ev.type === 'nudge' && getLog(ev.k, ev.p))) // already prayed — no check-in
        .slice(0, window.Capacitor.getPlatform?.() === 'ios' ? 64 : 120) // iOS keeps at most 64 pending
        .map((ev, i) => ({
          id: i + 1,
          title: ev.title,
          body: ev.body,
          schedule: { at: ev.at, allowWhileIdle: true },
          extra: { k: ev.k, p: ev.p, type: ev.type },
          channelId: channelFor(ev),
          ...(channelFor(ev).startsWith('adhan_') ? { sound: ADHAN[adhanVoice()].file } : {}),
          ...(ev.type === 'pre' ? {} : { actionTypeId: 'PRAYED' }),
        }));
      if (list.length) await ln.schedule({ notifications: list });
    } catch {}
  }, 800);
}

/** Reminder events from yesterday (the Isha window after midnight) up to `daysAhead` days ahead. */
export function events(daysAhead = 1) {
  const { notify } = store.get().settings;
  const today = todayKey();
  const out = [];
  for (let d = -1; d <= daysAhead; d++) {
    const k = addDays(today, d);
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
  if (!store.get().settings.notify.enabled || isNative()) return; // native: the OS delivers them
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
  if (isNative()) {
    try {
      const channelId = channelFor(ev);
      await LN().schedule({ notifications: [{
        id: 9000 + (Date.now() % 900), title: ev.title, body: ev.body,
        schedule: { at: new Date(Date.now() + 1500), allowWhileIdle: true },
        extra: { k: ev.k, p: ev.p, type: ev.type }, actionTypeId: 'PRAYED', channelId,
        ...(channelId.startsWith('adhan_') ? { sound: ADHAN[adhanVoice()].file } : {}),
      }] });
    } catch {}
    return;
  }
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
