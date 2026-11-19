// Sunset State Cover Studio — the cover renderer.
// Draws a multi-panel GTA-style poster cover onto any 2D canvas context:
// the user's photos fill the panels (each cropped and positioned on its own),
// a Vice colour grade washes over everything, and the caption is set in
// heavy extruded 3D lettering. All geometry is normalised (0..1) so the same
// cover renders at 1080x1080, 1080x1350 and 1920x1080 without changes.

/** The six panel layouts. `panels` are normalised rects; `slant` shears a
 *  panel's left and right edges for the comic-book diagonal look. `title`
 *  is the normalised band the caption lives in. */
export const LAYOUTS = [
  {
    id: 'hero',
    name: 'Hero Multi-Panel',
    blurb: 'One big hero shot, two stacked side panels',
    panels: [
      { x: 0, y: 0, w: 0.615, h: 1 },
      { x: 0.63, y: 0, w: 0.37, h: 0.49 },
      { x: 0.63, y: 0.505, w: 0.37, h: 0.495 },
    ],
    title: { x: 0.03, y: 0.72, w: 0.94, h: 0.25, align: 'left' },
  },
  {
    id: 'comic',
    name: 'Comic Slash',
    blurb: 'Three diagonal slashed panels',
    panels: [
      { x: 0, y: 0, w: 0.38, h: 1, slant: 0.07 },
      { x: 0.355, y: 0, w: 0.38, h: 1, slant: 0.07 },
      { x: 0.71, y: 0, w: 0.29, h: 1, slant: 0.07 },
    ],
    title: { x: 0.04, y: 0.74, w: 0.92, h: 0.23, align: 'left' },
  },
  {
    id: 'grid',
    name: 'Grid Cast',
    blurb: 'Four-panel cast grid with a title band',
    panels: [
      { x: 0, y: 0, w: 0.492, h: 0.415 },
      { x: 0.508, y: 0, w: 0.492, h: 0.415 },
      { x: 0, y: 0.43, w: 0.492, h: 0.415 },
      { x: 0.508, y: 0.43, w: 0.492, h: 0.415 },
    ],
    title: { x: 0.04, y: 0.865, w: 0.92, h: 0.115, align: 'center' },
  },
  {
    id: 'single',
    name: 'Single Hero',
    blurb: 'One full-bleed photo, caption on top',
    panels: [{ x: 0, y: 0, w: 1, h: 1 }],
    title: { x: 0.05, y: 0.7, w: 0.9, h: 0.27, align: 'center' },
  },
  {
    id: 'split',
    name: 'Split Duotone',
    blurb: 'Two halves, one story, duotone grade',
    panels: [
      { x: 0, y: 0, w: 0.492, h: 1 },
      { x: 0.508, y: 0, w: 0.492, h: 1 },
    ],
    title: { x: 0.04, y: 0.72, w: 0.92, h: 0.25, align: 'center' },
  },
  {
    id: 'trio',
    name: 'Trio Strip',
    blurb: 'Three tall strips side by side',
    panels: [
      { x: 0, y: 0, w: 0.325, h: 1 },
      { x: 0.3375, y: 0, w: 0.325, h: 1 },
      { x: 0.675, y: 0, w: 0.325, h: 1 },
    ],
    title: { x: 0.04, y: 0.74, w: 0.92, h: 0.23, align: 'left' },
  },
];

/** The six Vice colour grades. `filter` is a canvas filter applied when the
 *  photo is painted; `wash` is a vertical colour wash laid over the whole
 *  cover; `sky` colours the background and the sun disc; the rest colour
 *  the lettering. */
export const GRADES = [
  {
    id: 'sunset',
    name: 'Vice Sunset',
    filter: 'saturate(1.5) contrast(1.1) sepia(0.22) brightness(1.03)',
    wash: ['rgba(255,122,26,0.16)', 'rgba(214,32,120,0.26)'],
    sky: ['#ff9e2c', '#ff5e7a', '#8b2a86'],
    sun: '#ffd23f',
    ink: '#fff6d8',
    ink2: '#ffb347',
    extrude: '#4a0e4e',
    outline: '#2b0633',
    accent: '#ffd23f',
    scrim: 'rgba(30,4,46,0.72)',
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    filter: 'saturate(1.9) contrast(1.16) hue-rotate(-18deg) brightness(1.02)',
    wash: ['rgba(0,229,255,0.14)', 'rgba(255,0,160,0.24)'],
    sky: ['#00e5ff', '#b537f2', '#ff0080'],
    sun: '#ff2fb3',
    ink: '#eafcff',
    ink2: '#7df9ff',
    extrude: '#12003d',
    outline: '#ff2fb3',
    accent: '#00e5ff',
    scrim: 'rgba(10,2,40,0.72)',
  },
  {
    id: 'gold',
    name: 'Golden Hour',
    filter: 'saturate(1.4) contrast(1.06) sepia(0.38) brightness(1.06)',
    wash: ['rgba(255,190,60,0.20)', 'rgba(160,60,10,0.18)'],
    sky: ['#ffd76a', '#ff9a3d', '#c25e1e'],
    sun: '#fff3b0',
    ink: '#fffbe8',
    ink2: '#ffc53d',
    extrude: '#4d2200',
    outline: '#2e1500',
    accent: '#ff9a3d',
    scrim: 'rgba(46,18,0,0.66)',
  },
  {
    id: 'teal',
    name: 'Teal Noir',
    filter: 'saturate(1.25) contrast(1.18) hue-rotate(12deg) brightness(0.96)',
    wash: ['rgba(0,180,180,0.16)', 'rgba(4,20,40,0.30)'],
    sky: ['#0affd2', '#0a7d8c', '#04122b'],
    sun: '#9ff5e3',
    ink: '#e8fff8',
    ink2: '#5eead4',
    extrude: '#02131f',
    outline: '#00e5c0',
    accent: '#0affd2',
    scrim: 'rgba(2,12,24,0.74)',
  },
  {
    id: 'pink',
    name: 'Bubblegum Vice',
    filter: 'saturate(1.75) contrast(1.1) hue-rotate(8deg) brightness(1.05)',
    wash: ['rgba(255,120,200,0.18)', 'rgba(140,40,200,0.26)'],
    sky: ['#ff9ecf', '#ff5ea8', '#7b2ff7'],
    sun: '#ffe3f2',
    ink: '#fff0f8',
    ink2: '#ff8fd1',
    extrude: '#3d0a4d',
    outline: '#ff5ea8',
    accent: '#ffd23f',
    scrim: 'rgba(48,6,64,0.70)',
  },
  {
    id: 'mono',
    name: 'Mono Pop',
    filter: 'grayscale(1) contrast(1.28) brightness(1.05)',
    wash: ['rgba(255,255,255,0.05)', 'rgba(0,0,0,0.22)'],
    sky: ['#e8e8e8', '#8a8a8a', '#1c1c1c'],
    sun: '#ffffff',
    ink: '#ffffff',
    ink2: '#d9d9d9',
    extrude: '#000000',
    outline: '#ff2fb3',
    accent: '#ff2fb3',
    scrim: 'rgba(0,0,0,0.72)',
  },
];

/** The three export sizes, in pixels. */
export const SIZES = [
  { id: 'square', name: 'Square', w: 1080, h: 1080 },
  { id: 'portrait', name: 'Portrait', w: 1080, h: 1350 },
  { id: 'landscape', name: 'Landscape', w: 1920, h: 1080 },
];

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}

export function sizeById(id) {
  return SIZES.find((s) => s.id === id) ?? SIZES[0];
}

/** Builds the slanted panel path for one normalised panel rect. */
function panelPath(ctx, W, H, p) {
  const x = p.x * W;
  const y = p.y * H;
  const w = p.w * W;
  const h = p.h * H;
  const s = (p.slant ?? 0) * W;
  ctx.beginPath();
  ctx.moveTo(x + s, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w - s, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
}

/** Paints one photo into one panel, cover-fitting it and applying the
 *  panel's own zoom and pan (ox/oy are fractions of the panel). */
function paintPanelPhoto(ctx, W, H, panel, photo, grade) {
  const px = panel.x * W;
  const py = panel.y * H;
  const pw = panel.w * W;
  const ph = panel.h * H;
  ctx.save();
  panelPath(ctx, W, H, panel);
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
    ctx.filter = grade.filter;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.filter = 'none';
  } else {
    const g = ctx.createLinearGradient(px, py, px + pw, py + ph);
    g.addColorStop(0, '#3a2b4d');
    g.addColorStop(1, '#1c1030');
    ctx.fillStyle = g;
    ctx.fillRect(px, py, pw, ph);
  }
  ctx.restore();
}

/** Draws the caption in heavy extruded 3D lettering: a stack of offset
 *  copies in the extrude colour, a gradient face, and a hard outline. */
function drawExtrudedTitle(ctx, text, cx, baselineY, size, grade, align, maxWidth) {
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
  const step = Math.max(1.5, fit * 0.016);
  const depth = Math.max(4, Math.round(fit * 0.055));
  ctx.fillStyle = grade.extrude;
  for (let i = depth; i >= 1; i -= 1) {
    ctx.fillText(text, cx + i * step, baselineY + i * step);
  }
  const grad = ctx.createLinearGradient(0, baselineY - fit, 0, baselineY + fit * 0.15);
  grad.addColorStop(0, grade.ink);
  grad.addColorStop(1, grade.ink2);
  ctx.fillStyle = grad;
  ctx.fillText(text, cx, baselineY);
  ctx.lineWidth = Math.max(1.5, fit * 0.028);
  ctx.strokeStyle = grade.outline;
  ctx.strokeText(text, cx, baselineY);
}

/** Draws the whole cover. `state` carries layoutId, gradeId, title,
 *  subtitle, tag, photos (array of {img}) and panels (one per layout panel,
 *  each {photo, zoom, ox, oy} where photo is an index into photos). */
export function drawCoverArt(ctx, W, H, state) {
  const layout = layoutById(state.layoutId);
  const grade = gradeById(state.gradeId);
  const panels = state.panels ?? [];

  // Sky backdrop: the grade's sunset gradient fills every gutter.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(0.55, grade.sky[1]);
  sky.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Photos, one per panel.
  layout.panels.forEach((panel, i) => {
    const slot = panels[i] ?? { photo: 0, zoom: 1, ox: 0, oy: 0 };
    const photo = state.photos?.[slot.photo] ?? null;
    paintPanelPhoto(ctx, W, H, panel, photo, grade);
  });

  // White gutters: a crisp frame around every panel.
  const frame = Math.max(3, Math.round(W * 0.004));
  ctx.lineWidth = frame;
  ctx.strokeStyle = '#ffffff';
  layout.panels.forEach((panel) => {
    panelPath(ctx, W, H, panel);
    ctx.stroke();
  });

  // Whole-cover colour wash for the grade.
  const wash = ctx.createLinearGradient(0, 0, 0, H);
  wash.addColorStop(0, grade.wash[0]);
  wash.addColorStop(1, grade.wash[1]);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);

  // Sun disc glowing behind the caption, low in the title band like a
  // setting sun sinking behind the lettering.
  const t = layout.title;
  const sunR = Math.min(W, H) * 0.13;
  const sunX = t.align === 'center' ? W / 2 : (t.x + t.w / 2) * W;
  const sunY = (t.y + t.h * 0.72) * H;
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

  // Scrim so the lettering always reads.
  const scrim = ctx.createLinearGradient(0, t.y * H - H * 0.06, 0, (t.y + t.h) * H);
  scrim.addColorStop(0, 'rgba(0,0,0,0)');
  scrim.addColorStop(1, grade.scrim);
  ctx.fillStyle = scrim;
  ctx.fillRect(0, t.y * H - H * 0.06, W, (t.h + 0.06) * H);

  // Tag pill, top-left, when the maker wrote one.
  const tag = (state.tag ?? '').trim().toUpperCase();
  if (tag) {
    const pad = Math.max(10, W * 0.012);
    ctx.font = `bold ${Math.max(13, W * 0.016)}px "Archivo Black", sans-serif`;
    const tw = ctx.measureText(tag).width;
    const th = Math.max(22, W * 0.032);
    ctx.fillStyle = grade.accent;
    const bx = W * 0.03;
    const by = H * 0.03;
    ctx.beginPath();
    ctx.roundRect(bx, by, tw + pad * 2, th, th / 2);
    ctx.fill();
    ctx.fillStyle = '#14001f';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag, bx + pad, by + th / 2 + 1);
    ctx.textBaseline = 'alphabetic';
  }

  // Title + subtitle in the title band.
  const title = (state.title ?? '').trim().toUpperCase();
  const align = t.align === 'center' ? 'center' : 'left';
  const cx = align === 'center' ? W / 2 : t.x * W;
  const maxW = t.w * W;
  if (title) {
    const size = Math.min(t.h * H * 0.62, W * 0.115);
    const baseline = (t.y + t.h * 0.62) * H;
    drawExtrudedTitle(ctx, title, cx, baseline, size, grade, align, maxW);
  }
  const subtitle = (state.subtitle ?? '').trim();
  if (subtitle) {
    const subSize = Math.max(14, Math.min(W * 0.026, t.h * H * 0.2));
    ctx.font = `bold ${subSize}px "Archivo Black", sans-serif`;
    ctx.textAlign = align;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = subSize * 0.3;
    const subY = (t.y + t.h * 0.9) * H;
    ctx.fillText(subtitle.toUpperCase(), cx, subY);
    ctx.shadowBlur = 0;
  }
}

/** Finds which layout panel (index) contains normalised point (nx, ny),
 *  or -1 when the point is in a gutter. Slanted panels are hit-tested
 *  against their parallelogram. */
export function panelAt(layoutId, nx, ny) {
  const layout = layoutById(layoutId);
  for (let i = layout.panels.length - 1; i >= 0; i -= 1) {
    const p = layout.panels[i];
    const s = p.slant ?? 0;
    const left = p.x + s * (1 - (ny - p.y) / Math.max(0.001, p.h));
    const right = p.x + p.w - s * ((ny - p.y) / Math.max(0.001, p.h));
    if (nx >= left && nx <= right && ny >= p.y && ny <= p.y + p.h) return i;
  }
  return -1;
}
