# gta6-cover-art-01-entry
[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/vinzagent/gta6-cover-art-01-entry/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/vinzagent/gta6-cover-art-01-entry/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Sunset State Cover Studio** — a GTA 6-style cover art maker that runs fully offline in your browser. Upload your own photos, frame each one inside a multi-panel poster, pick a Vice colour grade, set the caption in heavy extruded 3D lettering, and export a share-ready PNG.

## What it does

- **Any photo, any panel** — upload photos from your machine (or use the two AI-made samples) and fill several panels with one photo or give each panel its own. Click a panel to select it, drag to move its photo, scroll or slide to zoom, and reframe per panel.
- **6 multi-panel layouts** — Hero Multi-Panel, Comic Slash (diagonal panels), Grid Cast (four-panel), Single Hero, Split Duotone, and Trio Strip.
- **6 Vice colour grades** — Vice Sunset, Neon Nights, Golden Hour, Teal Noir, Bubblegum Vice, and Mono Pop. Each grade re-lights the photos and re-colours the lettering, sun and tag.
- **Bold 3D lettering** — the title is set in Anton (SIL Open Font License, shipped under `app/fonts/`) with a stacked extrude, gradient face and hard outline, plus an editable subtitle and tag pill.
- **Fast and easy** — a live preview shows exactly what the PNG will be; three clicks from a photo to an export.
- **3 export sizes** — 1080 × 1080 (square), 1080 × 1350 (portrait) and 1920 × 1080 (landscape), exported as PNG at exact post size.

## How it works

Everything is static files under `app/` — no build step, no network request, no upload. Photos are read on your own machine and never leave it.

- `app/index.html` — the editor page.
- `app/style.css` — the studio UI.
- `app/src/cover.js` — the cover renderer: layouts, grades, panel photo transforms, sun and scrim, and the extruded 3D title.
- `app/src/main.js` — the editor: uploads, per-panel crop/position, pickers, and PNG export.
- `app/src/shots.js` — fixed screenshot scenes (`?shot=cover` / `?shot=editor`).
- `app/fonts/` — Anton and Archivo Black under the SIL Open Font License (`OFL.txt` included).
- `app/samples/` — two AI-generated sample photos, free to use.

The design is fully original: no Rockstar Games logo, wordmark, artwork, character or font is used anywhere.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Or open `app/index.html` directly from any static file server.

## Build the submission bundle

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

<sub>Entered on [make.fun](https://make.fun/?ref=wsvx4819&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
