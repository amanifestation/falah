// Falah — app controller: shell, routing, actions, sheets, live updates.
import * as store from './store.js';
import { PRAYER, PRAYER_IDS, STATUSES, PERFORMED, CITIES, METHODS, suggestMethod, suggestAsr } from './data.js';
import { todayKey, keyOf, fmtCountdown, nowState, deviceTz, timesFor } from './times.js';
import * as T from './tracker.js';
import * as N from './notify.js';
import { qiblaBearing, distanceKm } from './praytimes.js';
import { icon } from './icons.js';
import { ui, S, $, esc, toast, celebrate, haptic, pname } from './ui.js';
import {
  Onboarding, TodayScreen, TrackerScreen, QadaScreen, QiblaScreen, SettingsScreen, WiridScreen, WiridCard,
  SHEETS, cityResults, estimateCount, todayDeckIndex,
} from './views.js';
import { WIRID } from './wirid.js';
import { art, PERIOD_ART } from './art.js';

const SCREENS = {
  today: TodayScreen, tracker: TrackerScreen, wirid: WiridScreen, qada: QadaScreen, qibla: QiblaScreen, settings: SettingsScreen,
};
const TABS = [
  { id: 'today', label: 'Today', icon: 'today' },
  { id: 'tracker', label: 'Tracker', icon: 'chart' },
  { id: 'wirid', label: 'Wirid', icon: 'beads' },
  { id: 'qada', label: 'Qada', icon: 'rotate' },
];

// ---------------------------------------------------------------------------
// Shell & rendering
// ---------------------------------------------------------------------------
function shell() {
  $('#app').innerHTML = `
    <div class="ambient" id="ambient" aria-hidden="true"></div>
    <main id="view" class="view"></main>
    <nav class="dock" aria-label="Main">${TABS.map((t) => `
      <button class="dock-btn" data-action="go" data-route="${t.id}" aria-label="${t.label}">${icon(t.icon)}<span>${t.label}</span></button>`).join('')}
    </nav>
    <div id="sheet-root" class="sheet-root" aria-hidden="true"></div>
    <div id="toasts" class="toasts" aria-live="polite"></div>
    <div id="fx" class="fx" aria-hidden="true"></div>`;
}

let ambientKey = '';
/**
 * Paint the ambient backdrop once: the SVG scene is rasterised into a tiny canvas which the
 * browser upscales smoothly — a soft blur without a live CSS filter (which flickers on phones).
 */
function updateAmbient() {
  const key = S().onboarded ? PERIOD_ART[nowState().period].join(':') : 'girih:olive';
  if (key === ambientKey) return;
  ambientKey = key;
  const [scene, pal] = key.split(':');
  const host = $('#ambient');
  const img = new Image();
  img.onload = () => {
    if (ambientKey !== key) return;
    const mid = document.createElement('canvas');
    mid.width = 100;
    mid.height = 130;
    mid.getContext('2d').drawImage(img, 0, 0, 100, 130);
    const c = document.createElement('canvas');
    c.width = 36;
    c.height = 47;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(mid, 0, 0, 36, 47);
    c.className = 'amb-canvas';
    const old = [...host.querySelectorAll('.amb-canvas')];
    host.append(c);
    void c.offsetWidth; // commit opacity:0 first so the fade-in transition runs
    c.classList.add('in');
    setTimeout(() => old.forEach((o) => o.remove()), 1000);
  };
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(art(scene, pal).replace('<svg ', '<svg width="400" height="520" '))}`;
}

function render(animate = false) {
  const view = $('#view');
  const onboarding = !S().onboarded;
  document.body.classList.toggle('onboarding', onboarding);
  document.body.classList.toggle('ob-welcome', onboarding && ui.ob.step === 0);
  view.classList.remove('enter');
  view.innerHTML = onboarding ? Onboarding() : SCREENS[ui.route]();
  if (animate) {
    void view.offsetWidth;
    view.classList.add('enter');
  }
  document.querySelectorAll('.dock-btn').forEach((b) => {
    const on = b.dataset.route === ui.route;
    b.classList.toggle('active', on);
    b.setAttribute('aria-current', on ? 'page' : 'false');
  });
  updateAmbient();
  fitDecks();
  live();
}

/** Size auto-height decks (wirid) to the card on top, so nothing is clipped. */
function fitDecks() {
  document.querySelectorAll('.wdeck').forEach((deck) => {
    const top = deck.querySelector('.deck-card[data-o="0"]');
    if (top) deck.style.setProperty('--deck-h', `${top.offsetHeight}px`);
  });
}

// ---------------------------------------------------------------------------
// Stacked, swipeable card decks
// ---------------------------------------------------------------------------
const deckSize = (name) => (name === 'wirid' ? WIRID.length : 5);
const deckWraps = (name) => name !== 'wirid';
const deckIndex = (name) => (name === 'today' ? todayDeckIndex() : ui.decks[name]);

/** Move a deck to card `i` without re-rendering (keeps the CSS transitions). */
function deckGo(name, i) {
  const n = deckSize(name);
  const idx = deckWraps(name) ? ((i % n) + n) % n : Math.max(0, Math.min(n - 1, i));
  if (idx === deckIndex(name) && name !== 'today') return;
  ui.decks[name] = idx;
  const deck = document.querySelector(`.deck[data-deck="${name}"]`);
  if (!deck) return;
  deck.querySelectorAll('.deck-card').forEach((c) => {
    const ci = +c.dataset.i;
    const o = deckWraps(name) ? (ci - idx + n) % n : ci - idx;
    c.dataset.o = o;
    c.style.setProperty('--o', o);
    if (!deckWraps(name)) c.classList.toggle('is-far', o < -1 || o > 3);
  });
  if (deck.classList.contains('wdeck')) {
    fitDecks();
    // A long card (e.g. Ayat al-Kursi) may have been scrolled — bring the new card's top into view.
    const r = deck.getBoundingClientRect();
    if (r.top < 70) window.scrollTo({ top: window.scrollY + r.top - 150, behavior: 'smooth' });
  }
  const nav = document.querySelector(`[data-nav="${name}"]`);
  nav?.querySelectorAll('.dots i').forEach((d, di) => d.classList.toggle('on', di === idx));
  if (!deckWraps(name) && nav) {
    nav.querySelector('[data-d="-1"]').disabled = idx === 0;
    nav.querySelector('[data-d="1"]').disabled = idx === n - 1;
  }
  document.querySelectorAll(`.ts-cell[data-deck="${name}"]`).forEach((c) => c.classList.toggle('on', +c.dataset.i === idx));
  const prog = document.querySelector('.wd-progress span');
  if (name === 'wirid' && prog) prog.style.width = `${((idx + 1) / n) * 100}%`;
  haptic(6);
}

let suppressClick = false;
function bindDecks() {
  let drag = null;
  document.addEventListener('pointerdown', (e) => {
    const card = e.target.closest('.deck-card[data-o="0"]');
    if (!card || e.button > 0) return;
    drag = { card, name: card.closest('.deck').dataset.deck, x0: e.clientX, y0: e.clientY, dx: 0, active: false, id: e.pointerId };
  });
  document.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0;
    const dy = e.clientY - drag.y0;
    if (!drag.active) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        drag.active = true;
        drag.card.classList.add('dragging');
      } else if (Math.abs(dy) > 12) {
        drag = null;
        return;
      } else return;
    }
    drag.dx = dx;
    drag.card.style.transform = `translate3d(${dx}px, ${Math.abs(dx) * 0.04}px, 0) rotate(${dx / 24}deg)`;
  });
  const end = () => {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (!d.active) return;
    suppressClick = true;
    setTimeout(() => (suppressClick = false), 60);
    d.card.classList.remove('dragging');
    const n = deckSize(d.name);
    const idx = deckIndex(d.name);
    const dir = d.dx < 0 ? 1 : -1;
    const blocked = !deckWraps(d.name) && (idx + dir < 0 || idx + dir >= n);
    if (Math.abs(d.dx) < 70 || blocked) {
      d.card.style.transform = '';
      return;
    }
    d.card.classList.add('flying');
    d.card.style.transform = `translate3d(${d.dx < 0 ? -130 : 130}%, 20px, 0) rotate(${d.dx < 0 ? -14 : 14}deg)`;
    setTimeout(() => {
      d.card.classList.remove('flying');
      d.card.style.transform = '';
      deckGo(d.name, idx + dir);
    }, 230);
  };
  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', end);
}

// ---------------------------------------------------------------------------
// Wirid counter
// ---------------------------------------------------------------------------
function wiridCount(i) {
  const w = WIRID[i];
  const c = Math.min(w.count, (ui.wirid.counts[w.id] || 0) + 1);
  ui.wirid.counts[w.id] = c;
  const card = document.querySelector(`.wcard[data-i="${i}"]`);
  if (card) {
    // Update in place so the progress ring animates smoothly.
    const tmp = document.createElement('div');
    tmp.innerHTML = WiridCard(w, i, card.dataset.o);
    const fresh = tmp.firstElementChild;
    const ring = card.querySelector('.counter .b');
    ring.style.strokeDashoffset = fresh.querySelector('.counter .b').getAttribute('stroke-dashoffset');
    card.querySelector('.counter-n').innerHTML = fresh.querySelector('.counter-n').innerHTML;
    card.querySelector('.wc-hint').innerHTML = fresh.querySelector('.wc-hint').innerHTML;
    card.querySelector('.counter').classList.toggle('done', c >= w.count);
    card.classList.toggle('done', c >= w.count);
    const n = card.querySelector('.counter-n');
    n.animate?.([{ transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'cubic-bezier(.3,1.6,.5,1)' });
  }
  if (c >= w.count) {
    haptic([25, 35, 25]);
    if (i < WIRID.length - 1) setTimeout(() => ui.route === 'wirid' && deckGo('wirid', i + 1), 650);
    else setTimeout(() => A['wirid-finish'](), 500);
  } else haptic(10);
}

/** Per-second updates without re-rendering. */
function live() {
  const now = Date.now();
  document.querySelectorAll('[data-countdown]').forEach((el) => {
    el.textContent = fmtCountdown(+el.dataset.countdown - now);
  });
  document.querySelectorAll('[data-ring]').forEach((el) => {
    const a = +el.dataset.from;
    const b = +el.dataset.to;
    const f = Math.min(1, Math.max(0, (now - a) / (b - a)));
    el.style.strokeDashoffset = String(+el.dataset.c * (1 - f));
  });
}

function applyTheme() {
  const t = S().settings.theme;
  if (t === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
  const dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', dark ? '#24231B' : '#E7E2D3'));
}

// ---------------------------------------------------------------------------
// Bottom sheets
// ---------------------------------------------------------------------------
function openSheet(name, params = {}) {
  if (!SHEETS[name]) return;
  ui.sheet = { name, params };
  const root = $('#sheet-root');
  root.innerHTML = `<div class="sheet-backdrop" data-action="close-sheet"></div>
    <div class="sheet" role="dialog" aria-modal="true"><div class="sheet-grip"><span></span></div><div class="sheet-body"></div></div>`;
  fillSheet();
  root.setAttribute('aria-hidden', 'false');
  document.body.classList.add('sheet-open');
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('open')));
  enableDrag(root.querySelector('.sheet'));
  if (name === 'timetable') setTimeout(() => $('#tt-today')?.scrollIntoView({ block: 'center' }), 350);
}

function fillSheet() {
  const body = $('#sheet-root .sheet-body');
  if (body && ui.sheet) body.innerHTML = SHEETS[ui.sheet.name].render(ui.sheet.params);
}

function closeSheet() {
  const root = $('#sheet-root');
  if (!ui.sheet) return;
  ui.sheet = null;
  root.classList.remove('open');
  document.body.classList.remove('sheet-open');
  setTimeout(() => {
    if (!ui.sheet) {
      root.innerHTML = '';
      root.setAttribute('aria-hidden', 'true');
    }
  }, 320);
}

function enableDrag(sheet) {
  const grip = sheet.querySelector('.sheet-grip');
  let y0 = null;
  let dy = 0;
  grip.addEventListener('pointerdown', (e) => {
    y0 = e.clientY;
    dy = 0;
    sheet.style.transition = 'none';
    grip.setPointerCapture(e.pointerId);
  });
  grip.addEventListener('pointermove', (e) => {
    if (y0 == null) return;
    dy = Math.max(0, e.clientY - y0);
    sheet.style.transform = `translate(-50%, ${dy}px)`;
  });
  const end = () => {
    if (y0 == null) return;
    y0 = null;
    sheet.style.transition = '';
    sheet.style.transform = '';
    if (dy > 90) closeSheet();
  };
  grip.addEventListener('pointerup', end);
  grip.addEventListener('pointercancel', end);
}

// ---------------------------------------------------------------------------
// Domain helpers
// ---------------------------------------------------------------------------
function afterLog(k, p, s, prev) {
  haptic(12);
  const name = pname(p, k);
  const undo = { label: 'Undo', fn: () => T.setLog(k, p, prev) };
  if (s && PERFORMED.has(s) && !PERFORMED.has(prev) && T.dayComplete(k)) {
    celebrate();
    toast(`Alhamdulillah — all five prayers ${k === todayKey() ? 'today' : 'that day'}!`, { icon: 'sparkle', tone: 'gold', action: undo });
  } else if (s === 'missed') {
    toast(S().settings.autoQada ? `${name} added to your Qada list` : `${name} marked as missed`, { icon: 'rotate', action: undo });
  } else if (s) {
    toast(`${name} · ${STATUSES[s].short}`, { icon: 'check', action: undo });
  } else {
    toast(`${name} log cleared`, { action: undo });
  }
}

function nearestCity(lat, lng) {
  let best = null;
  for (const c of CITIES) {
    const d = distanceKm(lat, lng, c.lat, c.lng);
    if (!best || d < best.d) best = { c, d };
  }
  return best;
}

function applyLocation(loc, ctx) {
  if (ctx === 'ob') {
    ui.ob.loc = loc;
    ui.ob.method = ui.ob.suggested = suggestMethod(loc.tz);
    ui.ob.asr = suggestAsr(loc.tz);
    ui.ob.q = '';
    render();
    return;
  }
  const prevMethod = S().settings.method;
  store.update((s) => {
    s.location = loc;
  });
  closeSheet();
  const sug = suggestMethod(loc.tz);
  if (sug !== prevMethod) {
    toast(`Location set to ${esc(loc.name)}. Switch to ${METHODS[sug].name}?`, {
      icon: 'pin',
      action: { label: 'Switch', fn: () => store.update((s) => (s.settings.method = sug)) },
      ms: 7000,
    });
  } else toast(`Location set to ${esc(loc.name)}`, { icon: 'pin' });
}

function locate(ctx) {
  if (!navigator.geolocation) return toast('Location is not available on this device', { tone: 'warn' });
  toast('Finding your location…', { icon: 'locate', ms: 2000 });
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      const near = nearestCity(lat, lng);
      const close = near && near.d < 40;
      applyLocation(
        {
          name: close ? near.c.name : 'My location',
          country: close ? near.c.country : `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`,
          lat, lng, elv: 0, tz: deviceTz(), source: 'gps',
        },
        ctx,
      );
    },
    (err) =>
      toast(err.code === 1 ? 'Location permission denied — please choose a city instead.' : 'Couldn’t get your location. Try choosing a city.', { tone: 'warn' }),
    { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60000 },
  );
}

function setPath(path, value) {
  store.update((s) => {
    const parts = path.split('.');
    let o = s;
    while (parts.length > 1) o = o[parts.shift()];
    o[parts[0]] = typeof value === 'function' ? value(o[parts[0]]) : value;
  });
}

async function enableNotifications() {
  const r = await N.requestPermission();
  store.update((s) => (s.settings.notify.enabled = true));
  if (r === 'granted') toast('Reminders are on. You’ll be notified for each prayer.', { icon: 'bell' });
  else if (r === 'denied') toast('Notifications are blocked by the browser — you’ll get in-app alerts while Falah is open.', { tone: 'warn', ms: 6000 });
  else toast('Reminders are on (in-app alerts).', { icon: 'bell' });
}

function onReminder(ev) {
  if (S().settings.notify.sound) N.chime();
  haptic([60, 40, 60]);
  const action = ev.type === 'pre' ? null : { label: 'I prayed', fn: () => quickLog(ev.k, ev.p) };
  toast(`<b>${ev.title}</b><br><small>${ev.body}</small>`, { icon: ev.type === 'nudge' ? 'target' : 'bell', tone: 'reminder', action, ms: 12000 });
}

function quickLog(k, p, s = 'ontime') {
  const prev = T.statusOf(k, p);
  T.setLog(k, p, s);
  afterLog(k, p, s, prev);
}

// ---------------------------------------------------------------------------
// Qibla compass
// ---------------------------------------------------------------------------
function onOrientation(e) {
  let h = null;
  if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;
  else if (e.absolute && e.alpha != null) h = 360 - e.alpha;
  if (h == null) return;
  const screenAngle = screen.orientation?.angle ?? window.orientation ?? 0;
  const c = ui.compass;
  const heading = (h + screenAngle + 360) % 360;
  // Accumulate along the shortest path so the dial never spins the long way round.
  const prev = c.heading == null ? heading : c.heading;
  c.angle += ((heading - prev + 540) % 360) - 180;
  c.heading = heading;
  updateCompass();
}

function updateCompass() {
  const dial = $('#dial');
  if (!dial || ui.compass.heading == null) return;
  dial.style.transform = `rotate(${-ui.compass.angle}deg)`;
  const l = S().location;
  const diff = ((qiblaBearing(l.lat, l.lng) - ui.compass.heading + 540) % 360) - 180;
  const aligned = Math.abs(diff) < 4;
  if (aligned && !ui.compass.aligned) haptic([30, 30, 30]);
  ui.compass.aligned = aligned;
  $('#qibla')?.classList.toggle('aligned', aligned);
  const hint = $('#qibla-hint');
  if (hint) hint.innerHTML = aligned ? '<b>You are facing the Qibla</b>' : `Turn <b>${diff > 0 ? 'right' : 'left'} ${Math.round(Math.abs(diff))}°</b>`;
}

async function startCompass() {
  const DOE = window.DeviceOrientationEvent;
  if (!DOE) return toast('No compass sensor on this device.', { tone: 'warn' });
  if (typeof DOE.requestPermission === 'function') {
    try {
      if ((await DOE.requestPermission()) !== 'granted') return toast('Compass permission was denied.', { tone: 'warn' });
    } catch {
      return toast('Compass permission was denied.', { tone: 'warn' });
    }
  }
  if ('ondeviceorientationabsolute' in window) window.addEventListener('deviceorientationabsolute', onOrientation, true);
  else window.addEventListener('deviceorientation', onOrientation, true);
  ui.compass.on = true;
  render();
  setTimeout(() => {
    if (ui.compass.heading == null && ui.route === 'qibla') {
      const hint = $('#qibla-hint');
      if (hint) hint.textContent = 'No compass reading detected. On a desktop, use the bearing above with a physical compass.';
    }
  }, 3000);
}

// ---------------------------------------------------------------------------
// Actions (event delegation via data-action)
// ---------------------------------------------------------------------------
const A = {
  go({ route }) {
    if (route === ui.route) return window.scrollTo({ top: 0, behavior: 'smooth' });
    ui.route = route;
    window.scrollTo(0, 0);
    render(true);
    haptic(6);
  },
  open(d) {
    const { sheet, ...params } = d;
    openSheet(sheet, params);
  },
  'deck-step'({ deck, d }) {
    deckGo(deck, deckIndex(deck) + Number(d));
  },
  'deck-go'({ deck, i }) {
    deckGo(deck, Number(i));
  },

  // Wirid
  'wirid-count'({ i }) {
    wiridCount(Number(i));
  },
  'wirid-mode'({ v }) {
    ui.wirid.mode = v;
    render();
  },
  'wirid-reset'() {
    ui.wirid.counts = {};
    ui.decks.wirid = 0;
    render();
    toast('Wirid restarted', { icon: 'rotate' });
  },
  'wirid-finish'() {
    T.wiridComplete();
    ui.wirid.counts = {};
    ui.decks.wirid = 0;
    render();
    celebrate();
    openSheet('wirid-done');
  },
  'go-wirid'() {
    closeSheet();
    ui.route = 'wirid';
    ui.wirid.mode = 'cards';
    window.scrollTo(0, 0);
    render(true);
  },
  'close-sheet': closeSheet,
  log({ k, p }) {
    openSheet('log', { k, p });
  },
  'quick-log'({ k, p }) {
    quickLog(k, p);
  },
  'set-status'({ k, p, s, stay, toggle }) {
    const prev = T.statusOf(k, p);
    const next = toggle && prev === s ? null : s || null;
    T.setLog(k, p, next);
    if (!stay) closeSheet();
    afterLog(k, p, next, prev);
  },
  'review-all'() {
    const list = T.unlogged(7);
    store.update((s) => {
      for (const { k, p } of list) (s.logs[k] ||= {})[p] = { s: 'ontime', at: Date.now() };
    });
    closeSheet();
    toast(`${list.length} prayers marked as prayed`, { icon: 'check' });
  },
  'toggle-bell'({ p }) {
    const n = S().settings.notify;
    if (!n.enabled) {
      store.update((s) => (s.settings.notify.prayers[p] = true));
      return enableNotifications();
    }
    setPath(`settings.notify.prayers.${p}`, (v) => !v);
    toast(`${PRAYER[p].name} reminder ${S().settings.notify.prayers[p] ? 'on' : 'off'}`, { icon: S().settings.notify.prayers[p] ? 'bell' : 'bellOff' });
  },

  // Tracker
  'tracker-view'({ v }) {
    ui.trackerView = v;
    render();
  },
  'tracker-nav'({ d }) {
    if (ui.trackerView === 'week') ui.weekOffset = Math.min(0, ui.weekOffset + Number(d));
    else ui.monthOffset = Math.min(0, ui.monthOffset + Number(d));
    render();
  },

  // Qada
  'qada-pray'({ p }) {
    const before = T.qadaToday();
    if (!T.qadaPray(p, 1)) return;
    haptic(12);
    const goal = S().qada.goal;
    if (before < goal && T.qadaToday() >= goal) {
      celebrate();
      toast('Daily Qada goal reached — may Allah accept it!', { icon: 'sparkle', tone: 'gold', action: { label: 'Undo', fn: () => T.qadaPray(p, -1) } });
    } else if (T.qadaRemaining() === 0) {
      celebrate();
      toast('Your Qada list is clear. Alhamdulillah!', { icon: 'trophy', tone: 'gold' });
    } else toast(`${PRAYER[p].name} Qada recorded`, { icon: 'check', action: { label: 'Undo', fn: () => T.qadaPray(p, -1) } });
  },
  'qada-add'({ p }) {
    T.qadaAdd(p, 1);
    haptic(6);
    toast(`Added 1 missed ${PRAYER[p].name}`, { icon: 'plus', action: { label: 'Undo', fn: () => T.qadaAdd(p, -1) } });
  },
  'qada-day'() {
    const done = PRAYER_IDS.filter((p) => S().qada.counts[p] > 0);
    const before = T.qadaToday();
    done.forEach((p) => T.qadaPray(p, 1));
    const goal = S().qada.goal;
    if (before < goal && T.qadaToday() >= goal) celebrate();
    toast(`${done.length} Qada prayers recorded`, { icon: 'sparkle', action: { label: 'Undo', fn: () => done.forEach((p) => T.qadaPray(p, -1)) } });
  },
  goal({ d }) {
    setPath('qada.goal', (g) => Math.min(50, Math.max(1, g + Number(d))));
  },
  'qs-step'({ d }) {
    const el = $('#qs-input');
    el.value = Math.max(0, (Number(el.value) || 0) + Number(d));
  },
  'qada-set-save'({ p }) {
    T.qadaSet(p, Number($('#qs-input').value));
    closeSheet();
    toast(`${PRAYER[p].name} Qada updated`, { icon: 'check' });
  },
  'est-mode'({ v }, el) {
    el.parentElement.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === el));
    document.querySelectorAll('.est-pane').forEach((p) => (p.hidden = p.dataset.pane !== v));
    updateEstimate();
  },
  'est-prayer'(d, el) {
    el.classList.toggle('on');
    updateEstimate();
  },
  'estimate-apply'() {
    const { days, prayers, total } = estimateCount();
    if (!total) return toast('Enter a duration or date range first.', { tone: 'warn' });
    store.update((s) => prayers.forEach((p) => (s.qada.counts[p] += days)));
    closeSheet();
    toast(`${total.toLocaleString('en-US')} prayers added to your Qada plan. Bismillah — one at a time.`, { icon: 'rotate', ms: 5000 });
  },

  // Location & method
  locate({ ctx }) {
    locate(ctx);
  },
  'pick-city'({ i, ctx }) {
    const c = CITIES[Number(i)];
    applyLocation({ name: c.name, country: c.country, lat: c.lat, lng: c.lng, elv: 0, tz: c.tz, source: 'city' }, ctx);
  },
  'manual-loc'() {
    const lat = parseFloat($('#m-lat').value);
    const lng = parseFloat($('#m-lng').value);
    if (!(Math.abs(lat) <= 90 && Math.abs(lng) <= 180)) return toast('Please enter a valid latitude and longitude.', { tone: 'warn' });
    const name = $('#m-name').value.trim() || 'Custom location';
    applyLocation({ name, country: `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`, lat, lng, elv: 0, tz: deviceTz(), source: 'manual' }, 'settings');
  },
  'pick-method'({ m }) {
    setPath('settings.method', m);
    closeSheet();
    toast(`Using ${METHODS[m].name}`, { icon: 'globe' });
  },
  adjust({ p, d }) {
    setPath(`settings.adjust.${p}`, (v) => Math.max(-30, Math.min(30, (Number(v) || 0) + Number(d))));
  },
  'adjust-reset'() {
    store.update((s) => Object.keys(s.settings.adjust).forEach((k) => (s.settings.adjust[k] = 0)));
  },
  'timetable-nav'({ d }) {
    ui.sheet.params.off = (Number(ui.sheet.params.off) || 0) + Number(d);
    fillSheet();
  },
  'hijri-adj'({ d }) {
    setPath('settings.hijriAdjust', (v) => Math.max(-2, Math.min(2, v + Number(d))));
  },

  // Generic settings
  set({ path, value, num }) {
    setPath(path, num ? Number(value) : value);
  },
  toggle({ path }) {
    setPath(path, (v) => !v);
  },
  'notif-toggle'() {
    if (S().settings.notify.enabled) {
      setPath('settings.notify.enabled', false);
      toast('Reminders turned off', { icon: 'bellOff' });
    } else enableNotifications();
  },
  'test-notif'() {
    const ns = nowState();
    const p = ns.next.p;
    const ev = { id: `test:${Date.now()}`, type: 'adhan', k: ns.next.k, p, title: `It's time for ${PRAYER[p].name}`, body: 'This is a test reminder from Falah.' };
    onReminder(ev);
    N.showSystem(ev);
  },
  'name-save'() {
    setPath('profile.name', $('#name-input').value.trim().slice(0, 30));
    closeSheet();
  },

  // Data
  export() {
    const blob = new Blob([store.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `falah-backup-${todayKey()}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Backup file saved', { icon: 'download' });
  },
  import() {
    $('#import-file')?.click();
  },
  'reset-confirm'() {
    store.reset();
    closeSheet();
    ui.route = 'today';
    initOnboarding();
    render(true);
  },
  async install() {
    const p = ui.installPrompt;
    if (!p) return;
    p.prompt();
    await p.userChoice.catch(() => null);
    ui.installPrompt = null;
    render();
  },
  'compass-start': startCompass,

  // Onboarding
  'ob-next'() {
    ui.ob.step = Math.min(4, ui.ob.step + 1);
    render();
    window.scrollTo(0, 0);
  },
  'ob-back'() {
    ui.ob.step = Math.max(0, ui.ob.step - 1);
    render();
  },
  'ob-method'({ m }) {
    ui.ob.method = m;
    render();
  },
  'ob-asr'({ v }) {
    ui.ob.asr = v;
    render();
  },
  'ob-before'({ v }) {
    ui.ob.before = Number(v);
    render();
  },
  async 'ob-notify'() {
    ui.ob.notify = !ui.ob.notify;
    render();
    if (ui.ob.notify) await N.requestPermission();
  },
  'ob-finish'() {
    const o = ui.ob;
    store.update((s) => {
      s.profile.name = o.name.trim();
      s.location = o.loc;
      s.settings.method = o.method;
      s.settings.asr = o.asr;
      s.settings.notify.enabled = o.notify;
      s.settings.notify.before = o.before;
      s.startedOn = keyOf(new Date(), o.loc.tz);
      s.onboarded = true;
    });
    ui.route = 'today';
    render(true);
    celebrate();
    toast(`Welcome${o.name.trim() ? ', ' + esc(o.name.trim()) : ''}! Log each prayer as you pray it.`, { icon: 'sparkle', tone: 'gold', ms: 4500 });
  },
};

const INPUTS = {
  'ob-name'(el) {
    ui.ob.name = el.value;
  },
  'city-search'(el) {
    if (el.dataset.ctx === 'ob') ui.ob.q = el.value;
    $('#city-results').innerHTML = cityResults(el.value, el.dataset.ctx);
  },
  est: updateEstimate,
};

function updateEstimate() {
  const el = $('#est-preview');
  if (!el) return;
  const { days, prayers, total } = estimateCount();
  el.innerHTML = `<b>${total.toLocaleString('en-US')}</b><span>${total ? `prayers to add · ${days.toLocaleString('en-US')} days × ${prayers.length}` : 'prayers to add'}</span>`;
}

const CHANGES = {
  set(el) {
    setPath(el.dataset.path, el.dataset.num ? Number(el.value) : el.value);
  },
};

function bindEvents() {
  document.addEventListener('click', (e) => {
    if (suppressClick) {
      e.preventDefault();
      return;
    }
    const peek = e.target.closest('.deck-card');
    if (peek && peek.dataset.o !== '0') {
      // Tapping a card peeking from behind brings it to the front.
      e.preventDefault();
      deckGo(peek.closest('.deck').dataset.deck, +peek.dataset.i);
      return;
    }
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    N.unlockAudio();
    const fn = A[el.dataset.action];
    if (fn) {
      e.preventDefault();
      fn({ ...el.dataset }, el, e);
    }
  });
  document.addEventListener('input', (e) => INPUTS[e.target.dataset?.input]?.(e.target));
  document.addEventListener('change', (e) => {
    if (e.target.id === 'import-file') return importFile(e.target);
    CHANGES[e.target.dataset?.change]?.(e.target);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSheet();
    if (e.key === 'Enter' && e.target.dataset?.input === 'ob-name') A['ob-next']();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    ui.installPrompt = e;
    if (ui.route === 'settings') render();
  });
  // Returning to the app: refresh only if a prayer time changed meanwhile (no full redraw → no flash).
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tick();
  });
  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(fitDecks, 150);
  });
  navigator.serviceWorker?.addEventListener('message', (e) => {
    const d = e.data || {};
    if (d.type !== 'notif' || !d.data?.k) return;
    if (d.action === 'prayed') quickLog(d.data.k, d.data.p);
    else if (S().onboarded && T.isDue(d.data.k, d.data.p)) openSheet('log', { k: d.data.k, p: d.data.p });
  });
}

function importFile(input) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const json = JSON.parse(reader.result);
      if (json.app !== 'falah' || !json.data?.logs) throw new Error('bad file');
      store.replace(json.data);
      toast('Backup restored', { icon: 'check' });
    } catch {
      toast('That file isn’t a valid Falah backup.', { tone: 'warn' });
    }
    input.value = '';
  };
  reader.readAsText(file);
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
function initOnboarding() {
  const tz = deviceTz();
  const c = CITIES.find((x) => x.tz === tz) || CITIES[0];
  const loc = { name: c.name, country: c.country, lat: c.lat, lng: c.lng, elv: 0, tz: c.tz, source: 'city' };
  const m = suggestMethod(c.tz);
  ui.ob = { step: 0, name: '', loc, method: m, suggested: m, asr: suggestAsr(c.tz), notify: false, before: 10, q: '' };
}

function handleUrl() {
  const params = new URLSearchParams(location.search);
  const log = params.get('log');
  if (log && S().onboarded) {
    const [k, p] = log.split(':');
    if (/^\d{4}-\d{2}-\d{2}$/.test(k) && PRAYER[p] && T.isDue(k, p)) quickLog(k, p);
  }
  const route = params.get('tab');
  if (route && SCREENS[route]) ui.route = route;
  if (log || route) history.replaceState(null, '', location.pathname);
}

let sig = '';
function tick() {
  const now = new Date();
  live();
  if (!S().onboarded) return;
  const ns = nowState(now);
  const next = [ns.today, ns.current?.k, ns.current?.p, ns.next?.p, ns.period, ns.duha].join('|');
  if (sig && next !== sig) {
    ui.decks.today = null; // a new prayer time began — follow the clock again
    if (ui.route !== 'qibla' && ui.route !== 'wirid' && !ui.sheet) render();
    else updateAmbient();
  }
  sig = next;
  if (now.getSeconds() % 5 === 0) N.tick(now, onReminder);
}

/** Wait for the fonts (max ~1.2 s) so text never jumps from a fallback font after it appears. */
function fontsReady() {
  if (!document.fonts?.load) return Promise.resolve();
  const want = ['300 40px Geist', '400 16px Geist', '500 16px Geist', '400 26px Amiri', 'italic 400 20px "Instrument Serif"'];
  return Promise.race([
    Promise.all(want.map((f) => document.fonts.load(f).catch(() => null))),
    new Promise((r) => setTimeout(r, 1200)),
  ]);
}

async function boot() {
  store.load();
  initOnboarding();
  shell();
  applyTheme();
  bindEvents();
  bindDecks();
  handleUrl();
  await fontsReady();
  render(true);
  // Fade the splash out once the first frame is painted (timeout fallback when rAF is paused).
  let splashGone = false;
  const hideSplash = () => {
    if (splashGone) return;
    splashGone = true;
    const splash = document.getElementById('splash');
    if (!splash) return;
    splash.classList.add('out');
    setTimeout(() => splash.remove(), 700);
  };
  requestAnimationFrame(() => requestAnimationFrame(hideSplash));
  setTimeout(hideSplash, 120);
  document.fonts?.ready?.then(fitDecks);

  store.subscribe(() => {
    applyTheme();
    render();
    if (ui.sheet && SHEETS[ui.sheet.name].live) fillSheet();
  });

  setInterval(tick, 1000);

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  // Warm the times cache for the coming day.
  timesFor(todayKey());
}

boot();
