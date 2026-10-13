// Shared UI state, formatting helpers and small feedback components.
import * as store from './store.js';
import { PRAYER } from './data.js';
import { icon } from './icons.js';
import { addDays, keyLabel, todayKey, weekday } from './times.js';

export const ui = {
  route: 'today',
  trackerView: 'week',
  weekOffset: 0,
  monthOffset: 0,
  sheet: null,
  ob: null,
  compass: { on: false, heading: null, angle: 0, aligned: false },
  decks: { today: null, wirid: 0, guide: 0 }, // active card per deck (today: null = follow the clock)
  recite: { tab: 'guide' }, // 'guide' (inside the prayer) | 'wirid' (after the prayer)
  wirid: { counts: {}, mode: 'cards' },
  guide: { counts: {}, mode: 'list', prayer: 'dhuhr', type: 'ada', role: 'alone', open: new Set(['g-niat']) },
  installPrompt: null,
};

export const S = () => store.get();
export const $ = (sel, root = document) => root.querySelector(sel);
export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const pct = (x) => `${Math.round((x || 0) * 100)}%`;
export const num = (n) => Number(n || 0).toLocaleString('en-US');
export const STATUS_ICON = { jamaah: 'users', ontime: 'check', late: 'clock', missed: 'x' };

export function haptic(ms = 8) {
  try {
    if (navigator.userActivation?.hasBeenActive !== false) navigator.vibrate?.(ms);
  } catch {}
}

/** Prayer display name; Dhuhr becomes Jumuʿah on Fridays. */
export const pname = (p, k) => (p === 'dhuhr' && k && weekday(k) === 5 ? 'Jumuʿah' : PRAYER[p].name);

export function dayLabel(k, long = false) {
  const t = todayKey();
  if (k === t) return 'Today';
  if (k === addDays(t, -1)) return 'Yesterday';
  if (k === addDays(t, 1)) return 'Tomorrow';
  return keyLabel(k, long ? { weekday: 'long', day: 'numeric', month: 'long' } : { weekday: 'short', day: 'numeric', month: 'short' });
}

export function humanDays(d) {
  if (d <= 1) return 'a day';
  if (d < 45) return `${d} days`;
  if (d < 365) return `${Math.round(d / 30.4)} months`;
  const y = d / 365.25;
  return `${y < 10 ? y.toFixed(1) : Math.round(y)} years`;
}

export const Stat = (label, value, sub, ic, tone = '') => `
  <div class="stat ${tone}">
    <span class="stat-ic">${icon(ic)}</span>
    <p class="stat-val">${value}</p>
    <p class="stat-label">${label}</p>
    ${sub ? `<p class="stat-sub">${sub}</p>` : ''}
  </div>`;

export const Switch = (on, attrs) =>
  `<button class="switch ${on ? 'on' : ''}" role="switch" aria-checked="${!!on}" ${attrs}><span></span></button>`;

export function toast(msg, opts = {}) {
  const host = $('#toasts');
  if (!host) return;
  const el = document.createElement('div');
  el.className = `toast ${opts.tone || ''}`;
  el.innerHTML = `${opts.icon ? icon(opts.icon) : ''}<span class="toast-msg">${msg}</span>${
    opts.action ? `<button class="toast-btn">${esc(opts.action.label)}</button>` : ''
  }`;
  if (opts.action) {
    el.querySelector('button').addEventListener('click', () => {
      opts.action.fn();
      el.remove();
    });
  }
  while (host.children.length > 2) host.firstChild.remove();
  host.append(el);
  const ms = opts.ms || (opts.action ? 5000 : 3000);
  setTimeout(() => el.classList.add('out'), ms);
  setTimeout(() => el.remove(), ms + 400);
}

/** Gold & emerald particle burst for milestones. */
export function celebrate() {
  const fx = $('#fx');
  if (!fx || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#E3B860', '#C99A3B', '#3CC59A', '#0E6B58', '#F3DFA9'];
  for (let i = 0; i < 46; i++) {
    const s = document.createElement('i');
    const a = Math.random() * Math.PI * 2;
    const d = 90 + Math.random() * 170;
    s.style.setProperty('--dx', `${Math.cos(a) * d}px`);
    s.style.setProperty('--dy', `${Math.sin(a) * d - 60}px`);
    s.style.setProperty('--r', `${Math.random() * 540 - 270}deg`);
    s.style.background = colors[i % colors.length];
    s.style.animationDelay = `${Math.random() * 120}ms`;
    if (i % 3 === 0) s.className = 'star';
    fx.append(s);
    setTimeout(() => s.remove(), 1600);
  }
  haptic([20, 40, 20]);
}
