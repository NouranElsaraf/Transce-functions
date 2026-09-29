/**
 * Plot of spot height (and optionally floor position) against total angle
 * turned, drawn up to the current angle — the wave appears as the light spins.
 * @module LightBeam/WaveTrace
 */
import Plot from '../../components/Plot.jsx';
import { degToRad } from '../../core/mathUtils.js';

const sinDeg = (d) => Math.sin(degToRad(d));
const cosDeg = (d) => Math.cos(degToRad(d));

export default function WaveTrace({ angle, max = 720, showSin = true, showCos = false, height = 220 }) {
  const fns = [];
  if (showSin) fns.push({ f: sinDeg, color: 's2', domain: [0, angle], width: 3.5 });
  if (showCos) fns.push({ f: cosDeg, color: 's5', domain: [0, angle], width: 3.5 });
  const points = [];
  if (showSin) points.push({ x: angle, y: sinDeg(angle), color: 's2', r: 6 });
  if (showCos) points.push({ x: angle, y: cosDeg(angle), color: 's5', r: 6 });
  return (
    <Plot
      x={[-20, max + 20]}
      y={[-1.4, 1.4]}
      height={height}
      ariaLabel="Wave traced by the light spot"
      xLabel="angle turned →"
      ticks={{ formatX: (v) => `${v}°`, formatY: (v) => v }}
      fns={fns}
      points={points}
      lines={[360, 720]
        .filter((d) => d <= max)
        .map((d) => ({ x1: d, y1: -1.4, x2: d, y2: 1.4, color: 'muted', width: 1, dash: [4, 6] }))}
    />
  );
}
