// Fixed scenes for screenshots: ?shot=editor shows the page with a sample
// photo loaded; ?shot=cover shows the cover alone, filling the viewport.
// Query knobs: photo (pier|boulevard), caption, subtitle, tag, layout,
// grade, size. window.__shotReady is set once the scene has painted.
export async function runShot(shot, query, hooks) {
  const layout = query.get('layout') ?? 'hero';
  const grade = query.get('grade') ?? 'sunset';
  const size = query.get('size') ?? 'square';
  const title = query.get('caption') ?? 'Sunset Heist';
  const subtitle = query.get('subtitle') ?? 'One last ride down Ocean Drive';
  const tag = query.get('tag') ?? 'Sunset State';
  const photo = query.get('photo') ?? 'pier';

  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (shot === 'editor') document.body.classList.add('shot-editor');

  hooks.setState({ layoutId: layout, gradeId: grade, sizeId: size, title, subtitle, tag });
  hooks.loadSample(photo);

  // Wait for the sample photo and the display fonts, then paint twice so
  // the canvas holds the final frame before the screenshot is taken.
  await document.fonts?.ready.catch(() => {});
  await new Promise((resolve) => setTimeout(resolve, 350));
  hooks.render();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
