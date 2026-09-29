/**
 * Function plotter built on <Stage>.
 *
 * Declarative props describe what to draw in *world* coordinates:
 *   fns    — [{ f, color, width, dash, domain, glow }]
 *   points — [{ x, y, color, r, label, ring }]
 *   lines  — [{ x1, y1, x2, y2, color, width, dash }]
 * plus an optional `draw(ctx, view)` escape hatch for custom art.
 * Colours may be CSS colours or theme keys ('accent', 's1'…'s5', 'good', 'bad', 'muted'…).
 * `onPointer(type, {x, y, px, py}, dragging)` reports pointer events in world units.
 * @module Plot
 */
import Stage from './Stage.jsx';

/** Font stack for canvas text (canvas can't read CSS variables). */
export const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, "Segoe UI", Roboto, sans-serif';

/** Build a world↔pixel transform for a canvas of the given size. */
export function makeView(xRange, yRange, width, height, pad = 0, equal = false) {
  let [x0, x1] = xRange;
  let [y0, y1] = yRange;
  let sx = (width - 2 * pad) / (x1 - x0);
  let sy = (height - 2 * pad) / (y1 - y0);
  if (equal) {
    // Same scale on both axes: widen whichever range has spare room, keeping it centred.
    const k = Math.min(sx, sy);
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const hw = (width - 2 * pad) / k / 2;
    const hh = (height - 2 * pad) / k / 2;
    [x0, x1, y0, y1] = [cx - hw, cx + hw, cy - hh, cy + hh];
    sx = sy = k;
  }
  xRange = [x0, x1];
  yRange = [y0, y1];
  return {
    x: xRange,
    y: yRange,
    width,
    height,
    sx,
    sy,
    toPx: (x, y) => [pad + (x - x0) * sx, height - pad - (y - y0) * sy],
    toWorld: (px, py) => ({ x: x0 + (px - pad) / sx, y: y0 + (height - pad - py) / sy }),
  };
}

function niceStep(span, target = 8) {
  const raw = span / target;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * pow;
}

function drawGrid(ctx, view, colors, { grid, axes, ticks }) {
  const { x, y, toPx, width, height } = view;
  const stepX = niceStep(x[1] - x[0]);
  const stepY = niceStep(y[1] - y[0], 6);
  ctx.lineWidth = 1;
  if (grid) {
    ctx.strokeStyle = colors.grid;
    ctx.beginPath();
    for (let gx = Math.ceil(x[0] / stepX) * stepX; gx <= x[1]; gx += stepX) {
      const [px] = toPx(gx, 0);
      ctx.moveTo(px + 0.5, 0);
      ctx.lineTo(px + 0.5, height);
    }
    for (let gy = Math.ceil(y[0] / stepY) * stepY; gy <= y[1]; gy += stepY) {
      const [, py] = toPx(0, gy);
      ctx.moveTo(0, py + 0.5);
      ctx.lineTo(width, py + 0.5);
    }
    ctx.stroke();
  }
  if (axes) {
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const [ox, oy] = toPx(0, 0);
    if (y[0] <= 0 && y[1] >= 0) {
      ctx.moveTo(0, oy);
      ctx.lineTo(width, oy);
    }
    if (x[0] <= 0 && x[1] >= 0) {
      ctx.moveTo(ox, 0);
      ctx.lineTo(ox, height);
    }
    ctx.stroke();
  }
  if (ticks) {
    ctx.fillStyle = colors.muted;
    ctx.font = `11px ${FONT}`;
    const [ox, oy] = toPx(0, 0);
    const labelY = Math.min(Math.max(oy + 14, 14), height - 4);
    const labelX = Math.min(Math.max(ox + 4, 4), width - 24);
    ctx.textAlign = 'center';
    for (let gx = Math.ceil(x[0] / stepX) * stepX; gx <= x[1]; gx += stepX) {
      if (Math.abs(gx) < 1e-9) continue;
      const [px] = toPx(gx, 0);
      ctx.fillText(ticks.formatX ? ticks.formatX(gx) : +gx.toFixed(2), px, labelY);
    }
    ctx.textAlign = 'left';
    for (let gy = Math.ceil(y[0] / stepY) * stepY; gy <= y[1]; gy += stepY) {
      if (Math.abs(gy) < 1e-9) continue;
      const [, py] = toPx(0, gy);
      ctx.fillText(ticks.formatY ? ticks.formatY(gy) : +gy.toFixed(2), labelX, py - 3);
    }
  }
}

/** Stroke y = f(x) by sampling every pixel column, breaking at discontinuities. */
export function strokeFunction(ctx, view, { f, color, width = 3, dash, domain, glow, alpha = 1 }) {
  const [a, b] = domain || view.x;
  const lo = Math.max(a, view.x[0]);
  const hi = Math.min(b, view.x[1]);
  if (hi <= lo) return;
  const n = Math.max(2, Math.ceil(((hi - lo) * view.sx) / 1.5));
  const span = view.y[1] - view.y[0];
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
  }
  ctx.beginPath();
  let pen = false;
  let prevY = null;
  for (let i = 0; i <= n; i++) {
    const x = lo + ((hi - lo) * i) / n;
    const y = f(x);
    const ok = Number.isFinite(y) && Math.abs(y) < span * 1e3;
    if (!ok || (prevY !== null && Math.abs(y - prevY) > span * 3)) {
      pen = false;
      prevY = ok ? y : null;
      continue;
    }
    const cy = Math.max(Math.min(y, view.y[1] + span * 2), view.y[0] - span * 2);
    const [px, py] = view.toPx(x, cy);
    if (pen) ctx.lineTo(px, py);
    else ctx.moveTo(px, py);
    pen = true;
    prevY = y;
  }
  ctx.stroke();
  ctx.restore();
}

export default function Plot({
  x = [-5, 5],
  y = [-5, 5],
  height = 320,
  fns = [],
  points = [],
  lines = [],
  grid = true,
  axes = true,
  ticks = true,
  xLabel,
  yLabel,
  draw,
  underlay,
  onPointer,
  ariaLabel = 'Graph',
  cursor,
  className,
  equal = false,
}) {
  const handler = (type) =>
    onPointer
      ? (p, e, dragging) => {
          const view = makeView(x, y, p.width, p.height, 0, equal);
          onPointer(type, { ...view.toWorld(p.px, p.py), px: p.px, py: p.py }, dragging, e);
        }
      : undefined;

  return (
    <Stage
      height={height}
      ariaLabel={ariaLabel}
      className={className}
      cursor={cursor ?? (onPointer ? 'crosshair' : undefined)}
      onPointerDown={handler('down')}
      onPointerMove={handler('move')}
      onPointerUp={handler('up')}
      draw={(ctx, { width, height: h, colors }) => {
        const view = { ...makeView(x, y, width, h, 0, equal), colors };
        const col = (c, fallback) => (c && colors[c]) || c || fallback;
        underlay?.(ctx, view);
        drawGrid(ctx, view, colors, { grid, axes, ticks });
        for (const fn of fns) strokeFunction(ctx, view, { ...fn, color: col(fn.color, colors.accent) });
        for (const l of lines) {
          ctx.save();
          ctx.strokeStyle = col(l.color, colors.text);
          ctx.lineWidth = l.width || 2;
          if (l.dash) ctx.setLineDash(l.dash);
          ctx.globalAlpha = l.alpha ?? 1;
          ctx.beginPath();
          ctx.moveTo(...view.toPx(l.x1, l.y1));
          ctx.lineTo(...view.toPx(l.x2, l.y2));
          ctx.stroke();
          ctx.restore();
        }
        for (const p of points) {
          const [px, py] = view.toPx(p.x, p.y);
          ctx.save();
          if (p.ring) {
            ctx.strokeStyle = col(p.color, colors.accent);
            ctx.globalAlpha = 0.35;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(px, py, (p.r || 7) + 6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
          ctx.fillStyle = col(p.color, colors.accent);
          ctx.strokeStyle = colors.surface;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(px, py, p.r || 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          if (p.label) {
            ctx.fillStyle = colors.text;
            ctx.font = `600 13px ${FONT}`;
            ctx.textAlign = 'center';
            ctx.fillText(p.label, px, py - (p.r || 7) - 8);
          }
          ctx.restore();
        }
        if (xLabel || yLabel) {
          const [ox, oy] = view.toPx(0, 0);
          ctx.fillStyle = colors.muted;
          ctx.font = `12px ${FONT}`;
          if (xLabel) {
            ctx.textAlign = 'right';
            ctx.fillText(xLabel, width - 8, Math.min(Math.max(oy - 8, 14), h - 6));
          }
          if (yLabel) {
            ctx.textAlign = 'left';
            ctx.fillText(yLabel, Math.min(Math.max(ox + 8, 8), width - 120), 16);
          }
        }
        draw?.(ctx, view);
      }}
    />
  );
}
