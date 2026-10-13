# Falah — Salah Companion

*Hayya ʿala al-Falah — come to success.*

Falah is a mobile-first Islamic app that helps Muslims pray on time, every time, and take
responsibility for prayers they have missed. It is an installable **Progressive Web App (PWA)**:
it runs on Android and iPhone from the home screen, works offline, and needs no app store.

## Design

Version 2 uses a **liquid-glass** interface in an earthy olive palette (*Olive night*) with a
light *Desert sand* theme. Its main elements:

- **Stacked, swipeable cards** for the day's prayers and for the wirid sequence.
- A **floating glass dock** for navigation.
- **Geist** for the interface, with *Instrument Serif* and **Amiri** for accents and Arabic.
- Justified paragraphs throughout.

All imagery is **procedural abstract Islamic art** drawn in code as SVG (`art.js`), so there are
no image files and no copyright concerns. The scenes are:

- Dawn crescent over the hills
- A receding arcade of arches
- A domed masjid with a reflecting pool
- A mihrab window
- Night lanterns
- Girih star lattice

## Features

| Area | What it does |
| --- | --- |
| **Prayer times** | Calculated on-device for any coordinates. 15 methods including **JAKIM**, MUIS, Kemenag, MWL, ISNA, Umm al-Qura and Diyanet. Shafiʿi/Hanafi Asr, high-latitude rules, per-prayer minute adjustments, monthly timetable. |
| **Today** | Swipeable deck of prayer cards with live countdown, one-tap logging and reminder toggles. Also a time strip, Hijri date, a daily Qur’an/hadith reminder and an ambient background that follows the time of day. |
| **Wirid & Doa** | 17 steps after the fardhu prayer, following common Malaysian Ahli Sunnah wal Jamaah practice. Each step has Arabic with harakat, transliteration and meaning, a tap counter (×3 / ×33) that auto-advances, a full-text mode and a daily completion record. |
| **Salah tracker** | Log each prayer as *Jamaah*, *On time*, *Late* or *Missed*. Week grid, month calendar, streaks, rates, 30-day breakdown, insights, achievements. |
| **Accountability** | Review banner for unlogged prayers, a check-in reminder before a prayer ends, Undo everywhere. |
| **Qada planner** | Estimate past missed prayers, per-prayer counters, daily goal, projected finish date, 14-day history. |
| **Qibla** | Bearing and distance to the Kaaba with a live compass on phones. |
| **Privacy** | Data stays on the device. Export/import a JSON backup. |

## Run locally (Windows, nothing to install)

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open <http://localhost:5174>.

## Publish with GitHub Pages

All app files sit in **one flat folder**. Upload every file to the root of your repo, replacing
the old ones. `.claude/`, `serve.ps1` and `README.md` are optional. Then go to
**Settings → Pages → Deploy from branch `main` / root**.

## Files

```
index.html  app.css  manifest.webmanifest  sw.js
app.js      Controller: routing, swipe decks, actions, sheets, timers
views.js    Screens & bottom sheets
art.js      Procedural Islamic SVG artwork
wirid.js    Wirid & doa content
ui.js  store.js  times.js  tracker.js  notify.js  praytimes.js  data.js  icons.js
icon.svg  icon-192.png  icon-512.png
```

## Notes

- **Prayer times:** these match JAKIM for Kuala Lumpur within about 1–2 minutes. Use
  *Settings → Manual adjustments* to match your local masjid.
- **Wirid wording:** this varies slightly between booklets. Follow your teacher or local masjid
  where they differ.
- **Reminders:** a PWA can only fire reminders while it is open or recently backgrounded. For
  guaranteed background adhan, package the app natively (e.g. with Capacitor).
