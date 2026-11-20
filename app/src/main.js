// Sunset State Cover Studio v2 — the editor.
// Wires the controls to the renderer: photo uploads and samples, per-panel
// crop and position (click a panel, drag to pan, wheel or slider to zoom),
// eight layouts, six Vice grades, editable caption, the Poster Ink finish,
// a seal stamp and an editable billing block, and PNG export in the three
// post sizes. Runs fully offline; photos never leave the machine.

import { LAYOUTS, GRADES, SIZES, SAMPLES, DEFAULT_BILLING, drawCoverArt, layoutById, gradeById, sizeById, panelAt } from './cover.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('preview');
const ctx = canvas.getContext('2d');

// The whole editor state. `panels` holds one slot per layout panel:
// { photo, zoom, ox, oy } — photo is an index into `photos`.
const state = {
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

function freshPanels(layoutId) {
  const layout = layoutById(layoutId);
  const keep = state.panels;
  return layout.panels.map((_, i) => keep[i] ?? { photo: 0, zoom: 1, ox: 0, oy: 0 });
}

function previewSize() {
  const s = sizeById(state.sizeId);
  // In cover-shot mode the canvas paints at full export resolution so the
  // screenshot stays crisp; the CSS scales it down to the viewport.
  if (document.body.classList.contains('shot-cover')) return { w: s.w, h: s.h };
  const max = 880;
  const scale = Math.min(max / s.w, max / s.h, 1);
  return { w: Math.round(s.w * scale), h: Math.round(s.h * scale) };
}

function render() {
  const { w, h } = previewSize();
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  drawCoverArt(ctx, w, h, state);
  syncPanelControls();
}

function setStatus(text) {
  $('status').textContent = text;
}

/** Loads an image from a URL (a sample) or a File (an upload) and adds it
 *  to the photo tray. The first photo fills every panel by default. */
function addPhoto(img, name) {
  const photo = { img, name };
  state.photos.push(photo);
  if (state.photos.length === 1) {
    state.panels = state.panels.map((p) => ({ ...p, photo: 0 }));
  }
  renderPhotoTray();
  render();
  return state.photos.length - 1;
}

/** Promise version of sample loading, for the fixed screenshot scenes:
 *  resolves with the new photo's index once the image has decoded. */
function loadSampleAsync(name) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(addPhoto(img, name));
    img.onerror = () => reject(new Error(`Could not load the ${name} sample.`));
    img.src = `samples/${name}.jpg`;
  });
}

function loadSample(name) {
  loadSampleAsync(name)
    .then(() => setStatus(`Loaded sample photo “${name}”. Click a panel, then drag to frame it.`))
    .catch(() => setStatus(`Could not load the ${name} sample.`));
}

function loadUpload(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      addPhoto(img, file.name.replace(/\.[^.]+$/, ''));
      setStatus(`Loaded “${file.name}” — it now fills the selected panel.`);
    };
    img.onerror = () => setStatus(`“${file.name}” is not a readable image.`);
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function renderPhotoTray() {
  const tray = $('photo-tray');
  tray.innerHTML = '';
  state.photos.forEach((photo, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thumb';
    button.title = `Use “${photo.name}” in the selected panel`;
    const thumb = document.createElement('img');
    thumb.src = photo.img.src;
    thumb.alt = photo.name;
    button.appendChild(thumb);
    button.addEventListener('click', () => {
      const slot = state.panels[state.selected];
      if (slot) slot.photo = i;
      render();
      setStatus(`Panel ${state.selected + 1} now shows “${photo.name}”.`);
    });
    tray.appendChild(button);
  });
  $('fill-all').disabled = state.photos.length === 0;
}

/** Builds the sample buttons, layout and grade pickers from the
 *  renderer's own lists, so the UI can never drift from what the cover
 *  actually draws. */
function buildPickers() {
  const sampleBox = $('sample-row');
  SAMPLES.forEach((sample) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mini';
    button.textContent = `Sample: ${sample.name}`;
    button.title = sample.blurb;
    button.addEventListener('click', () => loadSample(sample.id));
    sampleBox.appendChild(button);
  });
  const layoutBox = $('layout-picker');
  LAYOUTS.forEach((layout) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pick';
    button.dataset.id = layout.id;
    button.innerHTML = `<strong>${layout.name}</strong><span>${layout.blurb}</span>`;
    button.addEventListener('click', () => {
      state.layoutId = layout.id;
      state.panels = freshPanels(layout.id);
      state.selected = 0;
      document.querySelectorAll('#layout-picker .pick').forEach((b) => b.classList.toggle('on', b.dataset.id === layout.id));
      render();
      setStatus(`Layout: ${layout.name}.`);
    });
    layoutBox.appendChild(button);
  });
  const gradeBox = $('grade-picker');
  GRADES.forEach((grade) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'swatch';
    button.dataset.id = grade.id;
    button.title = grade.name;
    button.style.background = `linear-gradient(135deg, ${grade.sky[0]}, ${grade.sky[1]} 55%, ${grade.sky[2]})`;
    button.innerHTML = `<span>${grade.name}</span>`;
    button.addEventListener('click', () => {
      state.gradeId = grade.id;
      document.querySelectorAll('#grade-picker .swatch').forEach((b) => b.classList.toggle('on', b.dataset.id === grade.id));
      render();
      setStatus(`Grade: ${grade.name}.`);
    });
    gradeBox.appendChild(button);
  });
  document.querySelectorAll('#layout-picker .pick').forEach((b) => b.classList.toggle('on', b.dataset.id === state.layoutId));
  document.querySelectorAll('#grade-picker .swatch').forEach((b) => b.classList.toggle('on', b.dataset.id === state.gradeId));
}

function buildSizePicker() {
  const box = $('size-picker');
  SIZES.forEach((size) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pick';
    button.dataset.id = size.id;
    button.innerHTML = `<strong>${size.w} × ${size.h}</strong><span>${size.name}</span>`;
    button.addEventListener('click', () => {
      state.sizeId = size.id;
      document.querySelectorAll('#size-picker .pick').forEach((b) => b.classList.toggle('on', b.dataset.id === size.id));
      render();
      setStatus(`Previewing at ${size.w} × ${size.h}.`);
    });
    box.appendChild(button);
  });
  document.querySelectorAll('#size-picker .pick').forEach((b) => b.classList.toggle('on', b.dataset.id === state.sizeId));
}

function syncPanelControls() {
  const slot = state.panels[state.selected];
  $('panel-label').textContent = `Panel ${state.selected + 1} of ${state.panels.length}`;
  $('panel-photo').textContent = slot && state.photos[slot.photo]
    ? `Photo: ${state.photos[slot.photo].name}`
    : 'Photo: none yet — upload or pick a sample';
  $('zoom').value = slot ? String(slot.zoom) : '1';
  $('zoom-val').textContent = slot ? `${slot.zoom.toFixed(2)}×` : '1.00×';
}

/** Exports the current cover at exact post size and downloads the PNG. */
async function exportPng() {
  const size = sizeById(state.sizeId);
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCoverArt(off.getContext('2d'), size.w, size.h, state);
  const blob = await new Promise((resolve) => off.toBlob(resolve, 'image/png'));
  if (!blob) {
    setStatus('Export failed — the browser could not write the PNG.');
    return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `sunset-state-cover-${size.w}x${size.h}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  setStatus(`Exported ${size.w} × ${size.h} PNG — check your downloads.`);
}

// Canvas interaction: click selects a panel, drag pans its photo, wheel zooms.
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
  const hit = panelAt(state.layoutId, nx, ny);
  if (hit < 0) return;
  state.selected = hit;
  const slot = state.panels[hit];
  drag = { x: nx, y: ny, ox: slot.ox, oy: slot.oy };
  canvas.setPointerCapture(event.pointerId);
  render();
});

canvas.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const { nx, ny } = canvasPoint(event);
  const slot = state.panels[state.selected];
  const panel = layoutById(state.layoutId).panels[state.selected];
  slot.ox = Math.max(-1, Math.min(1, drag.ox + (nx - drag.x) / panel.w));
  slot.oy = Math.max(-1, Math.min(1, drag.oy + (ny - drag.y) / panel.h));
  render();
});

canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('pointercancel', () => { drag = null; });

canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  const slot = state.panels[state.selected];
  if (!slot) return;
  slot.zoom = Math.max(1, Math.min(3, slot.zoom * (event.deltaY < 0 ? 1.08 : 0.93)));
  render();
}, { passive: false });

// Controls.
$('upload').addEventListener('change', (event) => {
  [...event.target.files].forEach(loadUpload);
  event.target.value = '';
});
$('fill-all').addEventListener('click', () => {
  const slot = state.panels[state.selected];
  if (!slot) return;
  state.panels = state.panels.map((p) => ({ ...p, photo: slot.photo }));
  render();
  setStatus('Every panel now shows the selected panel’s photo.');
});
$('reset-panel').addEventListener('click', () => {
  const slot = state.panels[state.selected];
  if (!slot) return;
  slot.zoom = 1;
  slot.ox = 0;
  slot.oy = 0;
  render();
  setStatus(`Panel ${state.selected + 1} reframed.`);
});
$('zoom').addEventListener('input', (event) => {
  const slot = state.panels[state.selected];
  if (!slot) return;
  slot.zoom = Number(event.target.value);
  render();
});
$('title').addEventListener('input', (event) => { state.title = event.target.value; render(); });
$('subtitle').addEventListener('input', (event) => { state.subtitle = event.target.value; render(); });
$('tag').addEventListener('input', (event) => { state.tag = event.target.value; render(); });
$('poster-ink').addEventListener('change', (event) => {
  state.posterInk = event.target.checked;
  render();
  setStatus(state.posterInk ? 'Poster Ink finish on — halftone print look.' : 'Poster Ink finish off.');
});
$('seal').addEventListener('change', (event) => {
  state.seal = event.target.checked;
  render();
  setStatus(state.seal ? 'Seal stamp on.' : 'Seal stamp off.');
});
$('billing').addEventListener('input', (event) => { state.billing = event.target.value; render(); });
$('show-billing').addEventListener('change', (event) => {
  state.showBilling = event.target.checked;
  render();
  setStatus(state.showBilling ? 'Billing block on.' : 'Billing block off.');
});
$('export').addEventListener('click', exportPng);

// Boot: build the pickers, wait for the display fonts, then paint.
state.panels = freshPanels(state.layoutId);
buildPickers();
buildSizePicker();
renderPhotoTray();
render();

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, {
    loadSample,
    loadSampleAsync,
    setState(patch) {
      Object.assign(state, patch);
      state.panels = freshPanels(state.layoutId);
      if (patch.panels) state.panels = patch.panels;
      document.querySelectorAll('#layout-picker .pick').forEach((b) => b.classList.toggle('on', b.dataset.id === state.layoutId));
      document.querySelectorAll('#grade-picker .swatch').forEach((b) => b.classList.toggle('on', b.dataset.id === state.gradeId));
      document.querySelectorAll('#size-picker .pick').forEach((b) => b.classList.toggle('on', b.dataset.id === state.sizeId));
      $('title').value = state.title;
      $('subtitle').value = state.subtitle;
      $('tag').value = state.tag;
      $('poster-ink').checked = state.posterInk;
      $('seal').checked = state.seal;
      $('billing').value = state.billing;
      $('show-billing').checked = state.showBilling;
      render();
    },
    render,
  });
} else {
  // A cover on first paint even before the maker picks a photo.
  loadSample('duo');
}

if (document.fonts?.ready) {
  document.fonts.ready.then(() => render());
  document.fonts.load('80px Anton').then(() => render()).catch(() => {});
  document.fonts.load('bold 20px "Archivo Black"').then(() => render()).catch(() => {});
}
