# gta6-cover-art-01-entry
[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/vinzagent/gta6-cover-art-01-entry/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/vinzagent/gta6-cover-art-01-entry/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Sunset State Cover Studio — 8 layouts, 6 Vice grades, Poster Ink, billing block & 3-size PNG export.** A GTA 6-style cover art maker that runs fully offline in the browser. Bring your own photos, frame each one inside a multi-panel poster, pick a Vice colour grade, finish it with a halftone Poster Ink print look, stamp it with a Vice City seal, run the credits along the bottom edge, set the caption in heavy extruded 3D lettering, and export a share-ready PNG.

## What you can make with it

- **Any photo, any panel.** Upload photos from your own machine — or use the four AI-made samples: an Ocean Drive convertible, a Vice skyline sunset, a neon duo by a sports car, and a rainy getaway. Fill several panels with one photo or give each panel its own. Click a panel to select it, drag to move its photo, scroll or slide to zoom, and reframe every panel on its own.
- **8 multi-panel layouts.** Hero Multi-Panel, Comic Slash (diagonal panels), Grid Cast (four-panel), Single Hero, Split Duotone, Trio Strip, Marquee Stack (big hero on top, three strips below), and Center Stage (tall centre panel flanked by two wings).
- **6 Vice colour grades.** Vice Sunset, Neon Nights, Golden Hour, Teal Noir, Bubblegum Vice, and Mono Pop. Each grade re-lights the photos and re-colours the lettering, sun and tag.
- **Poster Ink finish.** A toggleable printed-poster look: extra photo punch, a halftone dot screen and an ink vignette over the whole cover.
- **Seal stamp & billing block.** A rotated Vice City corner stamp with a star, and an editable credits strip along the bottom edge, like a movie poster's billing block.
- **Bold 3D lettering.** The title is set in Anton (SIL Open Font License, shipped under `app/fonts/` as WOFF2) with a stacked extrude, gradient face and hard outline, plus an editable subtitle and tag pill.
- **Fast and easy.** A live preview shows exactly what the PNG will be; three clicks from a photo to an export.
- **3 export sizes.** 1080 × 1080 (square), 1080 × 1350 (portrait) and 1920 × 1080 (landscape), exported as PNG at exact post size.

## How it works

Everything is static files under `app/` — no build step, no network request, no upload. Photos are read on your own machine and never leave it.

- `app/index.html` — the editor page.
- `app/style.css` — the studio UI.
- `app/src/cover.js` — the cover painter: layouts, grades, panel photo transforms, the Poster Ink halftone finish, the seal stamp, the billing block, the sun and scrim, and the extruded 3D title.
- `app/src/main.js` — the editor: uploads, per-panel crop and position, pickers, Poster Ink / seal / billing controls, and PNG export.
- `app/src/shots.js` — fixed screenshot scenes (`?shot=cover` / `?shot=editor`), with multi-photo scenes and finish toggles.
- `app/fonts/` — Anton and Archivo Black under the SIL Open Font License (`OFL.txt` included), shipped as WOFF2.
- `app/samples/` — four AI-generated sample photos, free to use.

The design is fully original: no Rockstar Games logo, wordmark, artwork, character or font is used anywhere. The cast names in the default billing block are fictional stand-ins the maker can edit.

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
