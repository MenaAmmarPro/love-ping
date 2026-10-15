# Love Ping — Love for Mena

A gentle nudge. Press the circle whenever she crosses your mind and get a little
line to send her — never the same one twice in a row. Part of the **Love for
Mena** collection.

**Live:** https://menaammarpro.github.io/love-ping/

## What it does

- A big, glowing **ping button** — one press, one ping
- A fresh **line to send her** each time, with a copy button
- Counts for **today** and **all time**, plus when the last ping was
- A short **history** of recent pings
- Everything is stored on the device only — this page never sends anything
- Installable PWA with offline support

## How it works

Pings live in `localStorage` on that device. To change the lines, edit the
`LINES` array at the top of `js/app.js`.

## Files

- `index.html` — the page
- `css/theme.css` — shared love-theme (copied from `_love-theme/`)
- `css/app.css` — page-specific styles (the ping circle)
- `js/theme-main.js`, `js/effects.js` — shared behaviour/effects
- `js/app.js` — ping logic
- `manifest.webmanifest`, `sw.js` — PWA
- `assets/` — favicon and icons

## Run locally

```powershell
py -m http.server 8000
```

Then visit http://localhost:8000.

## Deploy

Static site, deployed with GitHub Pages from `main`.

## License

Creative Commons BY-NC-ND 4.0 — see [`LICENSE`](LICENSE).
© 2026 Ammar (MenaAmmarPro). Made with care for Mena.
