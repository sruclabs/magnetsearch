# Magnet Search — Fast, Private Multi-Source Magnet Search for Android

Search multiple public torrent sources and digital archives in one simple app. No tracking, no middleman servers.

**Live:** https://sruclabs.studio/magnetsearch/
**Studio:** [Sruc Labs](https://sruclabs.studio)

## Features

- **Multi-source** — simultaneous search across enabled sources, deduplicated results
- **One-tap handoff** — open magnets straight in your torrent app (LibreTorrent, Flud, BiglyBT)
- **Saved on device** — bookmarks and favorites stay on your phone, no account
- **Flexible sorting** — relevance, seeders, size, date
- **Details first** — info-hash, trackers, categories before opening
- **Privacy first** — direct HTTPS from phone to source, optional app lock / private mode

## Pages

- `/` — Home (hero, features, sources, security, premium teaser)
- `/premium/` — Premium plans
- `/contact/` — contact form (Web3Forms) + `/contact/sent/` confirmation
- `/privacy/`, `/terms/` — policy pages
- Legal contact: sruclabs@gmail.com

## Stack

Static site. Plain HTML / CSS / JS, no build.

- `index.html`, `premium/index.html`, `contact/`, `privacy/`, `terms/` — pages
- `css/style.css` — single stylesheet
- `js/main.js` — theme, drawer, reveal, contact form, to-top, anchors
- `assets/brand/` — favicons, lockups
- `assets/fonts/` — Inter

## Run locally

```zsh
python3 -m http.server 8000
# from the studio repo folder: http://localhost:8000/magnetsearch/
```

## Deploy

Push to `main` → GitHub Pages (project site) → served as `/magnetsearch/` under `sruclabs.studio`.
No `CNAME` in this repo — the custom domain is set once on the studio user site.
