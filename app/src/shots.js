// Fixed scenes for screenshots: ?shot=editor shows the page with sample
// photos loaded; ?shot=cover shows the cover alone, filling the viewport.
// Query knobs: photo (one sample) or photos (comma-separated samples, one
// per panel in order), caption, subtitle, tag, layout, grade, size,
// posterInk (1/0), seal (1/0), billing, showBilling (1/0), pan (comma
// list of vertical pan fractions, one per panel) and panx (same,
// horizontal). window.__shotReady is set once the scene has painted.

/** Reads the scene out of the query string: which samples, which
 *  layout and grade, the caption lines, the finish toggles, and the
 *  per-panel framing nudges. Missing knobs fall back to the defaults
 *  the editor opens with. */
function readScene(query) {
  const numbers = (key) => (query.get(key) ?? '')
    .split(',')
    .map((part) => Number(part) || 0);
  const names = query.get('photos')
    ? query.get('photos').split(',').map((part) => part.trim()).filter(Boolean)
    : [query.get('photo') ?? 'duo'];
  return {
    layout: query.get('layout') ?? 'hero',
    grade: query.get('grade') ?? 'sunset',
    size: query.get('size') ?? 'square',
    title: query.get('caption') ?? 'Neon Getaway',
    subtitle: query.get('subtitle') ?? 'One last ride down Ocean Drive',
    tag: query.get('tag') ?? 'Sunset State',
    posterInk: query.get('posterInk') === '1',
    seal: query.get('seal') !== '0',
    showBilling: query.get('showBilling') !== '0',
    billing: query.get('billing') ?? undefined,
    pans: numbers('pan'),
    pansX: numbers('panx'),
    names,
  };
}

export async function runShot(shot, query, hooks) {
  const scene = readScene(query);
  const coverOnly = shot === 'cover';
  document.body.classList.add(coverOnly ? 'shot-cover' : 'shot-editor');

  // Load every sample first so the panels can be dealt one photo each,
  // in the order the scene names them.
  const indices = [];
  for (const name of scene.names) {
    indices.push(await hooks.loadSampleAsync(name));
  }

  const patch = {
    layoutId: scene.layout,
    gradeId: scene.grade,
    sizeId: scene.size,
    title: scene.title,
    subtitle: scene.subtitle,
    tag: scene.tag,
    posterInk: scene.posterInk,
    seal: scene.seal,
    showBilling: scene.showBilling,
  };
  if (scene.billing !== undefined) patch.billing = scene.billing;
  hooks.setState(patch);

  // Deal the loaded photos across the layout's panels, one per panel,
  // wrapping when the scene names fewer photos than panels. The pan
  // and panx lists nudge each panel's framing so faces and cars land
  // in frame.
  if (indices.length > 0) {
    const framed = Array.from({ length: 8 }, (_, i) => ({
      photo: indices[i % indices.length],
      zoom: 1,
      ox: scene.pansX[i] ?? 0,
      oy: scene.pans[i] ?? 0,
    }));
    hooks.setState({ panels: framed });
  }

  // Wait for the sample photos and the display fonts, then paint twice
  // so the canvas holds the final frame before the screenshot is taken.
  await document.fonts?.ready.catch(() => {});
  await new Promise((resolve) => setTimeout(resolve, 350));
  hooks.render();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
