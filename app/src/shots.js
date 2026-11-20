// Fixed scenes for screenshots: ?shot=editor shows the page with sample
// photos loaded; ?shot=cover shows the cover alone, filling the viewport.
// Query knobs: photo (one sample) or photos (comma-separated samples, one
// per panel in order), caption, subtitle, tag, layout, grade, size,
// posterInk (1/0), seal (1/0), billing, showBilling (1/0), pan (comma
// list of vertical pan fractions, one per panel) and panx (same, horizontal).
// window.__shotReady is set once the scene has painted.
export async function runShot(shot, query, hooks) {
  const layout = query.get('layout') ?? 'hero';
  const grade = query.get('grade') ?? 'sunset';
  const size = query.get('size') ?? 'square';
  const title = query.get('caption') ?? 'Neon Getaway';
  const subtitle = query.get('subtitle') ?? 'One last ride down Ocean Drive';
  const tag = query.get('tag') ?? 'Sunset State';
  const posterInk = query.get('posterInk') === '1';
  const seal = query.get('seal') !== '0';
  const showBilling = query.get('showBilling') !== '0';
  const billing = query.get('billing') ?? undefined;
  const pan = (query.get('pan') ?? '').split(',').map((s) => Number(s) || 0);
  const panx = (query.get('panx') ?? '').split(',').map((s) => Number(s) || 0);
  const names = query.get('photos')
    ? query.get('photos').split(',').map((s) => s.trim()).filter(Boolean)
    : [query.get('photo') ?? 'duo'];

  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (shot === 'editor') document.body.classList.add('shot-editor');

  // Load every sample first so the panels can be dealt one photo each,
  // in the order the scene names them.
  const indices = [];
  for (const name of names) {
    indices.push(await hooks.loadSampleAsync(name));
  }
  const patch = { layoutId: layout, gradeId: grade, sizeId: size, title, subtitle, tag, posterInk, seal, showBilling };
  if (billing !== undefined) patch.billing = billing;
  hooks.setState(patch);

  // Deal the loaded photos across the layout's panels, one per panel,
  // wrapping when the scene names fewer photos than panels. The pan and
  // panx lists nudge each panel's framing so faces and cars land in frame.
  if (indices.length > 0) {
    hooks.setState({
      panels: Array.from({ length: 8 }, (_, i) => ({
        photo: indices[i % indices.length], zoom: 1, ox: panx[i] ?? 0, oy: pan[i] ?? 0,
      })),
    });
  }

  // Wait for the sample photos and the display fonts, then paint twice so
  // the canvas holds the final frame before the screenshot is taken.
  await document.fonts?.ready.catch(() => {});
  await new Promise((resolve) => setTimeout(resolve, 350));
  hooks.render();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
