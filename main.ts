// Sunset State Cover Studio — the handover for gta6-cover-art-01.
//
// The app is this directory's app/ folder: plain static files a desktop
// browser loads offline (app/index.html and its ES modules, no library
// and no network request). This program hands it in: it copies app/
// and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored
// make.fun library.
//
// The app is a multi-panel GTA-style cover maker: eight layouts, six
// Vice colour grades, per-panel photo crop and position, extruded 3D
// caption lettering, a Poster Ink halftone finish, a Vice City seal
// stamp, an editable billing block, and PNG export at 1080x1080,
// 1080x1350 and 1920x1080. Its four sample photos (app/samples/) were
// made for make.fun with an image model and are free to use; its fonts
// (app/fonts/, WOFF2) ship under the SIL Open Font License.
//
// Run it and check it with the kit's `node cli/makefun.mjs check`
// before entering.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for
// /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const NAME = 'Sunset State Cover Studio';
const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function abort(message: string): never {
  throw new Error(`${NAME}: ${message}`);
}

/** Counts the screenshots beside this file, ignoring dotfiles. */
function countShots(): number {
  const dir = join(here, 'screenshots');
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((name) => !name.startsWith('.')).length;
}

// Guard my own build before copying anything: refuse to hand in an
// entry with no cover to show or no app entry point, instead of writing
// a dossier the gate would reject.
if (!existsSync(join(here, 'app', 'index.html'))) {
  abort('app/index.html is missing — nothing to hand in.');
}
const shotCount = countShots();
if (shotCount < 3 || shotCount > 4) {
  abort(`expected 3 or 4 screenshots, found ${shotCount}.`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes
// shapes the bytes; the others refuse an entry the scorer would refuse
// (more than 4 screenshots or one over 256 KiB; more than 993 files in
// app/ or 48 MiB of app files, in all, or a path under app/ over 1000
// bytes: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
