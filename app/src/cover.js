// Sunset State Cover Studio — the cover painter.
//
// Everything a GTA-style poster cover needs, drawn onto any 2D canvas:
// the maker's photos fill a set of comic-book panels (each one cropped
// and framed on its own), a Vice colour grade lights the whole thing,
// an optional Poster Ink finish makes it read like a printed poster,
// a seal stamps the corner, the credits run along the bottom edge, and
// the caption sits in heavy extruded 3D lettering with a setting sun
// behind it.
//
// All positions are fractions of the canvas (0..1), so one description
// renders at 1080x1080, 1080x1350 and 1920x1080 without any change.
// Nothing here touches the network: photos, fonts and the canvas are
// all local.

// ---------------------------------------------------------------------------
// Catalogue data. Layouts and grades are written as compact rows and
// expanded by the builders below, which keeps the tables readable while
// the rest of the file works with named fields.
// A panel row is [x, y, w, h] with an optional fifth element, the slant
// that shears its left and right edges for the diagonal comic look.
// A title row is [x, y, w, h, align].
// ---------------------------------------------------------------------------

/** The four AI-made sample photos shipped with the app. Original
 *  characters in dramatic Vice City scenes: a convertible on Ocean
 *  Drive, the skyline at sunset, a criminal duo by a neon sports car,
 *  and a getaway on wet streets. Free to use. */
export const SAMPLES = [
  { id: 'ocean-drive', name: 'Ocean Drive convertible', blurb: 'Classic convertible, neon sunset' },
  { id: 'skyline', name: 'Vice skyline sunset', blurb: 'Palms, towers, burning sky' },
  { id: 'duo', name: 'Neon duo', blurb: 'Two outlaws, one sports car' },
  { id: 'getaway', name: 'Rainy getaway', blurb: 'Wet streets, red and blue lights' },
];

const LAYOUT_ROWS = [
  ['hero', 'Hero Multi-Panel', 'One big hero shot, two stacked side panels',
    [[0, 0, 0.615, 1], [0.63, 0, 0.37, 0.49], [0.63, 0.505, 0.37, 0.495]],
    [0.03, 0.72, 0.94, 0.25, 'left']],
  ['comic', 'Comic Slash', 'Three diagonal slashed panels',
    [[0, 0, 0.38, 1, 0.07], [0.355, 0, 0.38, 1, 0.07], [0.71, 0, 0.29, 1, 0.07]],
    [0.04, 0.74, 0.92, 0.23, 'left']],
  ['grid', 'Grid Cast', 'Four-panel cast grid with a title band',
    [[0, 0, 0.492, 0.415], [0.508, 0, 0.492, 0.415],
     [0, 0.43, 0.492, 0.415], [0.508, 0.43, 0.492, 0.415]],
    [0.04, 0.865, 0.92, 0.115, 'center']],
  ['single', 'Single Hero', 'One full-bleed photo, caption on top',
    [[0, 0, 1, 1]],
    [0.05, 0.7, 0.9, 0.27, 'center']],
  ['split', 'Split Duotone', 'Two halves, one story, duotone grade',
    [[0, 0, 0.492, 1], [0.508, 0, 0.492, 1]],
    [0.04, 0.72, 0.92, 0.25, 'center']],
  ['trio', 'Trio Strip', 'Three tall strips side by side',
    [[0, 0, 0.325, 1], [0.3375, 0, 0.325, 1], [0.675, 0, 0.325, 1]],
    [0.04, 0.74, 0.92, 0.23, 'left']],
  ['marquee', 'Marquee Stack', 'Big hero marquee on top, three strips below',
    [[0, 0, 1, 0.6], [0, 0.615, 0.325, 0.385],
     [0.3375, 0.615, 0.325, 0.385], [0.675, 0.615, 0.325, 0.385]],
    [0.04, 0.38, 0.92, 0.2, 'left']],
  ['center', 'Center Stage', 'Tall centre panel flanked by two wings',
    [[0, 0, 0.26, 1], [0.275, 0, 0.45, 1], [0.74, 0, 0.26, 1]],
    [0.03, 0.7, 0.94, 0.26, 'center']],
];

// A grade row is [id, name, photo filter, tint wash (top, bottom),
// backdrop sky (top, middle, bottom), sun, face top, face bottom,
// extrude depth colour, outline colour, accent colour, title scrim].
const GRADE_ROWS = [
  ['sunset', 'Vice Sunset', 'saturate(1.5) contrast(1.1) sepia(0.22) brightness(1.03)',
    ['rgba(255,122,26,0.16)', 'rgba(214,32,120,0.26)'],
    ['#ff9e2c', '#ff5e7a', '#8b2a86'], '#ffd23f', '#fff6d8', '#ffb347',
    '#4a0e4e', '#2b0633', '#ffd23f', 'rgba(30,4,46,0.72)'],
  ['neon', 'Neon Nights', 'saturate(1.9) contrast(1.16) hue-rotate(-18deg) brightness(1.02)',
    ['rgba(0,229,255,0.14)', 'rgba(255,0,160,0.24)'],
    ['#00e5ff', '#b537f2', '#ff0080'], '#ff2fb3', '#eafcff', '#7df9ff',
    '#12003d', '#ff2fb3', '#00e5ff', 'rgba(10,2,40,0.72)'],
  ['gold', 'Golden Hour', 'saturate(1.4) contrast(1.06) sepia(0.38) brightness(1.06)',
    ['rgba(255,190,60,0.20)', 'rgba(160,60,10,0.18)'],
    ['#ffd76a', '#ff9a3d', '#c25e1e'], '#fff3b0', '#fffbe8', '#ffc53d',
    '#4d2200', '#2e1500', '#ff9a3d', 'rgba(46,18,0,0.66)'],
  ['teal', 'Teal Noir', 'saturate(1.25) contrast(1.18) hue-rotate(12deg) brightness(0.96)',
    ['rgba(0,180,180,0.16)', 'rgba(4,20,40,0.30)'],
    ['#0affd2', '#0a7d8c', '#04122b'], '#9ff5e3', '#e8fff8', '#5eead4',
    '#02131f', '#00e5c0', '#0affd2', 'rgba(2,12,24,0.74)'],
  ['pink', 'Bubblegum Vice', 'saturate(1.75) contrast(1.1) hue-rotate(8deg) brightness(1.05)',
    ['rgba(255,120,200,0.18)', 'rgba(140,40,200,0.26)'],
    ['#ff9ecf', '#ff5ea8', '#7b2ff7'], '#ffe3f2', '#fff0f8', '#ff8fd1',
    '#3d0a4d', '#ff5ea8', '#ffd23f', 'rgba(48,6,64,0.70)'],
  ['mono', 'Mono Pop', 'grayscale(1) contrast(1.28) brightness(1.05)',
    ['rgba(255,255,255,0.05)', 'rgba(0,0,0,0.22)'],
    ['#e8e8e8', '#8a8a8a', '#1c1c1c'], '#ffffff', '#ffffff', '#d9d9d9',
    '#000000', '#ff2fb3', '#ff2fb3', 'rgba(0,0,0,0.72)'],
];

const SIZE_ROWS = [
  ['square', 'Square', 1080, 1080],
  ['portrait', 'Portrait', 1080, 1350],
  ['landscape', 'Landscape', 1920, 1080],
];

/** Default billing-block credits. The names are fictional stand-ins
 *  for the poster's cast, not real people; the maker can edit them. */
export const DEFAULT_BILLING =
  'SUNSET STATE PICTURES PRESENTS LUCIA VOSS AND JASON REYES IN "NEON GETAWAY" · A SUNSET STATE PRODUCTION · VICE CITY 2026';

function makeLayout(row) {
  const [id, name, blurb, panelRows, titleRow] = row;
  return {
    id,
    name,
    blurb,
    panels: panelRows.map(([x, y, w, h, slant = 0]) => ({ x, y, w, h, slant })),
    title: { x: titleRow[0], y: titleRow[1], w: titleRow[2], h: titleRow[3], align: titleRow[4] },
  };
}

function makeGrade(row) {
  const [id, name, photoFilter, tint, backdrop, sun,
    faceTop, faceBottom, depth, edge, pop, shade] = row;
  return { id, name, photoFilter, tint, backdrop, sun, faceTop, faceBottom, depth, edge, pop, shade };
}

/** The eight panel layouts, expanded from the rows above. */
export const LAYOUTS = LAYOUT_ROWS.map(makeLayout);

/** The six Vice colour grades, expanded from the rows above. */
export const GRADES = GRADE_ROWS.map(makeGrade);

/** The three export sizes, in pixels. */
export const SIZES = SIZE_ROWS.map(([id, name, w, h]) => ({ id, name, w, h }));

// ---------------------------------------------------------------------------
// Lookups. Unknown ids fall back to the first entry, so a stale saved
// state can never break a render.
// ---------------------------------------------------------------------------

export function findLayout(id) {
  return LAYOUTS.find((entry) => entry.id === id) ?? LAYOUTS[0];
}

export function findGrade(id) {
  return GRADES.find((entry) => entry.id === id) ?? GRADES[0];
}

export function findSize(id) {
  return SIZES.find((entry) => entry.id === id) ?? SIZES[0];
}

export function findSample(id) {
  return SAMPLES.find((entry) => entry.id === id) ?? SAMPLES[0];
}

// ---------------------------------------------------------------------------
// Geometry. Panels are parallelograms when they carry a slant: the top
// edge starts `slant` to the right of the bottom edge, which is what
// gives the comic layouts their diagonal cut.
// ---------------------------------------------------------------------------

/** Traces the outline of one normalised panel rect on the canvas. */
function tracePanel(ctx, W, H, panel) {
  const x = panel.x * W;
  const y = panel.y * H;
  const w = panel.w * W;
  const h = panel.h * H;
  const shear = (panel.slant ?? 0) * W;
  ctx.beginPath();
  ctx.moveTo(x + shear, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w - shear, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
}

/** Which layout panel holds normalised point (nx, ny), or -1 when the
 *  point lands in a gutter. Slanted panels are tested against their
 *  parallelogram, so a click near a diagonal edge picks the right one. */
export function hitPanel(layoutId, nx, ny) {
  const layout = findLayout(layoutId);
  for (let i = layout.panels.length - 1; i >= 0; i -= 1) {
    const p = layout.panels[i];
    const shear = p.slant ?? 0;
    const travelled = (ny - p.y) / Math.max(0.001, p.h);
    const left = p.x + shear * (1 - travelled);
    const right = p.x + p.w - shear * travelled;
    if (nx >= left && nx <= right && ny >= p.y && ny <= p.y + p.h) return i;
  }
  return -1;
}

// ---------------------------------------------------------------------------
// Paint stages. drawCover runs them in order: backdrop, photos, frames,
// colour wash, ink finish, sun, scrim, tag, seal, caption, credits.
// ---------------------------------------------------------------------------

/** Fills one panel with its photo, cover-fitting it and applying the
 *  panel's own zoom and pan (ox/oy are fractions of the panel size).
 *  With Poster Ink on, the photo gets extra punch first, so the print
 *  finish reads even before the halftone goes over it. A panel with
 *  no photo yet gets a dark violet placeholder instead. */
function fillPhoto(ctx, W, H, panel, photo, grade, inked) {
  const px = panel.x * W;
  const py = panel.y * H;
  const pw = panel.w * W;
  const ph = panel.h * H;
  ctx.save();
  tracePanel(ctx, W, H, panel);
  ctx.clip();
  if (photo?.img) {
    const img = photo.img;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const zoom = panel.zoom ?? 1;
    const scale = Math.max(pw / iw, ph / ih) * zoom;
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = px + (pw - dw) / 2 + (panel.ox ?? 0) * pw;
    const dy = py + (ph - dh) / 2 + (panel.oy ?? 0) * ph;
    ctx.filter = inked
      ? `${grade.photoFilter} contrast(1.22) saturate(1.35)`
      : grade.photoFilter;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.filter = 'none';
  } else {
    const placeholder = ctx.createLinearGradient(px, py, px + pw, py + ph);
    placeholder.addColorStop(0, '#3a2b4d');
    placeholder.addColorStop(1, '#1c1030');
    ctx.fillStyle = placeholder;
    ctx.fillRect(px, py, pw, ph);
  }
  ctx.restore();
}

/** The Poster Ink finish: a halftone dot screen and a dark ink vignette
 *  over the photos, so the cover reads like a printed poster. The dots
 *  come from one small pre-rendered tile repeated as a pattern, which
 *  keeps the pass fast and deterministic at any export size. */
function inkFinish(ctx, W, H) {
  const step = Math.max(6, Math.round(W * 0.0065));
  const tile = document.createElement('canvas');
  tile.width = step;
  tile.height = step;
  const tileCtx = tile.getContext('2d');
  tileCtx.fillStyle = 'rgba(0,0,0,0.16)';
  tileCtx.beginPath();
  tileCtx.arc(step / 2, step / 2, Math.max(0.8, step * 0.16), 0, Math.PI * 2);
  tileCtx.fill();
  ctx.save();
  ctx.fillStyle = ctx.createPattern(tile, 'repeat');
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  const vignette = ctx.createRadialGradient(
    W / 2, H / 2, Math.min(W, H) * 0.42,
    W / 2, H / 2, Math.max(W, H) * 0.75,
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(10,0,20,0.34)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

/** The caption in heavy extruded 3D lettering: a stack of offset
 *  copies in the depth colour, a gradient face, and a hard outline.
 *  Shrinks until the line fits the band, never below a readable size. */
function letterTitle(ctx, text, cx, baselineY, size, grade, align, maxWidth) {
  const face = 'Anton, "Archivo Black", "Arial Black", sans-serif';
  let fit = size;
  ctx.font = `${fit}px ${face}`;
  while (ctx.measureText(text).width > maxWidth && fit > 14) {
    fit -= 2;
    ctx.font = `${fit}px ${face}`;
  }
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  const nudge = Math.max(1.5, fit * 0.016);
  const layers = Math.max(4, Math.round(fit * 0.055));
  ctx.fillStyle = grade.depth;
  for (let i = layers; i >= 1; i -= 1) {
    ctx.fillText(text, cx + i * nudge, baselineY + i * nudge);
  }
  const faceGrad = ctx.createLinearGradient(0, baselineY - fit, 0, baselineY + fit * 0.15);
  faceGrad.addColorStop(0, grade.faceTop);
  faceGrad.addColorStop(1, grade.faceBottom);
  ctx.fillStyle = faceGrad;
  ctx.fillText(text, cx, baselineY);
  ctx.lineWidth = Math.max(1.5, fit * 0.028);
  ctx.strokeStyle = grade.edge;
  ctx.strokeText(text, cx, baselineY);
}

/** A five-point star centred at (cx, cy) with outer radius r. */
function star(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? r : r * 0.42;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

/** The seal: a rotated circular stamp in the top-right corner — double
 *  ring, a star, and two lines of text — like the stamp on a film
 *  poster. */
function stampSeal(ctx, W, H, grade) {
  const r = Math.max(26, W * 0.052);
  const cx = W - r - W * 0.028;
  const cy = r + H * 0.028;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.21);
  ctx.globalAlpha = 0.92;
  ctx.strokeStyle = grade.pop;
  ctx.lineWidth = Math.max(2, r * 0.045);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = Math.max(1, r * 0.02);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = grade.pop;
  star(ctx, 0, -r * 0.34, r * 0.2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.max(9, r * 0.24)}px "Archivo Black", sans-serif`;
  ctx.fillText('VICE CITY', 0, r * 0.12);
  ctx.font = `bold ${Math.max(8, r * 0.19)}px "Archivo Black", sans-serif`;
  ctx.fillText('EST. 2026', 0, r * 0.44);
  ctx.restore();
}

/** The billing block: a thin dark strip along the very bottom edge
 *  with tiny condensed credits in white caps, like a movie poster's
 *  credit line. The text shrinks until it fits the width. */
function creditsStrip(ctx, W, H, billing) {
  const text = (billing ?? '').trim().toUpperCase();
  if (!text) return;
  const stripH = Math.max(16, H * 0.026);
  ctx.fillStyle = 'rgba(8,2,16,0.82)';
  ctx.fillRect(0, H - stripH, W, stripH);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let size = Math.max(9, W * 0.0115);
  ctx.font = `bold ${size}px "Archivo Black", sans-serif`;
  while (ctx.measureText(text).width > W * 0.96 && size > 7) {
    size -= 0.5;
    ctx.font = `bold ${size}px "Archivo Black", sans-serif`;
  }
  ctx.fillText(text, W / 2, H - stripH / 2 + 1);
}

// ---------------------------------------------------------------------------
// The whole cover.
// `state` carries layoutId, gradeId, title, subtitle, tag, photos (an
// array of {img}), panels (one per layout panel, each {photo, zoom, ox,
// oy} where photo is an index into photos), and the finish options
// posterInk, seal, billing and showBilling.
// ---------------------------------------------------------------------------

export function drawCover(ctx, W, H, state) {
  const layout = findLayout(state.layoutId);
  const grade = findGrade(state.gradeId);
  const slots = state.panels ?? [];
  const inked = state.posterInk === true;
  const withSeal = state.seal !== false;
  const withBilling = state.showBilling !== false;

  // Backdrop: the grade's sunset gradient fills every gutter.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, grade.backdrop[0]);
  sky.addColorStop(0.55, grade.backdrop[1]);
  sky.addColorStop(1, grade.backdrop[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Photos, one per panel.
  layout.panels.forEach((panel, i) => {
    const slot = slots[i] ?? { photo: 0, zoom: 1, ox: 0, oy: 0 };
    fillPhoto(ctx, W, H, panel, state.photos?.[slot.photo] ?? null, grade, inked);
  });

  // White gutters: a crisp frame around every panel.
  ctx.lineWidth = Math.max(3, Math.round(W * 0.004));
  ctx.strokeStyle = '#ffffff';
  layout.panels.forEach((panel) => {
    tracePanel(ctx, W, H, panel);
    ctx.stroke();
  });

  // Whole-cover colour wash for the grade.
  const wash = ctx.createLinearGradient(0, 0, 0, H);
  wash.addColorStop(0, grade.tint[0]);
  wash.addColorStop(1, grade.tint[1]);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);

  // Poster Ink goes over the photos and the wash, under the lettering.
  if (inked) inkFinish(ctx, W, H);

  const band = layout.title;

  // Sun disc glowing behind the caption, low in the title band like a
  // setting sun sinking behind the lettering.
  const sunR = Math.min(W, H) * 0.13;
  const sunX = band.align === 'center' ? W / 2 : (band.x + band.w / 2) * W;
  const sunY = (band.y + band.h * 0.72) * H;
  const sun = ctx.createRadialGradient(sunX, sunY, sunR * 0.1, sunX, sunY, sunR);
  sun.addColorStop(0, grade.sun);
  sun.addColorStop(0.7, grade.sun);
  sun.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Scrim so the lettering always reads, however bright the photo is.
  const scrim = ctx.createLinearGradient(0, band.y * H - H * 0.06, 0, (band.y + band.h) * H);
  scrim.addColorStop(0, 'rgba(0,0,0,0)');
  scrim.addColorStop(1, grade.shade);
  ctx.fillStyle = scrim;
  ctx.fillRect(0, band.y * H - H * 0.06, W, (band.h + 0.06) * H);

  // Tag pill, top-left, when the maker wrote one.
  const tag = (state.tag ?? '').trim().toUpperCase();
  if (tag) {
    const pad = Math.max(10, W * 0.012);
    const pillH = Math.max(22, W * 0.032);
    const pillX = W * 0.03;
    const pillY = H * 0.03;
    ctx.font = `bold ${Math.max(13, W * 0.016)}px "Archivo Black", sans-serif`;
    const textW = ctx.measureText(tag).width;
    ctx.fillStyle = grade.pop;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, textW + pad * 2, pillH, pillH / 2);
    ctx.fill();
    ctx.fillStyle = '#14001f';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag, pillX + pad, pillY + pillH / 2 + 1);
    ctx.textBaseline = 'alphabetic';
  }

  // Seal in the top-right corner, opposite the tag pill.
  if (withSeal) stampSeal(ctx, W, H, grade);

  // Title and subtitle in the title band.
  const title = (state.title ?? '').trim().toUpperCase();
  const align = band.align === 'center' ? 'center' : 'left';
  const anchorX = align === 'center' ? W / 2 : band.x * W;
  if (title) {
    const size = Math.min(band.h * H * 0.62, W * 0.115);
    const baseline = (band.y + band.h * 0.62) * H;
    letterTitle(ctx, title, anchorX, baseline, size, grade, align, band.w * W);
  }
  const subtitle = (state.subtitle ?? '').trim();
  if (subtitle) {
    const subSize = Math.max(14, Math.min(W * 0.026, band.h * H * 0.2));
    ctx.font = `bold ${subSize}px "Archivo Black", sans-serif`;
    ctx.textAlign = align;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = subSize * 0.3;
    // When the billing strip is on, lift the subtitle a touch so the
    // two never crowd each other at the bottom edge.
    const lift = withBilling ? 0.035 : 0;
    ctx.fillText(subtitle.toUpperCase(), anchorX, (band.y + band.h * (0.9 - lift)) * H);
    ctx.shadowBlur = 0;
  }

  // Billing block along the bottom edge, last so it sits on top.
  if (withBilling) creditsStrip(ctx, W, H, state.billing);
}
