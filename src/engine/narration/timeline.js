/**
 * One timeline drives the explainer: animation scene, captions and narration
 * all read the same clock value `t` (seconds). These pure helpers turn `t`
 * into what should be on screen.
 * @module engine/narration/timeline
 */

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);

/** Caption visible at time t (or null between captions). */
export function captionAt(captions, t) {
  return captions.find((c) => t >= c.t0 && t < c.t1) ?? null;
}

/** Index of the caption at time t, -1 if none. */
export const captionIndexAt = (captions, t) => captions.findIndex((c) => t >= c.t0 && t < c.t1);

/**
 * Scene state at time t. Actions:
 *  - scene      { focus }            which apparatus part is highlighted
 *  - fill       { from, to }         simulation minutes advance from→to over the event
 *  - shade      { from, to }         area under Q is shaded up to (animated) minute
 *  - rectangles { from, to, method } rectangle count grows from→to (integers)
 *  - equation   {}                   equation becomes visible (fades in)
 *  - label      { text, target }     annotation shown during the event
 * Later events win; finished fill/shade/equation events persist.
 */
export function sceneAt(timeline, t) {
  const state = { simTime: 0, shadeTo: 0, rects: null, equation: 0, labels: [], focus: null };
  for (const ev of [...timeline].sort((a, b) => a.t0 - b.t0)) {
    if (t < ev.t0) continue;
    const p = ev.params ?? {};
    const k = ease(clamp01((t - ev.t0) / (ev.t1 - ev.t0)));
    const active = t < ev.t1;
    switch (ev.action) {
      case 'scene':
        if (active) state.focus = p.focus ?? null;
        break;
      case 'fill':
        state.simTime = p.from + (p.to - p.from) * k;
        break;
      case 'shade':
        state.shadeTo = p.from + (p.to - p.from) * k;
        break;
      case 'rectangles':
        state.rects = active || p.persist ? { n: Math.max(1, Math.round(p.from + (p.to - p.from) * k)), method: p.method ?? 'left' } : null;
        break;
      case 'equation':
        state.equation = k;
        break;
      case 'label':
        if (active) state.labels.push({ id: ev.id, text: p.text, target: p.target ?? 'graph' });
        break;
      default:
        break;
    }
  }
  return state;
}
