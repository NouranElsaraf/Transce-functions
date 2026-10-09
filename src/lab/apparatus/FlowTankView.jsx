/**
 * The experiment bench: a tank with a litre scale, inlet valve, flow meter and
 * overflow pipe, beside the flow-rate graph. Both are drawn from the same
 * state (time, valve, shading, rectangles), so they can never disagree.
 *
 * Used by the flow-tank experiment, the animated explainer and the rectangle
 * stage. Purely presentational: callers own the clock and controls.
 * @module lab/apparatus/FlowTankView
 */
import { useRef } from 'react';
import Stage from '../../components/Stage.jsx';
import Plot from '../../components/Plot.jsx';
import { exactVolume, flowAt, tankAt } from '../../engine/math/accumulation.js';
import { useLabColors } from './useLabColors.js';
import { fmt } from '../format.js';

const scaled = (profile, valve) => profile.map(([t, q]) => [t, q * valve]);

function drawTank(ctx, w, h, c, s) {
  ctx.direction = 'ltr'; // scale labels like "500 L" must not be mirrored by the RTL page
  const tankW = Math.min(w * 0.42, 190);
  const tankH = h - 70;
  const x0 = w * 0.5 - tankW * 0.35;
  const y0 = 46;
  const yBottom = y0 + tankH;

  // Litre scale on the left wall.
  ctx.font = '11px ui-monospace, "SF Mono", Menlo, monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = c.inkSoft;
  ctx.strokeStyle = c.inkSoft;
  const step = s.capacity <= 600 ? 50 : 100;
  for (let v = 0; v <= s.capacity + 1e-9; v += step) {
    const y = yBottom - (v / s.capacity) * tankH;
    const major = v % (step * 2) === 0;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0 - (major ? 12 : 7), y);
    ctx.lineTo(x0, y);
    ctx.stroke();
    if (major) ctx.fillText(`${v} L`, x0 - 15, y + 4);
  }

  // Water.
  const level = s.volume / s.capacity;
  const waterTop = yBottom - level * tankH;
  if (level > 0) {
    const g = ctx.createLinearGradient(0, waterTop, 0, yBottom);
    g.addColorStop(0, c.water);
    g.addColorStop(1, c.waterDeep);
    ctx.fillStyle = g;
    ctx.beginPath();
    const wave = s.flow > 0 ? 2 : 0;
    ctx.moveTo(x0, yBottom);
    ctx.lineTo(x0, waterTop);
    for (let x = 0; x <= tankW; x += 6) ctx.lineTo(x0 + x, waterTop + Math.sin(x / 9 + s.t * 6) * wave);
    ctx.lineTo(x0 + tankW, yBottom);
    ctx.closePath();
    ctx.fill();
  }

  // Tank walls (open top).
  ctx.strokeStyle = s.focus === 'tank' ? c.rate : c.ink;
  ctx.lineWidth = s.focus === 'tank' ? 4 : 3;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x0, yBottom);
  ctx.lineTo(x0 + tankW, yBottom);
  ctx.lineTo(x0 + tankW, y0);
  ctx.stroke();

  // Overflow pipe near the rim on the right.
  const oy = y0 + 6;
  ctx.lineWidth = 6;
  ctx.strokeStyle = c.ink;
  ctx.beginPath();
  ctx.moveTo(x0 + tankW, oy);
  ctx.lineTo(x0 + tankW + 26, oy);
  ctx.lineTo(x0 + tankW + 26, oy + 18);
  ctx.stroke();
  if (s.overflowing) {
    ctx.strokeStyle = c.water;
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = -s.t * 60;
    ctx.beginPath();
    ctx.moveTo(x0 + tankW + 26, oy + 20);
    ctx.lineTo(x0 + tankW + 26, yBottom);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Inlet pipe, valve wheel and flow meter.
  const pipeY = 22;
  const pipeEnd = x0 + tankW * 0.3;
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(8, pipeY);
  ctx.lineTo(pipeEnd, pipeY);
  ctx.lineTo(pipeEnd, pipeY + 16);
  ctx.stroke();

  const vx = 34;
  ctx.save();
  ctx.translate(vx, pipeY);
  ctx.rotate(s.valve * 2.4);
  ctx.strokeStyle = s.focus === 'valve' ? c.rate : c.ink;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  for (let k = 0; k < 4; k++) {
    ctx.moveTo(0, 0);
    ctx.lineTo(12 * Math.cos((k * Math.PI) / 2), 12 * Math.sin((k * Math.PI) / 2));
  }
  ctx.stroke();
  ctx.restore();

  // Flow meter dial (0–100 L/min).
  const mx = vx + 48;
  const my = pipeY;
  ctx.fillStyle = c.paper;
  ctx.strokeStyle = s.focus === 'meter' ? c.rate : c.ink;
  ctx.lineWidth = s.focus === 'meter' ? 3 : 2;
  ctx.beginPath();
  ctx.arc(mx, my, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  const frac = Math.min(1, s.flow / 100);
  const ang = Math.PI * (0.75 + 1.5 * frac);
  ctx.strokeStyle = c.rate;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(mx, my);
  ctx.lineTo(mx + 12 * Math.cos(ang), my + 12 * Math.sin(ang));
  ctx.stroke();

  // Falling stream: thickness ∝ flow rate.
  if (s.flow > 0 && !s.full) {
    ctx.strokeStyle = c.water;
    ctx.lineWidth = Math.max(1.5, (s.flow / 100) * 10);
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(pipeEnd, pipeY + 18);
    ctx.lineTo(pipeEnd, Math.max(waterTop, pipeY + 20));
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

/**
 * @param {{ profile, initialVolume, capacity, duration, t, valve?, shadeTo?, rects?, focus?, labels?, height? }} props
 */
export default function FlowTankView({ profile, initialVolume, capacity, duration, t, valve = 1, shadeTo, rects, focus = null, labels = [], height = 300 }) {
  const ref = useRef(null);
  const c = useLabColors(ref);
  const prof = scaled(profile, valve);
  const tank = tankAt(prof, { initialVolume, capacity, t });
  const shade = shadeTo ?? t;
  const qMax = Math.max(...prof.map((p) => p[1]), 10);
  const yMax = Math.ceil((qMax * 1.2) / 10) * 10;
  const added = exactVolume(prof, prof[0][0], t);

  return (
    <div className="bench" ref={ref}>
      <figure className="bench-tank" aria-label={`الخزان: ${fmt(tank.volume)} لتر من ${capacity}`}>
        <div dir="ltr">
        <Stage
          height={height}
          ariaLabel={`Tank holding ${Math.round(tank.volume)} of ${capacity} litres`}
          draw={(ctx, { width, height: hh }) =>
            c &&
            drawTank(ctx, width, hh, c, {
              ...tank,
              capacity,
              t,
              valve,
              focus,
              flow: tank.rate,
              overflowing: tank.full && tank.rate > 0,
            })
          }
        />
        </div>
        <figcaption>
          <span className="note-tag">الخزان</span> بيقيس <b>حجم</b> (لتر)
          {labels.filter((l) => l.target === 'tank').map((l) => (
            <span key={l.id} className="note-float">{l.text?.ar}</span>
          ))}
        </figcaption>
      </figure>

      <figure className="bench-graph" aria-label="رسمة معدل التدفق مع الزمن">
        <div dir="ltr">
          <Plot
            x={[-0.4, duration + 0.4]}
            y={[-yMax * 0.06, yMax]}
            height={height}
            ariaLabel={`Flow-rate graph; shaded area so far ${Math.round(added)} litres`}
            xLabel="t (min) →"
            yLabel="↑ Q (L/min)"
            underlay={(ctx, view) => {
              if (!c) return;
              // Rectangles (approximation) under the curve.
              if (rects?.n) {
                const w = duration / rects.n;
                const off = rects.method === 'left' ? 0 : rects.method === 'right' ? 1 : 0.5;
                for (let i = 0; i < rects.n; i++) {
                  const a = i * w;
                  const hgt = flowAt(prof, a + off * w);
                  const [x1, y1] = view.toPx(a, hgt);
                  const [x2, y2] = view.toPx(a + w, 0);
                  ctx.fillStyle = c.approxFill;
                  ctx.strokeStyle = c.approx;
                  ctx.lineWidth = 1.2;
                  ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
                  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                }
              }
              // Exact area under Q from start to `shade`.
              if (shade > 0) {
                ctx.fillStyle = c.area;
                ctx.beginPath();
                ctx.moveTo(...view.toPx(0, 0));
                const steps = 80;
                for (let i = 0; i <= steps; i++) {
                  const tt = (shade * i) / steps;
                  ctx.lineTo(...view.toPx(tt, flowAt(prof, tt)));
                }
                ctx.lineTo(...view.toPx(shade, 0));
                ctx.closePath();
                ctx.fill();
              }
            }}
            fns={c ? [{ f: (x) => flowAt(prof, x), color: c.rate, width: 3, domain: [prof[0][0], prof[prof.length - 1][0]] }] : []}
            lines={c ? [{ x1: t, y1: 0, x2: t, y2: yMax, color: c.inkSoft, width: 1, dash: [4, 4] }] : []}
            points={c ? [{ x: t, y: tank.rate, color: c.rate, r: 6 }] : []}
          />
        </div>
        <figcaption>
          <span className="note-tag">العداد</span> بيقيس <b>معدل</b> (لتر/دقيقة) — والمساحة المتظللة = اللي اتضاف
          {labels.filter((l) => l.target !== 'tank').map((l) => (
            <span key={l.id} className="note-float">{l.text?.ar}</span>
          ))}
        </figcaption>
      </figure>

      <dl className="gauges" aria-live="polite">
        <div>
          <dt>الزمن t</dt>
          <dd>
            {fmt(t, 1)} <small>دقيقة</small>
          </dd>
        </div>
        <div className="g-rate">
          <dt>المعدل Q</dt>
          <dd>
            {fmt(tank.rate, 1)} <small>لتر/دقيقة</small>
          </dd>
        </div>
        <div className="g-area">
          <dt>اتضاف (المساحة)</dt>
          <dd>
            {fmt(added)} <small>لتر</small>
          </dd>
        </div>
        <div className="g-volume">
          <dt>في الخزان V</dt>
          <dd>
            {fmt(tank.volume)} <small>لتر</small>
          </dd>
        </div>
        <div className={tank.spilled > 0 ? 'g-spill is-on' : 'g-spill'}>
          <dt>فايض</dt>
          <dd>
            {fmt(tank.spilled)} <small>لتر</small>
          </dd>
        </div>
      </dl>
    </div>
  );
}
