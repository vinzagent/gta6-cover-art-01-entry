// Sunset State Cover Studio — the editor.
//
// Wires the controls to the cover painter: photo uploads and samples,
// per-panel crop and position (click a panel, drag to pan, wheel or
// slider to zoom), eight layouts, six Vice grades, an editable caption,
// the Poster Ink finish, a seal stamp and an editable billing block,
// and PNG export in the three post sizes. Runs fully offline; photos
// never leave the machine.

import {
  LAYOUTS, GRADES, SIZES, SAMPLES, DEFAULT_BILLING,
  drawCover, findLayout, findGrade, findSize, hitPanel,
} from './cover.js';
import { runShot } from './shots.js';

const el = (id) => document.getElementById(id);
const canvas = el('preview');
const paintCtx = canvas.getContext('2d');

// The whole editor state. `panels` holds one slot per layout panel:
// { photo, zoom, ox, oy } — photo is an index into `photos`, and
// ox/oy are pan fractions of the panel the photo sits in.
const studio = {
  layoutId: 'hero',
  gradeId: 'sunset',
  sizeId: 'square',
  title: 'Neon Getaway',
  subtitle: 'One last ride down Ocean Drive',
  tag: 'Sunset State',
  posterInk: false,
  seal: true,
  billing: DEFAULT_BILLING,
  showBilling: true,
  photos: [],
  panels: [],
  selected: 0,
};

/** One slot per panel of the new layout, keeping any framing the
 *  maker already set on panels that survive the switch. */
function slotsFor(layoutId) {
  const layout = findLayout(layoutId);
  const previous = studio.panels;
  return layout.panels.map((_, i) => previous[i] ?? { photo: 0, zoom: 1, ox: 0, oy: 0 });
}

/** Canvas size for the live preview. In cover-shot mode the canvas
 *  paints at full export resolution so the screenshot stays crisp;
 *  the CSS scales it down to the viewport. */
function previewDims() {
  const size = findSize(studio.sizeId);
  if (document.body.classList.contains('shot-cover')) return { w: size.w, h: size.h };
  const cap = 880;
  const scale = Math.min(cap / size.w, cap / size.h, 1);
  return { w: Math.round(size.w * scale), h: Math.round(size.h * scale) };
}

function paint() {
  const { w, h } = previewDims();
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  drawCover(paintCtx, w, h, studio);
  refreshPanelReadout();
}

function say(text) {
  el('status').textContent = text;
}

// ---------------------------------------------------------------------------
// Photos: samples, uploads, and the tray.
// ---------------------------------------------------------------------------

/** Registers a decoded image as a photo. The first photo fills every
 *  panel by default; returns the new photo's index. */
function registerPhoto(img, name) {
  const photo = { img, name };
  studio.photos.push(photo);
  if (studio.photos.length === 1) {
    studio.panels = studio.panels.map((slot) => ({ ...slot, photo: 0 }));
  }
  refreshTray();
  paint();
  return studio.photos.length - 1;
}

/** Loads one sample photo and resolves with its index once decoded. */
function sampleAsync(name) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(registerPhoto(img, name));
    img.onerror = () => reject(new Error(`Could not load the ${name} sample.`));
    img.src = `samples/${name}.jpg`;
  });
}

function sample(name) {
  sampleAsync(name)
    .then(() => say(`Loaded sample photo "${name}". Click a panel, then drag to frame it.`))
    .catch(() => say(`Could not load the ${name} sample.`));
}

function upload(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      registerPhoto(img, file.name.replace(/\.[^.]+$/, ''));
      say(`Loaded "${file.name}" — it now fills the selected panel.`);
    };
    img.onerror = () => say(`"${file.name}" is not a readable image.`);
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function refreshTray() {
  const tray = el('photo-tray');
  tray.innerHTML = '';
  studio.photos.forEach((photo, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thumb';
    button.title = `Use "${photo.name}" in the selected panel`;
    const thumb = document.createElement('img');
    thumb.src = photo.img.src;
    thumb.alt = photo.name;
    button.appendChild(thumb);
    button.addEventListener('click', () => {
      const slot = studio.panels[studio.selected];
      if (slot) slot.photo = i;
      paint();
      say(`Panel ${studio.selected + 1} now shows "${photo.name}".`);
    });
    tray.appendChild(button);
  });
  el('fill-all').disabled = studio.photos.length === 0;
}

// ---------------------------------------------------------------------------
// Pickers. They are built from the painter's own lists, so the UI can
// never drift from what the cover actually draws.
// ---------------------------------------------------------------------------

function markActive(container, current) {
  container.querySelectorAll('[data-id]').forEach((button) => {
    button.classList.toggle('on', button.dataset.id === current);
  });
}

function buildSampleButtons() {
  const box = el('sample-row');
  SAMPLES.forEach((entry) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mini';
    button.textContent = `Sample: ${entry.name}`;
    button.title = entry.blurb;
    button.addEventListener('click', () => sample(entry.id));
    box.appendChild(button);
  });
}

function buildLayoutPicker() {
  const box = el('layout-picker');
  LAYOUTS.forEach((layout) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pick';
    button.dataset.id = layout.id;
    button.innerHTML = `<strong>${layout.name}</strong><span>${layout.blurb}</span>`;
    button.addEventListener('click', () => {
      studio.layoutId = layout.id;
      studio.panels = slotsFor(layout.id);
      studio.selected = 0;
      markActive(box, layout.id);
      paint();
      say(`Layout: ${layout.name}.`);
    });
    box.appendChild(button);
  });
  markActive(box, studio.layoutId);
}

function buildGradePicker() {
  const box = el('grade-picker');
  GRADES.forEach((grade) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'swatch';
    button.dataset.id = grade.id;
    button.title = grade.name;
    button.style.background = `linear-gradient(135deg, ${grade.backdrop[0]}, ${grade.backdrop[1]} 55%, ${grade.backdrop[2]})`;
    button.innerHTML = `<span>${grade.name}</span>`;
    button.addEventListener('click', () => {
      studio.gradeId = grade.id;
      markActive(box, grade.id);
      paint();
      say(`Grade: ${grade.name}.`);
    });
    box.appendChild(button);
  });
  markActive(box, studio.gradeId);
}

function buildSizePicker() {
  const box = el('size-picker');
  SIZES.forEach((size) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pick';
    button.dataset.id = size.id;
    button.innerHTML = `<strong>${size.w} × ${size.h}</strong><span>${size.name}</span>`;
    button.addEventListener('click', () => {
      studio.sizeId = size.id;
      markActive(box, size.id);
      paint();
      say(`Previewing at ${size.w} × ${size.h}.`);
    });
    box.appendChild(button);
  });
  markActive(box, studio.sizeId);
}

// ---------------------------------------------------------------------------
// Selected panel readout and PNG export.
// ---------------------------------------------------------------------------

function refreshPanelReadout() {
  const slot = studio.panels[studio.selected];
  el('panel-label').textContent = `Panel ${studio.selected + 1} of ${studio.panels.length}`;
  el('panel-photo').textContent = slot && studio.photos[slot.photo]
    ? `Photo: ${studio.photos[slot.photo].name}`
    : 'Photo: none yet — upload or pick a sample';
  el('zoom').value = slot ? String(slot.zoom) : '1';
  el('zoom-val').textContent = slot ? `${slot.zoom.toFixed(2)}×` : '1.00×';
}

/** Renders the current cover at exact post size and downloads it. */
async function downloadPng() {
  const size = findSize(studio.sizeId);
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off.getContext('2d'), size.w, size.h, studio);
  const blob = await new Promise((resolve) => off.toBlob(resolve, 'image/png'));
  if (!blob) {
    say('Export failed — the browser could not write the PNG.');
    return;
  }
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `sunset-state-cover-${size.w}x${size.h}.png`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 5000);
  say(`Exported ${size.w} × ${size.h} PNG — check your downloads.`);
}

// ---------------------------------------------------------------------------
// Canvas interaction: click selects a panel, drag pans its photo,
// wheel zooms it.
// ---------------------------------------------------------------------------

let drag = null;

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    nx: (event.clientX - rect.left) / rect.width,
    ny: (event.clientY - rect.top) / rect.height,
  };
}

canvas.addEventListener('pointerdown', (event) => {
  const { nx, ny } = canvasPoint(event);
  const picked = hitPanel(studio.layoutId, nx, ny);
  if (picked < 0) return;
  studio.selected = picked;
  const slot = studio.panels[picked];
  drag = { x: nx, y: ny, ox: slot.ox, oy: slot.oy };
  canvas.setPointerCapture(event.pointerId);
  paint();
});

canvas.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const { nx, ny } = canvasPoint(event);
  const slot = studio.panels[studio.selected];
  const panel = findLayout(studio.layoutId).panels[studio.selected];
  slot.ox = Math.max(-1, Math.min(1, drag.ox + (nx - drag.x) / panel.w));
  slot.oy = Math.max(-1, Math.min(1, drag.oy + (ny - drag.y) / panel.h));
  paint();
});

canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('pointercancel', () => { drag = null; });

canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  const slot = studio.panels[studio.selected];
  if (!slot) return;
  const factor = event.deltaY < 0 ? 1.08 : 0.93;
  slot.zoom = Math.max(1, Math.min(3, slot.zoom * factor));
  paint();
}, { passive: false });

// ---------------------------------------------------------------------------
// Controls.
// ---------------------------------------------------------------------------

function wireControls() {
  el('upload').addEventListener('change', (event) => {
    [...event.target.files].forEach(upload);
    event.target.value = '';
  });
  el('fill-all').addEventListener('click', () => {
    const slot = studio.panels[studio.selected];
    if (!slot) return;
    studio.panels = studio.panels.map((entry) => ({ ...entry, photo: slot.photo }));
    paint();
    say('Every panel now shows the selected panel’s photo.');
  });
  el('reset-panel').addEventListener('click', () => {
    const slot = studio.panels[studio.selected];
    if (!slot) return;
    slot.zoom = 1;
    slot.ox = 0;
    slot.oy = 0;
    paint();
    say(`Panel ${studio.selected + 1} reframed.`);
  });
  el('zoom').addEventListener('input', (event) => {
    const slot = studio.panels[studio.selected];
    if (!slot) return;
    slot.zoom = Number(event.target.value);
    paint();
  });
  el('title').addEventListener('input', (event) => { studio.title = event.target.value; paint(); });
  el('subtitle').addEventListener('input', (event) => { studio.subtitle = event.target.value; paint(); });
  el('tag').addEventListener('input', (event) => { studio.tag = event.target.value; paint(); });
  el('poster-ink').addEventListener('change', (event) => {
    studio.posterInk = event.target.checked;
    paint();
    say(studio.posterInk ? 'Poster Ink finish on — halftone print look.' : 'Poster Ink finish off.');
  });
  el('seal').addEventListener('change', (event) => {
    studio.seal = event.target.checked;
    paint();
    say(studio.seal ? 'Seal stamp on.' : 'Seal stamp off.');
  });
  el('billing').addEventListener('input', (event) => { studio.billing = event.target.value; paint(); });
  el('show-billing').addEventListener('change', (event) => {
    studio.showBilling = event.target.checked;
    paint();
    say(studio.showBilling ? 'Billing block on.' : 'Billing block off.');
  });
  el('export').addEventListener('click', downloadPng);
}

/** Applies a scene patch from the screenshot driver: fresh panels for
 *  the layout, then the scene's own framing, and the controls follow. */
function applyPatch(patch) {
  Object.assign(studio, patch);
  studio.panels = slotsFor(studio.layoutId);
  if (patch.panels) studio.panels = patch.panels;
  markActive(el('layout-picker'), studio.layoutId);
  markActive(el('grade-picker'), studio.gradeId);
  markActive(el('size-picker'), studio.sizeId);
  el('title').value = studio.title;
  el('subtitle').value = studio.subtitle;
  el('tag').value = studio.tag;
  el('poster-ink').checked = studio.posterInk;
  el('seal').checked = studio.seal;
  el('billing').value = studio.billing;
  el('show-billing').checked = studio.showBilling;
  paint();
}

// ---------------------------------------------------------------------------
// Boot: build the pickers, wire the controls, paint once, then either
// run a fixed screenshot scene or load a cover for first paint.
// ---------------------------------------------------------------------------

studio.panels = slotsFor(studio.layoutId);
buildSampleButtons();
buildLayoutPicker();
buildGradePicker();
buildSizePicker();
wireControls();
refreshTray();
paint();

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, {
    loadSample: sample,
    loadSampleAsync: sampleAsync,
    setState: applyPatch,
    render: paint,
  });
} else {
  // A cover on first paint even before the maker picks a photo.
  sample('duo');
}

// Re-paint once the display fonts arrive, so the lettering is set in
// Anton and Archivo Black rather than the fallback stack.
if (document.fonts?.ready) {
  document.fonts.ready.then(() => paint());
  document.fonts.load('80px Anton').then(() => paint()).catch(() => {});
  document.fonts.load('bold 20px "Archivo Black"').then(() => paint()).catch(() => {});
}
