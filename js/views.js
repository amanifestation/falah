// Screen and bottom-sheet renderers (pure HTML strings).
import { PRAYER, PRAYER_IDS, STATUSES, PERFORMED, METHODS, CITIES, REMINDERS } from './data.js';
import {
  todayKey, addDays, daysBetween, weekday, keyLabel, parseKey, fmtTime, timesFor, windowOf, nowState, hijri,
} from './times.js';
import * as T from './tracker.js';
import * as N from './notify.js';
import { qiblaBearing, distanceKm } from './praytimes.js';
import { icon, logo } from './icons.js';
import { ui, S, esc, pct, num, pname, dayLabel, humanDays, Stat, Switch, STATUS_ICON } from './ui.js';

const STATUS_ORDER = ['jamaah', 'ontime', 'late', 'missed'];

// ===========================================================================
// Onboarding
// ===========================================================================
export function Onboarding() {
  const o = ui.ob;
  const step = o.step;
  const dots = `<div class="ob-dots">${[1, 2, 3, 4]
    .map((i) => `<span class="${i === step ? 'on' : ''} ${i < step ? 'done' : ''}"></span>`)
    .join('')}</div>`;
  const top = step
    ? `<div class="ob-top"><button class="icon-btn" data-action="ob-back" aria-label="Back">${icon('chevL')}</button>${dots}<span class="ob-step">${step}/4</span></div>`
    : '';
  const bodies = [ObWelcome, ObName, ObLocation, ObMethod, ObReminders];
  const animate = o.shown !== step;
  o.shown = step;
  return `<div class="ob ob-${step}">${top}<div class="ob-body ${animate ? 'enter' : ''}">${bodies[step](o)}</div></div>`;
}

const ObWelcome = () => `
  <div class="ob-hero">
    <div class="ob-glow"></div>
    ${logo(92)}
    <h1 class="brand">Falah</h1>
    <p class="ar ob-ar">حَيَّ عَلَى الْفَلَاح</p>
    <p class="lead">Come to success. A calm companion for praying on time — every time.</p>
  </div>
  <ul class="ob-feats">
    <li><span class="feat-ic">${icon('bell')}</span><span><b>Precise prayer times</b><small>Calculated on-device for your location, with gentle reminders</small></span></li>
    <li><span class="feat-ic">${icon('chart')}</span><span><b>Daily Salah tracker</b><small>Log each prayer, build streaks, see your consistency grow</small></span></li>
    <li><span class="feat-ic">${icon('rotate')}</span><span><b>Qada planner</b><small>Make up missed prayers with a clear, steady daily plan</small></span></li>
  </ul>
  <button class="btn primary lg full" data-action="ob-next">Bismillah — let's begin</button>
  <p class="fine">Everything stays private on your device.</p>`;

const ObName = (o) => `
  <div class="ob-q">
    <span class="ob-ic">${icon('user')}</span>
    <h2>What should we call you?</h2>
    <p class="muted">Used only for your greeting. It never leaves this device.</p>
  </div>
  <input class="input lg" data-input="ob-name" value="${esc(o.name)}" placeholder="Your name (optional)" autocomplete="given-name" maxlength="30" enterkeyhint="next">
  <div class="ob-actions"><button class="btn primary lg full" data-action="ob-next">Continue</button></div>`;

const ObLocation = (o) => `
  <div class="ob-q">
    <span class="ob-ic">${icon('pin')}</span>
    <h2>Where do you pray?</h2>
    <p class="muted">Prayer times are calculated precisely for your coordinates.</p>
  </div>
  <button class="btn soft lg full" data-action="locate" data-ctx="ob">${icon('locate')} Use my current location</button>
  <div class="selected-loc">${icon('pin')}<span><b>${esc(o.loc.name)}</b><small>${esc(o.loc.country || '')}</small></span>${icon('check', 'tick')}</div>
  <div class="search">${icon('search')}<input class="input" data-input="city-search" data-ctx="ob" placeholder="Search a city" value="${esc(o.q || '')}"></div>
  <div class="city-results" id="city-results">${cityResults(o.q, 'ob')}</div>
  <div class="ob-actions sticky"><button class="btn primary lg full" data-action="ob-next">Continue</button></div>`;

const ObMethod = (o) => `
  <div class="ob-q">
    <span class="ob-ic">${icon('globe')}</span>
    <h2>Calculation method</h2>
    <p class="muted">We suggested one based on your location. You can change it any time.</p>
  </div>
  <div class="radio-list">${MethodOptions(o.method, 'ob-method', o.suggested)}</div>
  <h3 class="label">Asr calculation</h3>
  <div class="seg full">
    <button class="${o.asr === 'standard' ? 'on' : ''}" data-action="ob-asr" data-v="standard">Shafiʿi · Maliki · Hanbali</button>
    <button class="${o.asr === 'hanafi' ? 'on' : ''}" data-action="ob-asr" data-v="hanafi">Hanafi</button>
  </div>
  <div class="ob-actions sticky"><button class="btn primary lg full" data-action="ob-next">Continue</button></div>`;

const ObReminders = (o) => `
  <div class="ob-q">
    <span class="ob-ic bell-anim">${icon('bell')}</span>
    <h2>Never miss a prayer</h2>
    <p class="muted">Get a gentle alert before and when each prayer begins, plus a check-in if a prayer is about to end and you haven't logged it.</p>
  </div>
  <button class="toggle-card ${o.notify ? 'on' : ''}" data-action="ob-notify">
    <span class="feat-ic">${icon(o.notify ? 'bell' : 'bellOff')}</span>
    <span><b>Prayer reminders</b><small>${o.notify ? 'Enabled' : 'Tap to enable'}</small></span>
    <span class="switch ${o.notify ? 'on' : ''}" aria-hidden="true"><span></span></span>
  </button>
  <h3 class="label">Remind me before each prayer</h3>
  <div class="chips">${[0, 5, 10, 15, 30]
    .map((m) => `<button class="chip ${o.before === m ? 'on' : ''}" data-action="ob-before" data-v="${m}">${m ? `${m} min` : 'Off'}</button>`)
    .join('')}</div>
  <div class="ob-actions"><button class="btn primary lg full" data-action="ob-finish">${icon('sparkle')} Start my journey</button></div>`;

// ===========================================================================
// Today
// ===========================================================================
function greeting(period) {
  return { dawn: 'Good morning', morning: 'Good morning', noon: 'Good afternoon', afternoon: 'Good afternoon', dusk: 'Good evening', night: 'Peaceful night' }[period];
}

export function TodayScreen() {
  const ns = nowState();
  const k = ns.today;
  const name = S().profile.name.trim();
  const done = T.dayPerformed(k);
  const t = ns.times;
  const rows = PRAYER_IDS.map((p) => PrayerRow(k, p, ns));
  rows.splice(1, 0, `
    <li class="prow is-info">
      <span class="prow-ic">${icon('sunrise')}</span>
      <span class="prow-name"><b>Sunrise</b><small>Fajr ends</small></span>
      <span class="prow-time">${fmtTime(t.sunrise)}</span>
      <span class="prow-pad"></span>
    </li>`);

  return `
  <header class="top">
    <div>
      <p class="eyebrow">${greeting(ns.period)}</p>
      <h1 class="hello">Assalamuʿalaikum${name ? `,<br><span>${esc(name)}</span>` : ''}</h1>
    </div>
    <button class="loc-chip" data-action="open" data-sheet="location">${icon('pin')}<span>${esc(S().location.name)}</span></button>
  </header>
  ${Hero(ns)}
  ${ReviewBanner()}
  <section class="card">
    <div class="card-head">
      <h2>Today's prayers</h2>
      <span class="day-progress ${done === 5 ? 'complete' : ''}">${PRAYER_IDS.map((p) => `<i class="${PERFORMED.has(T.statusOf(k, p)) ? 'on' : ''}"></i>`).join('')}<b>${done}/5</b></span>
    </div>
    <ul class="prayer-list">${rows.join('')}</ul>
    <button class="link-btn center" data-action="open" data-sheet="timetable">${icon('table')} Monthly timetable</button>
  </section>
  ${QadaMini()}
  ${ReminderCard(k)}`;
}

function Hero(ns) {
  const n = ns.next;
  const C = 2 * Math.PI * 52;
  const frac = Math.min(1, Math.max(0, (Date.now() - ns.prevAt) / (n.at - ns.prevAt)));
  const cur = ns.current;
  let now;
  if (cur) {
    const st = T.statusOf(cur.k, cur.p);
    const label = pname(cur.p, cur.k) + (cur.k !== ns.today ? ' (last night)' : '');
    now = `<div class="now-chip ${st ? 'done' : ''}">
      <span class="pulse"></span>
      <span class="now-txt"><b>${label}</b> · ends in <span data-countdown="${+cur.end}"></span></span>
      ${
        st
          ? `<button class="now-st" data-action="log" data-k="${cur.k}" data-p="${cur.p}">${icon(STATUS_ICON[st])} ${STATUSES[st].short}</button>`
          : `<button class="now-btn" data-action="quick-log" data-k="${cur.k}" data-p="${cur.p}">${icon('check')} I prayed</button>`
      }
    </div>`;
  } else {
    now = `<div class="now-chip soft"><span class="pulse soft"></span><span class="now-txt">${
      ns.duha ? `<b>Duha</b> time · until ${fmtTime(new Date(+ns.times.dhuhr - 10 * 60000))}` : 'Sun is rising — avoid praying for a few minutes'
    }</span></div>`;
  }
  const h = hijri();
  return `
  <section class="hero sky-${ns.period}">
    <div class="hero-pattern"></div>
    ${ns.period === 'night' || ns.period === 'dusk' ? '<div class="hero-stars"></div>' : ''}
    <div class="hero-top"><span>${h.label}</span><span>${keyLabel(ns.today, { weekday: 'short', day: 'numeric', month: 'short' })}</span></div>
    <div class="hero-body">
      <div class="hero-text">
        <p class="hero-label">Next prayer${n.k !== ns.today ? ' · tomorrow' : ''}</p>
        <h2 class="hero-name">${pname(n.p, n.k)}</h2>
        <p class="hero-ar ar">${PRAYER[n.p].ar}</p>
        <p class="hero-time">${fmtTime(n.at)}</p>
      </div>
      <div class="hero-ring">
        <svg viewBox="0 0 120 120"><circle class="track" cx="60" cy="60" r="52"/><circle class="bar" cx="60" cy="60" r="52" stroke-dasharray="${C}" style="stroke-dashoffset:${C * (1 - frac)}" data-ring data-c="${C}" data-from="${+ns.prevAt}" data-to="${+n.at}"/></svg>
        <div class="ring-inner"><span class="ring-label">starts in</span><span class="ring-count" data-countdown="${+n.at}"></span></div>
      </div>
    </div>
    ${now}
  </section>`;
}

function PrayerRow(k, p, ns) {
  const t = timesFor(k);
  const st = T.statusOf(k, p);
  const due = T.isDue(k, p);
  const isNow = ns.current?.p === p && ns.current?.k === k;
  const nt = S().settings.notify;
  const bellOn = nt.enabled && nt.prayers[p];
  return `
  <li class="prow ${isNow ? 'is-now' : ''} ${due ? '' : 'is-future'} ${st ? `has-${st}` : ''}" ${due ? `data-action="log" data-k="${k}" data-p="${p}"` : ''}>
    <span class="prow-ic">${icon(p)}</span>
    <span class="prow-name"><b>${pname(p, k)}</b><small class="ar">${PRAYER[p].ar}</small></span>
    <span class="prow-time">${isNow ? '<em>Now</em>' : ''}${fmtTime(t[p])}</span>
    <button class="icon-btn bell ${bellOn ? 'on' : ''}" data-action="toggle-bell" data-p="${p}" aria-label="Reminder for ${PRAYER[p].name}">${icon(bellOn ? 'bell' : 'bellOff')}</button>
    ${StatusBtn(k, p, st, due)}
  </li>`;
}

function StatusBtn(k, p, st, due) {
  if (!due) return `<span class="sbtn is-locked" aria-label="Not yet time">${icon('lock')}</span>`;
  if (!st) return `<button class="sbtn is-empty" data-action="log" data-k="${k}" data-p="${p}" aria-label="Log ${PRAYER[p].name}">${icon('plus')}</button>`;
  return `<button class="sbtn st-${st}" data-action="log" data-k="${k}" data-p="${p}" aria-label="${STATUSES[st].label}">${icon(STATUS_ICON[st])}</button>`;
}

function ReviewBanner() {
  const list = T.unlogged(7);
  if (!list.length) return '';
  return `<button class="review-banner" data-action="open" data-sheet="review">
    <span class="rb-ic">${icon('info')}</span>
    <span><b>${list.length} past prayer${list.length > 1 ? 's' : ''} not logged</b><small>Review them to keep your record honest</small></span>
    ${icon('chevR')}
  </button>`;
}

function QadaMini() {
  const q = S().qada;
  const rem = T.qadaRemaining();
  if (!rem && !q.done) {
    return `<button class="card cta-card" data-action="go" data-route="qada">
      <span class="feat-ic">${icon('rotate')}</span>
      <span><b>Have missed prayers to make up?</b><small>Build a Qada plan and clear them step by step.</small></span>
      ${icon('chevR')}
    </button>`;
  }
  const today = T.qadaToday();
  return `<section class="card qada-mini">
    <div>
      <p class="eyebrow">Qada remaining</p>
      <p class="qm-num">${num(rem)}</p>
      <div class="bar"><span style="width:${Math.min(100, (today / Math.max(1, q.goal)) * 100)}%"></span></div>
      <small class="muted">Today ${today} of ${q.goal} · daily goal</small>
    </div>
    <button class="btn primary sm" data-action="go" data-route="qada">${icon('plus')} Log Qada</button>
  </section>`;
}

function ReminderCard(k) {
  const r = REMINDERS[((daysBetween('2024-01-01', k) % REMINDERS.length) + REMINDERS.length) % REMINDERS.length];
  return `<section class="card quote">
    <span class="quote-mark">“</span>
    <p class="quote-text">${r.text}</p>
    <p class="quote-ref">${r.ref}</p>
  </section>`;
}

// ===========================================================================
// Tracker
// ===========================================================================
function trackerRange() {
  const today = todayKey();
  if (ui.trackerView === 'week') {
    const mon = addDays(today, -((weekday(today) + 6) % 7) + ui.weekOffset * 7);
    const sun = addDays(mon, 6);
    const same = mon.slice(0, 7) === sun.slice(0, 7);
    const title = `${keyLabel(mon, same ? { day: 'numeric' } : { day: 'numeric', month: 'short' })} – ${keyLabel(sun, { day: 'numeric', month: 'short', year: 'numeric' })}`;
    return { from: mon, to: sun, title };
  }
  const { y, m } = parseKey(today);
  const first = new Date(Date.UTC(y, m - 1 + ui.monthOffset, 1));
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0));
  const from = first.toISOString().slice(0, 10);
  return { from, to: last.toISOString().slice(0, 10), title: keyLabel(from, { month: 'long', year: 'numeric' }) };
}

export function TrackerScreen() {
  const today = todayKey();
  const { from, to, title } = trackerRange();
  const st = T.rangeStats(from, to > today ? today : to);
  const streak = T.currentStreak();
  const best = T.bestStreak();
  const offset = ui.trackerView === 'week' ? ui.weekOffset : ui.monthOffset;
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

  return `
  <header class="page-head"><div><p class="eyebrow">Your journey</p><h1>Tracker</h1></div></header>
  <section class="streak-card">
    <div class="streak-main">
      <span class="streak-flame ${streak ? 'lit' : ''}">${icon('flame')}</span>
      <div>
        <p class="streak-num">${streak}<span> day${streak === 1 ? '' : 's'}</span></p>
        <p class="streak-sub">Current streak · Best ${best}</p>
      </div>
    </div>
    <div class="streak-week">${last7
      .map((k) => {
        const n = T.dayPerformed(k);
        return `<span class="sw-day ${k === today ? 'today' : ''}"><i class="${n === 5 ? 'full' : n ? 'part' : ''}" style="--f:${n / 5}"></i><small>${keyLabel(k, { weekday: 'narrow' })}</small></span>`;
      })
      .join('')}</div>
    <p class="streak-note">${streak ? 'A streak counts days with all five prayers performed. Keep it alive!' : 'Pray all five today to start a new streak, in shaa Allah.'}</p>
  </section>

  <div class="seg full">
    <button class="${ui.trackerView === 'week' ? 'on' : ''}" data-action="tracker-view" data-v="week">Week</button>
    <button class="${ui.trackerView === 'month' ? 'on' : ''}" data-action="tracker-view" data-v="month">Month</button>
  </div>
  <div class="range-nav">
    <button class="icon-btn" data-action="tracker-nav" data-d="-1" aria-label="Previous">${icon('chevL')}</button>
    <b>${title}</b>
    <button class="icon-btn" data-action="tracker-nav" data-d="1" aria-label="Next" ${offset >= 0 ? 'disabled' : ''}>${icon('chevR')}</button>
  </div>

  <div class="stat-grid">
    ${Stat('Completion', pct(st.completion), `${st.performed} of ${st.due} prayed`, 'check', 'tone-ok')}
    ${Stat('On time', pct(st.onTimeRate), `${st.onTime} prayers`, 'clock', 'tone-primary')}
    ${Stat('In congregation', st.jamaah, 'jamaah prayers', 'users', 'tone-jamaah')}
    ${Stat('Missed', st.missed, st.unlogged ? `${st.unlogged} not logged` : 'this period', 'xCircle', 'tone-danger')}
  </div>

  ${ui.trackerView === 'week' ? WeekGrid(from) : MonthCal(from, to)}
  ${Legend()}
  ${Breakdown()}
  ${Insight()}
  ${Achievements()}`;
}

function Legend() {
  return `<div class="legend">${STATUS_ORDER.map((s) => `<span><i class="lg-dot st-${s}"></i>${STATUSES[s].short}</span>`).join('')}<span><i class="lg-dot st-none"></i>Not logged</span></div>`;
}

function WeekGrid(mon) {
  const today = todayKey();
  const days = Array.from({ length: 7 }, (_, i) => addDays(mon, i));
  const head = days
    .map((k) => `<span class="wg-day ${k === today ? 'is-today' : ''}"><small>${keyLabel(k, { weekday: 'short' }).slice(0, 2)}</small><b>${parseKey(k).d}</b></span>`)
    .join('');
  const rows = PRAYER_IDS.map((p) => {
    const cells = days
      .map((k) => {
        if (!T.isDue(k, p)) return '<span class="cell is-off"></span>';
        const st = T.statusOf(k, p);
        return `<button class="cell st-${st || 'none'}" data-action="log" data-k="${k}" data-p="${p}" aria-label="${PRAYER[p].name} ${k}: ${st ? STATUSES[st].label : 'not logged'}">${st ? icon(STATUS_ICON[st]) : ''}</button>`;
      })
      .join('');
    return `<div class="wg-row"><span class="wg-label">${icon(p)}<b>${PRAYER[p].name}</b></span>${cells}</div>`;
  }).join('');
  return `<section class="card week-grid"><div class="wg-row wg-head"><span></span>${head}</div>${rows}</section>`;
}

function MonthCal(from, to) {
  const today = todayKey();
  const lead = (weekday(from) + 6) % 7;
  const n = daysBetween(from, to) + 1;
  const C = 2 * Math.PI * 15;
  let cells = '<span></span>'.repeat(lead);
  for (let i = 0; i < n; i++) {
    const k = addDays(from, i);
    const future = k > today;
    const done = future ? 0 : T.dayPerformed(k);
    const onTime = PRAYER_IDS.filter((p) => ['jamaah', 'ontime'].includes(T.statusOf(k, p))).length;
    const missed = PRAYER_IDS.filter((p) => T.statusOf(k, p) === 'missed').length;
    cells += `<button class="mc-day ${k === today ? 'is-today' : ''} ${done === 5 ? 'full' : ''} ${missed ? 'has-missed' : ''}" ${future ? 'disabled' : `data-action="open" data-sheet="day" data-k="${k}"`} aria-label="${k}: ${done} of 5 prayed">
      <svg viewBox="0 0 36 36"><circle class="t" cx="18" cy="18" r="15"/><circle class="b ${onTime === 5 ? 'gold' : ''}" cx="18" cy="18" r="15" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - done / 5)}"/></svg>
      <span>${i + 1}</span>
    </button>`;
  }
  return `<section class="card month-cal">
    <div class="mc-head">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => `<span>${d}</span>`).join('')}</div>
    <div class="mc-grid">${cells}</div>
    <p class="muted small center">Tap a day to review or edit its prayers. A gold ring means all five on time.</p>
  </section>`;
}

function Breakdown() {
  const today = todayKey();
  const st = T.rangeStats(addDays(today, -29), today);
  return `<section class="card">
    <div class="card-head"><h2>Last 30 days</h2><span class="muted small">by prayer</span></div>
    ${PRAYER_IDS.map((p) => {
      const x = st.per[p];
      const perf = x.due ? x.performed / x.due : 0;
      const on = x.due ? x.onTime / x.due : 0;
      return `<div class="pb-row">
        <span class="pb-name">${icon(p)}${PRAYER[p].name}</span>
        <div class="pb-bar"><span class="perf" style="width:${perf * 100}%"></span><span class="on" style="width:${on * 100}%"></span></div>
        <span class="pb-val">${pct(perf)}</span>
      </div>`;
    }).join('')}
    <div class="legend compact"><span><i class="lg-dot st-ontime"></i>On time</span><span><i class="lg-dot st-late"></i>Performed (incl. late)</span></div>
  </section>`;
}

const TIPS = {
  fajr: 'Sleep a little earlier and set a 15-minute pre-reminder so you wake with time for wudu.',
  dhuhr: 'Block 15 minutes in your work calendar at Dhuhr time so meetings don’t swallow it.',
  asr: 'Asr is easy to delay — the check-in reminder catches it before Maghrib.',
  maghrib: 'Maghrib’s window is short. Pray soon after the adhan, before dinner.',
  isha: 'Pray Isha soon after it begins, before you wind down for the night.',
};

function Insight() {
  const today = todayKey();
  const st = T.rangeStats(addDays(today, -13), today);
  let html;
  if (st.due < 10 || st.performed + st.missed < 5) {
    html = '<b>Insights are on the way</b><p>Keep logging your prayers for a few days and personalised insights will appear here.</p>';
  } else {
    const ranked = PRAYER_IDS.filter((p) => st.per[p].due >= 3)
      .map((p) => ({ p, r: st.per[p].onTime / st.per[p].due }))
      .sort((a, b) => a.r - b.r);
    const weak = ranked[0];
    if (!weak || weak.r >= 0.95) {
      html = '<b>MashaAllah, remarkably consistent</b><p>You’ve prayed nearly every prayer on time over the last two weeks. Next step: pray more of them in congregation.</p>';
    } else {
      html = `<b>${PRAYER[weak.p].name} needs the most care</b><p>On time ${pct(weak.r)} over the last 14 days. ${TIPS[weak.p]}</p>`;
    }
  }
  return `<section class="card insight"><span class="feat-ic">${icon('sparkle')}</span><div>${html}</div></section>`;
}

function Achievements() {
  const list = T.achievements();
  const got = list.filter((a) => a.got).length;
  return `<section class="card">
    <div class="card-head"><h2>Achievements</h2><span class="muted small">${got}/${list.length} earned</span></div>
    <div class="badges">${list
      .map((a) => `<div class="badge ${a.got ? 'got' : ''}" title="${esc(a.desc)}">
        <span class="badge-ic" style="--p:${a.got ? 1 : a.progress || 0}">${icon(a.icon)}</span>
        <b>${a.title}</b><small>${a.desc}</small>
      </div>`)
      .join('')}</div>
  </section>`;
}

// ===========================================================================
// Qada
// ===========================================================================
export function QadaScreen() {
  const q = S().qada;
  const rem = T.qadaRemaining();
  const total = rem + q.done;
  const frac = total ? q.done / total : 0;
  const today = T.qadaToday();
  const proj = T.qadaProjection();
  const C = 2 * Math.PI * 70;
  const hist = T.qadaHistory(14);
  const max = Math.max(q.goal, ...hist.map((h) => h.n));
  const sum14 = hist.reduce((a, h) => a + h.n, 0);
  const any = PRAYER_IDS.some((p) => q.counts[p] > 0);

  return `
  <header class="page-head">
    <div><p class="eyebrow">Make up missed prayers</p><h1>Qada</h1></div>
    <button class="icon-btn" data-action="open" data-sheet="qada-help" aria-label="About Qada">${icon('info')}</button>
  </header>

  <section class="qada-hero">
    <div class="qh-ring">
      <svg viewBox="0 0 160 160"><circle class="track" cx="80" cy="80" r="70"/><circle class="bar" cx="80" cy="80" r="70" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - frac)}"/></svg>
      <div class="qh-center"><b>${num(rem)}</b><small>remaining</small></div>
    </div>
    <div class="qh-meta">
      <div><b>${num(q.done)}</b><small>completed</small></div>
      <div><b>${pct(frac)}</b><small>progress</small></div>
      <div><b>${rem ? keyLabel(proj.finish, { month: 'short', year: 'numeric' }) : '—'}</b><small>est. finish</small></div>
    </div>
  </section>

  ${
    !rem && !q.done
      ? `<section class="card empty-card">
          <span class="feat-ic">${icon('calendar')}</span>
          <h3>Start your Qada plan</h3>
          <p>Estimate the prayers you missed in the past — for example, the years before you started praying regularly. Then clear them a few at a time.</p>
          <button class="btn primary full" data-action="open" data-sheet="estimate">${icon('calendar')} Estimate missed prayers</button>
        </section>`
      : ''
  }

  <section class="card goal-card">
    <div class="goal-top">
      <div><p class="eyebrow">Today</p><p class="goal-num">${today}<span> / ${q.goal}</span></p></div>
      <div class="stepper" aria-label="Daily goal">
        <button data-action="goal" data-d="-1" aria-label="Decrease goal">${icon('minus')}</button>
        <span><b>${q.goal}</b><small>per day</small></span>
        <button data-action="goal" data-d="1" aria-label="Increase goal">${icon('plus')}</button>
      </div>
    </div>
    <div class="bar lg ${today >= q.goal ? 'done' : ''}"><span style="width:${Math.min(100, (today / q.goal) * 100)}%"></span></div>
    <p class="muted small">${
      rem
        ? `At ${q.goal} a day you'll be done in about <b>${humanDays(proj.days)}</b>. One extra prayer with each fard prayer adds up fast.`
        : q.done
          ? 'Alhamdulillah — your Qada list is clear.'
          : 'Set a daily goal you can keep. Small and steady beats big and rare.'
    }</p>
  </section>

  <section class="card">
    <div class="card-head"><h2>By prayer</h2><button class="link-btn" data-action="open" data-sheet="estimate">${icon('calendar')} Estimate</button></div>
    <ul class="qada-list">${PRAYER_IDS.map((p) => `
      <li class="qrow">
        <span class="prow-ic">${icon(p)}</span>
        <button class="qrow-name" data-action="open" data-sheet="qada-set" data-p="${p}">
          <b>${PRAYER[p].name}</b><small>${num(q.counts[p])} left ${icon('edit')}</small>
        </button>
        <button class="round-btn" data-action="qada-add" data-p="${p}" aria-label="Add a missed ${PRAYER[p].name}">${icon('plus')}</button>
        <button class="pray-btn" data-action="qada-pray" data-p="${p}" ${q.counts[p] ? '' : 'disabled'}>${icon('check')}Prayed</button>
      </li>`).join('')}
    </ul>
    <button class="btn primary full" data-action="qada-day" ${any ? '' : 'disabled'}>${icon('sparkle')} I prayed one full day (all 5)</button>
  </section>

  <section class="card">
    <div class="card-head"><h2>Last 14 days</h2><span class="muted small">${sum14} prayed</span></div>
    <div class="bars">${hist
      .map((h) => `<div class="bar-col ${h.k === todayKey() ? 'today' : ''} ${h.n >= q.goal ? 'hit' : ''}">
        <span class="bar-val">${h.n || ''}</span>
        <span class="bar-fill" style="height:${max ? (h.n / max) * 100 : 0}%"></span>
        <small>${keyLabel(h.k, { weekday: 'narrow' })}</small>
      </div>`)
      .join('')}</div>
  </section>

  <section class="card tip">
    <span class="feat-ic">${icon('book')}</span>
    <div><b>Praying Qada</b><p>Pray each one like the regular fard prayer, with the intention of the specific prayer you missed (e.g. “the earliest Fajr I owe”). Avoid the disliked times around sunrise, zenith and sunset. For personal circumstances, consult a trusted scholar.</p></div>
  </section>`;
}

// ===========================================================================
// Qibla
// ===========================================================================
export function QiblaScreen() {
  const l = S().location;
  const b = qiblaBearing(l.lat, l.lng);
  const dist = distanceKm(l.lat, l.lng);
  const c = ui.compass;
  const ticks = Array.from({ length: 72 }, (_, i) => `<i style="--a:${i * 5}deg" class="${i % 18 === 0 ? 'major' : i % 2 === 0 ? 'mid' : ''}"></i>`).join('');
  return `
  <header class="page-head"><div><p class="eyebrow">Direction of the Kaaba</p><h1>Qibla</h1></div></header>
  <section class="qibla ${c.aligned ? 'aligned' : ''}" id="qibla">
    <div class="compass">
      <div class="dial" id="dial" style="transform:rotate(${-c.angle}deg)">
        ${ticks}
        <span class="card-pt n">N</span><span class="card-pt e">E</span><span class="card-pt s">S</span><span class="card-pt w">W</span>
        <div class="qibla-arm" style="--b:${b}deg"><span class="kaaba-pin">${icon('kaaba')}</span></div>
      </div>
      <div class="phone-needle"></div>
      <div class="compass-hub"></div>
    </div>
    <p class="qibla-deg"><b>${Math.round(b)}°</b> from true North</p>
    <p class="qibla-hint" id="qibla-hint">${
      c.on
        ? c.heading == null ? 'Waiting for the compass sensor…' : ''
        : 'Point the top of your phone North, then turn toward the Kaaba marker — or enable the live compass.'
    }</p>
    ${c.on ? '' : `<button class="btn primary" data-action="compass-start">${icon('compass')} Enable live compass</button>`}
  </section>
  <div class="stat-grid">
    ${Stat('Distance to Makkah', `${num(Math.round(dist))} km`, 'great-circle', 'kaaba', 'tone-gold')}
    ${Stat('Your location', esc(l.name), `${l.lat.toFixed(3)}°, ${l.lng.toFixed(3)}°`, 'pin', 'tone-primary compact')}
  </div>
  <section class="card tip">
    <span class="feat-ic">${icon('info')}</span>
    <div><b>For best accuracy</b><p>Hold your phone flat and away from metal or magnets. If the reading looks wrong, move the phone in a figure-8 to calibrate the compass.</p></div>
  </section>`;
}

// ===========================================================================
// Settings
// ===========================================================================
const Row = (ic, title, value, attrs = '', extra = '') =>
  `<button class="row" ${attrs}><span class="row-ic">${icon(ic)}</span><span class="row-txt"><b>${title}</b>${value ? `<small>${value}</small>` : ''}</span>${extra || icon('chevR', 'row-chev')}</button>`;
const RowStatic = (ic, title, value, control) =>
  `<div class="row"><span class="row-ic">${icon(ic)}</span><span class="row-txt"><b>${title}</b>${value ? `<small>${value}</small>` : ''}</span>${control}</div>`;

export function SettingsScreen() {
  const s = S().settings;
  const n = s.notify;
  const perm = N.permission();
  const permText = {
    granted: 'System notifications allowed',
    denied: 'Blocked by your browser — in-app alerts only',
    default: 'Tap the switch to allow notifications',
    unsupported: 'In-app alerts (system notifications unavailable)',
  }[perm];
  const M = METHODS[s.method] || METHODS.MWL;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const opt = (v, label, cur) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${label}</option>`;

  return `
  <header class="page-head"><div><p class="eyebrow">Make it yours</p><h1>Settings</h1></div></header>

  <h3 class="group-label">Profile</h3>
  <section class="card list">
    ${Row('user', 'Name', esc(S().profile.name) || 'Not set', 'data-action="open" data-sheet="name"')}
  </section>

  <h3 class="group-label">Prayer times</h3>
  <section class="card list">
    ${Row('pin', 'Location', `${esc(S().location.name)}${S().location.country ? ', ' + esc(S().location.country) : ''}`, 'data-action="open" data-sheet="location"')}
    ${Row('globe', 'Calculation method', `${M.name} · Fajr ${M.fajr}° · Isha ${M.ishaMin ? M.ishaMin + ' min' : M.isha + '°'}`, 'data-action="open" data-sheet="method"')}
    ${RowStatic('asr', 'Asr method', '', `<div class="seg sm">
      <button class="${s.asr === 'standard' ? 'on' : ''}" data-action="set" data-path="settings.asr" data-value="standard">Standard</button>
      <button class="${s.asr === 'hanafi' ? 'on' : ''}" data-action="set" data-path="settings.asr" data-value="hanafi">Hanafi</button></div>`)}
    ${RowStatic('moon', 'High latitude', 'Twilight fallback rule', `<select class="select" data-change="set" data-path="settings.highLat">
      ${opt('AngleBased', 'Angle-based', s.highLat)}${opt('NightMiddle', 'Middle of night', s.highLat)}${opt('OneSeventh', 'One-seventh', s.highLat)}${opt('None', 'None', s.highLat)}</select>`)}
    ${Row('edit', 'Manual adjustments', Object.values(s.adjust).some(Number) ? 'Custom minutes applied' : 'Fine-tune each time by minutes', 'data-action="open" data-sheet="adjust"')}
    ${RowStatic('clock', 'Time format', '', `<div class="seg sm">
      <button class="${s.timeFormat === '12' ? 'on' : ''}" data-action="set" data-path="settings.timeFormat" data-value="12">12h</button>
      <button class="${s.timeFormat === '24' ? 'on' : ''}" data-action="set" data-path="settings.timeFormat" data-value="24">24h</button></div>`)}
    ${RowStatic('calendar', 'Hijri date', hijri().label, `<div class="stepper sm">
      <button data-action="hijri-adj" data-d="-1" aria-label="Minus one day">${icon('minus')}</button><span><b>${s.hijriAdjust > 0 ? '+' : ''}${s.hijriAdjust}</b></span>
      <button data-action="hijri-adj" data-d="1" aria-label="Plus one day">${icon('plus')}</button></div>`)}
  </section>

  <h3 class="group-label">Reminders</h3>
  <section class="card list">
    ${RowStatic('bell', 'Prayer reminders', permText, Switch(n.enabled, 'data-action="notif-toggle"'))}
    <div class="row col ${n.enabled ? '' : 'dim'}">
      <span class="row-txt"><b>Remind me for</b></span>
      <div class="chips">${PRAYER_IDS.map((p) => `<button class="chip ${n.prayers[p] ? 'on' : ''}" data-action="toggle" data-path="settings.notify.prayers.${p}">${PRAYER[p].name}</button>`).join('')}</div>
    </div>
    ${RowStatic('clock', 'Before prayer', 'Heads-up to prepare and make wudu', `<select class="select" data-change="set" data-num="1" data-path="settings.notify.before">
      ${[0, 5, 10, 15, 20, 30].map((m) => opt(m, m ? `${m} min` : 'Off', n.before)).join('')}</select>`)}
    ${RowStatic('target', 'Accountability check-in', 'Nudge if a prayer is ending and not logged', Switch(n.nudge, 'data-action="toggle" data-path="settings.notify.nudge"'))}
    ${n.nudge ? RowStatic('info', 'Check-in timing', 'Before the prayer time ends', `<select class="select" data-change="set" data-num="1" data-path="settings.notify.nudgeMins">
      ${[15, 20, 30, 45, 60].map((m) => opt(m, `${m} min`, n.nudgeMins)).join('')}</select>`) : ''}
    ${RowStatic('volume', 'Chime sound', 'Soft bell when a reminder fires', Switch(n.sound, 'data-action="toggle" data-path="settings.notify.sound"'))}
    ${Row('sparkle', 'Send a test reminder', '', 'data-action="test-notif"')}
  </section>
  <p class="note">${icon('info')} Reminders fire while Falah is open or running in the background. ${
    standalone ? '' : isIOS ? 'On iPhone, tap Share → “Add to Home Screen” first for notifications.' : 'Install Falah to your home screen for the best experience.'
  }</p>

  <h3 class="group-label">Tracking</h3>
  <section class="card list">
    ${RowStatic('rotate', 'Missed prayers go to Qada', 'Marking a prayer “Missed” adds it to your Qada list', Switch(s.autoQada, 'data-action="toggle" data-path="settings.autoQada"'))}
    ${RowStatic('calendar', 'Tracking since', S().startedOn ? keyLabel(S().startedOn, { day: 'numeric', month: 'long', year: 'numeric' }) : '—', '')}
  </section>

  <h3 class="group-label">Appearance</h3>
  <section class="card list">
    ${RowStatic('sun', 'Theme', '', `<div class="seg sm">
      ${['system', 'light', 'dark'].map((t) => `<button class="${s.theme === t ? 'on' : ''}" data-action="set" data-path="settings.theme" data-value="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div>`)}
  </section>

  <h3 class="group-label">Your data</h3>
  <section class="card list">
    ${ui.installPrompt ? Row('download', 'Install Falah', 'Add to your home screen', 'data-action="install"') : ''}
    ${Row('download', 'Export backup', 'Save your logs & Qada as a file', 'data-action="export"')}
    ${Row('upload', 'Import backup', 'Restore from a backup file', 'data-action="import"')}
    ${Row('trash', 'Reset all data', 'Start over from scratch', 'data-action="open" data-sheet="reset"', '')}
  </section>
  <input type="file" id="import-file" accept="application/json,.json" hidden>

  <footer class="about">
    ${logo(36)}
    <p><b>Falah</b> · version 1.0</p>
    <p class="muted small">Prayer times are calculated astronomically on your device. Always follow your local mosque or authority where they differ.</p>
  </footer>`;
}

// ===========================================================================
// Shared pieces
// ===========================================================================
export function cityResults(q = '', ctx = 'settings') {
  const term = q.trim().toLowerCase();
  const list = (term
    ? CITIES.filter((c) => c.name.toLowerCase().includes(term) || c.country.toLowerCase().includes(term))
    : CITIES.slice(0, 8)
  ).slice(0, 12);
  if (!list.length) return '<p class="muted small center pad">No matching city. Try your nearest major city or use your current location.</p>';
  return list
    .map((c) => `<button class="city" data-action="pick-city" data-i="${CITIES.indexOf(c)}" data-ctx="${ctx}">${icon('pin')}<span><b>${c.name}</b><small>${c.country}</small></span></button>`)
    .join('');
}

function MethodOptions(cur, action, suggested) {
  return Object.entries(METHODS)
    .map(([id, m]) => `<button class="radio ${cur === id ? 'on' : ''}" data-action="${action}" data-m="${id}">
      <span class="radio-dot"></span>
      <span class="radio-txt"><b>${m.name}${id === suggested ? '<em>Suggested</em>' : ''}</b><small>${m.full !== m.name ? `${m.full} · ` : ''}Fajr ${m.fajr}°, Isha ${m.ishaMin ? m.ishaMin + ' min' : m.isha + '°'}</small></span>
    </button>`)
    .join('');
}

// ===========================================================================
// Bottom sheets
// ===========================================================================
const Head = (ic, title, sub) =>
  `<div class="sheet-head"><span class="sheet-ic">${icon(ic)}</span><div><h3>${title}</h3>${sub ? `<p class="muted small">${sub}</p>` : ''}</div><button class="icon-btn close" data-action="close-sheet" aria-label="Close">${icon('x')}</button></div>`;

export const SHEETS = {
  log: {
    live: true,
    render({ k, p }) {
      const st = T.statusOf(k, p);
      const w = windowOf(k, p);
      const auto = S().settings.autoQada;
      return `${Head(p, `${pname(p, k)} <span class="ar">${PRAYER[p].ar}</span>`, `${dayLabel(k, true)} · ${fmtTime(w.start)} – ${fmtTime(w.end)} · ${PRAYER[p].rakat} rakaʿat`)}
      <div class="choices">${STATUS_ORDER.map((s) => `
        <button class="choice st-${s} ${st === s ? 'sel' : ''}" data-action="set-status" data-k="${k}" data-p="${p}" data-s="${s}">
          <span class="choice-ic">${icon(STATUS_ICON[s])}</span>
          <span class="choice-txt"><b>${STATUSES[s].label}</b><small>${s === 'missed' && !auto ? 'Not prayed' : STATUSES[s].hint}</small></span>
          ${st === s ? icon('check', 'tick') : ''}
        </button>`).join('')}
      </div>
      ${st ? `<button class="btn ghost full" data-action="set-status" data-k="${k}" data-p="${p}" data-s="">Clear this log</button>` : ''}`;
    },
  },

  day: {
    live: true,
    render({ k }) {
      const t = timesFor(k);
      return `${Head('calendar', dayLabel(k, true), `${T.dayPerformed(k)} of 5 prayers performed · tap again to clear`)}
      <div class="day-rows">${PRAYER_IDS.map((p) => {
        const st = T.statusOf(k, p);
        const due = T.isDue(k, p);
        return `<div class="day-row ${due ? '' : 'dim'}">
          <span class="prow-ic">${icon(p)}</span>
          <span class="prow-name"><b>${pname(p, k)}</b><small>${fmtTime(t[p])}</small></span>
          <div class="mini-seg">${STATUS_ORDER.map((s) => `<button class="mini st-${s} ${st === s ? 'sel' : ''}" ${due ? `data-action="set-status" data-k="${k}" data-p="${p}" data-s="${s}" data-stay="1" data-toggle="1"` : 'disabled'} aria-label="${STATUSES[s].label}" title="${STATUSES[s].label}">${icon(STATUS_ICON[s])}</button>`).join('')}</div>
        </div>`;
      }).join('')}</div>
      ${Legend()}`;
    },
  },

  review: {
    live: true,
    render() {
      const list = T.unlogged(7);
      if (!list.length) {
        return `<div class="empty">${icon('check', 'big-check')}<h3>All caught up</h3><p class="muted">Every past prayer is logged. Barakallahu feek!</p><button class="btn primary full" data-action="close-sheet">Done</button></div>`;
      }
      const byDay = {};
      list.forEach((x) => (byDay[x.k] ||= []).push(x.p));
      return `${Head('info', 'Unlogged prayers', 'Be honest with yourself — that’s how growth happens.')}
      ${Object.entries(byDay).map(([k, ps]) => `
        <h4 class="group-label">${dayLabel(k, true)}</h4>
        ${ps.map((p) => `<div class="day-row">
          <span class="prow-ic">${icon(p)}</span>
          <span class="prow-name"><b>${pname(p, k)}</b><small>${fmtTime(timesFor(k)[p])}</small></span>
          <div class="mini-seg">${STATUS_ORDER.map((s) => `<button class="mini st-${s}" data-action="set-status" data-k="${k}" data-p="${p}" data-s="${s}" data-stay="1" aria-label="${STATUSES[s].label}" title="${STATUSES[s].label}">${icon(STATUS_ICON[s])}</button>`).join('')}</div>
        </div>`).join('')}`).join('')}
      ${Legend()}
      <button class="btn soft full" data-action="review-all">${icon('check')} Mark all as prayed on time</button>`;
    },
  },

  location: {
    render() {
      const l = S().location;
      return `${Head('pin', 'Location', 'Used to calculate prayer times and Qibla')}
      <div class="selected-loc">${icon('pin')}<span><b>${esc(l.name)}</b><small>${esc(l.country || '')} · ${l.lat.toFixed(3)}°, ${l.lng.toFixed(3)}°</small></span>${icon('check', 'tick')}</div>
      <button class="btn soft full" data-action="locate" data-ctx="settings">${icon('locate')} Use my current location</button>
      <div class="search">${icon('search')}<input class="input" data-input="city-search" data-ctx="settings" placeholder="Search a city"></div>
      <div class="city-results" id="city-results">${cityResults('', 'settings')}</div>
      <details class="manual">
        <summary>Enter coordinates manually</summary>
        <div class="form-grid">
          <label>Name<input class="input" id="m-name" placeholder="e.g. Home" value=""></label>
          <label>Latitude<input class="input" id="m-lat" inputmode="decimal" placeholder="3.139"></label>
          <label>Longitude<input class="input" id="m-lng" inputmode="decimal" placeholder="101.687"></label>
        </div>
        <button class="btn primary full" data-action="manual-loc">Save location</button>
      </details>`;
    },
  },

  method: {
    live: true,
    render() {
      return `${Head('globe', 'Calculation method', 'Choose the authority followed in your area')}
      <div class="radio-list">${MethodOptions(S().settings.method, 'pick-method', null)}</div>
      <p class="muted small">Southeast Asian methods include the customary 2-minute <i>ihtiyati</i> (precaution).</p>`;
    },
  },

  adjust: {
    live: true,
    render() {
      const t = timesFor(todayKey());
      const a = S().settings.adjust;
      const names = { fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
      return `${Head('edit', 'Manual adjustments', 'Match your local mosque by nudging each time')}
      <div class="adj-list">${Object.keys(names).map((p) => `
        <div class="adj-row">
          <span class="prow-ic">${icon(p)}</span>
          <span class="prow-name"><b>${names[p]}</b><small>${fmtTime(t[p])}</small></span>
          <div class="stepper sm">
            <button data-action="adjust" data-p="${p}" data-d="-1" aria-label="Earlier">${icon('minus')}</button>
            <span><b>${a[p] > 0 ? '+' : ''}${a[p]}</b><small>min</small></span>
            <button data-action="adjust" data-p="${p}" data-d="1" aria-label="Later">${icon('plus')}</button>
          </div>
        </div>`).join('')}</div>
      <button class="btn ghost full" data-action="adjust-reset">Reset all to 0</button>`;
    },
  },

  timetable: {
    live: true,
    render({ off = 0 }) {
      const today = todayKey();
      const { y, m } = parseKey(today);
      const first = new Date(Date.UTC(y, m - 1 + Number(off), 1));
      const from = first.toISOString().slice(0, 10);
      const n = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
      const rows = Array.from({ length: n }, (_, i) => {
        const k = addDays(from, i);
        const t = timesFor(k);
        const fri = weekday(k) === 5;
        return `<tr class="${k === today ? 'today' : ''} ${fri ? 'fri' : ''}" ${k === today ? 'id="tt-today"' : ''}>
          <td><b>${i + 1}</b><small>${keyLabel(k, { weekday: 'short' })}</small></td>
          ${['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map((p) => `<td>${fmtTime(t[p], false)}</td>`).join('')}
        </tr>`;
      }).join('');
      return `${Head('table', 'Prayer timetable', `${esc(S().location.name)} · ${(METHODS[S().settings.method] || METHODS.MWL).name}`)}
      <div class="range-nav">
        <button class="icon-btn" data-action="timetable-nav" data-d="-1" aria-label="Previous month">${icon('chevL')}</button>
        <b>${keyLabel(from, { month: 'long', year: 'numeric' })}</b>
        <button class="icon-btn" data-action="timetable-nav" data-d="1" aria-label="Next month">${icon('chevR')}</button>
      </div>
      <div class="tt-wrap"><table class="tt">
        <thead><tr><th>Day</th><th>Fajr</th><th>Rise</th><th>Dhuhr</th><th>Asr</th><th>Maghrib</th><th>Isha</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>`;
    },
  },

  name: {
    render() {
      return `${Head('user', 'Your name', 'Shown in your daily greeting')}
      <input class="input lg" id="name-input" value="${esc(S().profile.name)}" placeholder="Your name" maxlength="30">
      <button class="btn primary full" data-action="name-save">Save</button>`;
    },
  },

  'qada-set': {
    render({ p }) {
      return `${Head(p, `${PRAYER[p].name} Qada`, 'Set exactly how many you still owe')}
      <div class="big-stepper">
        <button data-action="qs-step" data-d="-10">−10</button>
        <button data-action="qs-step" data-d="-1">${icon('minus')}</button>
        <input class="input xl" id="qs-input" type="number" inputmode="numeric" min="0" value="${S().qada.counts[p]}">
        <button data-action="qs-step" data-d="1">${icon('plus')}</button>
        <button data-action="qs-step" data-d="10">+10</button>
      </div>
      <button class="btn primary full" data-action="qada-set-save" data-p="${p}">Save</button>`;
    },
  },

  estimate: {
    render() {
      return `${Head('calendar', 'Estimate missed prayers', 'A sincere estimate is enough — Allah knows best')}
      <div class="seg full" id="est-mode">
        <button class="on" data-action="est-mode" data-v="period">By duration</button>
        <button data-action="est-mode" data-v="dates">By dates</button>
      </div>
      <div class="est-pane" data-pane="period">
        <div class="form-grid three">
          <label>Years<input class="input" data-input="est" id="e-y" type="number" min="0" inputmode="numeric" placeholder="0"></label>
          <label>Months<input class="input" data-input="est" id="e-m" type="number" min="0" inputmode="numeric" placeholder="0"></label>
          <label>Days<input class="input" data-input="est" id="e-d" type="number" min="0" inputmode="numeric" placeholder="0"></label>
        </div>
      </div>
      <div class="est-pane" data-pane="dates" hidden>
        <div class="form-grid">
          <label>From<input class="input" data-input="est" id="e-from" type="date"></label>
          <label>To<input class="input" data-input="est" id="e-to" type="date" max="${todayKey()}"></label>
        </div>
      </div>
      <label class="stack">Days to exclude per month <small>(e.g. menstruation, when prayer isn't required)</small>
        <input class="input" data-input="est" id="e-ex" type="number" min="0" max="15" inputmode="numeric" placeholder="0">
      </label>
      <h4 class="label">Include</h4>
      <div class="chips" id="e-prayers">${PRAYER_IDS.map((p) => `<button class="chip on" data-action="est-prayer" data-p="${p}">${PRAYER[p].name}</button>`).join('')}</div>
      <div class="est-preview" id="est-preview"><b>0</b><span>prayers to add</span></div>
      <button class="btn primary full" data-action="estimate-apply">${icon('plus')} Add to my Qada list</button>`;
    },
  },

  'qada-help': {
    render() {
      return `${Head('info', 'About Qada', '')}
      <div class="prose">
        <p><b>Qada</b> means making up obligatory prayers that were missed. Many scholars hold it should be done as soon as reasonably possible — steadily, without despair.</p>
        <p><b>How Falah helps</b></p>
        <ul>
          <li>Estimate past missed prayers by duration or dates.</li>
          <li>When you mark a daily prayer “Missed”, it's added automatically (you can turn this off in Settings).</li>
          <li>Tap <b>Prayed</b> each time you complete one. Set a daily goal and watch the projected finish date come closer.</li>
        </ul>
        <p class="muted small">A common practice is to pray one Qada with each daily prayer — that clears one full day every day.</p>
      </div>
      <button class="btn primary full" data-action="close-sheet">Got it</button>`;
    },
  },

  reset: {
    render() {
      return `${Head('trash', 'Reset all data?', '')}
      <p class="muted">This permanently deletes your prayer logs, Qada list and settings on this device. Consider exporting a backup first.</p>
      <button class="btn soft full" data-action="export">${icon('download')} Export backup first</button>
      <button class="btn danger full" data-action="reset-confirm">Delete everything</button>`;
    },
  },
};

/** Estimate sheet maths, shared by preview and apply. */
export function estimateCount() {
  const v = (id) => Math.max(0, Number(document.getElementById(id)?.value) || 0);
  const mode = document.querySelector('#est-mode .on')?.dataset.v || 'period';
  let days = 0;
  if (mode === 'period') days = v('e-y') * 365.25 + v('e-m') * 30.44 + v('e-d');
  else {
    const a = document.getElementById('e-from')?.value;
    const b = document.getElementById('e-to')?.value;
    if (a && b && b >= a) days = daysBetween(a, b) + 1;
  }
  const ex = Math.min(15, v('e-ex'));
  days = Math.max(0, Math.round(days - (days / 30.44) * ex));
  const prayers = [...document.querySelectorAll('#e-prayers .chip.on')].map((c) => c.dataset.p);
  return { days, prayers, total: days * prayers.length };
}
