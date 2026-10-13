# Falah — Salah Companion

*Hayya ʿala al-Falah — come to success.*

Falah is a mobile-first Islamic app that helps Muslims pray on time, every time, and take
responsibility for prayers they have missed. It is an installable **Progressive Web App (PWA)**:
it runs on Android and iPhone from the home screen, works offline, and needs no app store.

## Features

| Area | What it does |
| --- | --- |
| **Prayer times** | Calculated on-device (astronomical algorithm) for any coordinates. 15 methods incl. **JAKIM**, MUIS, Kemenag, MWL, ISNA, Umm al-Qura, Diyanet. Shafiʿi/Hanafi Asr, high-latitude rules, per-prayer minute adjustments, monthly timetable. |
| **Today** | Live countdown ring to the next prayer, a sky that changes with the time of day, the current prayer’s status with a one-tap “I prayed”, Hijri date, daily Qur’an/hadith reminder. Dhuhr shows as Jumuʿah on Fridays. |
| **Salah tracker** | Log each prayer as *In congregation*, *On time*, *Late* or *Missed*. Week grid and month calendar (tap any day to edit), streaks, completion and on-time rates, a per-prayer 30-day breakdown, personalised insights, achievements. |
| **Accountability** | “Unlogged prayers” review banner; a check-in reminder before a prayer’s time ends if you haven’t logged it; Undo on every action. |
| **Qada planner** | Estimate past missed prayers by duration or dates (with optional days excluded per month), per-prayer counters, “prayed one full day” button, daily goal, projected finish date, 14-day history. Prayers marked *Missed* are added automatically. |
| **Qibla** | Great-circle bearing and distance to the Kaaba; live compass on phones with a sensor (with alignment glow and haptics). |
| **Reminders** | Pre-prayer alert, prayer-time alert and check-in, per-prayer toggles, synthesised chime, notification action “✓ I have prayed”. |
| **Privacy & data** | Everything is stored on the device (localStorage). Export / import a JSON backup; reset. Light, dark and system themes. |

## Run it locally (Windows, no installs needed)

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open <http://localhost:5173>. Any static web server works too (e.g. `npx serve`, `python -m http.server`).

## Put it on your phone

1. Host the `falah/` folder on any HTTPS static host — e.g. **Netlify Drop** (drag the folder onto
   app.netlify.com/drop), **GitHub Pages**, **Cloudflare Pages** or **Vercel**.
2. Open the URL on your phone:
   - **Android (Chrome):** menu ⋮ → *Install app* / *Add to Home screen*.
   - **iPhone (Safari):** Share → *Add to Home Screen*. (iOS 16.4+ is required for notifications.)

### About reminders

Web apps can only fire reminders while Falah is open or recently backgrounded — browsers do not
allow a PWA to schedule alarms that wake a closed app. For guaranteed background adhan alerts,
package Falah as a native app with **Capacitor** (`@capacitor/local-notifications`) or
**PWABuilder** — the code is structured so `js/notify.js` is the only file that needs to change.

## Project structure

```
falah/
├─ index.html            App shell
├─ manifest.webmanifest  PWA manifest (icons, shortcuts)
├─ sw.js                 Service worker: offline cache + notification actions
├─ serve.ps1             Zero-dependency local server (PowerShell)
├─ css/app.css           Design system (tokens, light/dark, components)
├─ icons/                App icons (SVG + PNG)
└─ js/
   ├─ app.js             Controller: routing, actions, sheets, compass, timers
   ├─ views.js           Screens & bottom sheets (HTML templates)
   ├─ ui.js              Shared UI state, helpers, toasts, celebration
   ├─ praytimes.js       Prayer-time & Qibla astronomy
   ├─ times.js           Timezone-aware dates, prayer windows, Hijri
   ├─ tracker.js         Logs, stats, streaks, achievements, Qada ledger
   ├─ notify.js          Reminder scheduling, system notifications, chime
   ├─ store.js           Persistent state
   └─ data.js            Methods, cities, statuses, reminders
```

## Notes on accuracy

Times are computed astronomically and match published JAKIM times for Kuala Lumpur to within
about 1–2 minutes. Southeast Asian methods include a 2-minute *ihtiyati* (precaution). Where your
local mosque or authority differs, use **Settings → Manual adjustments**. The Hijri date uses the
Umm al-Qura calendar and can be shifted ±2 days to match local moon sighting.
