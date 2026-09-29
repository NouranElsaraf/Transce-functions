/**
 * The kingdom's granary: a 16×16 grid of grain sacks. When the count outgrows
 * the grid, each square starts to stand for more grain (and the legend says so) —
 * a visual hint that the scale itself is exploding.
 * @module GrowingKingdom/Granary
 */
import Stage from '../../components/Stage.jsx';
import { FONT } from '../../components/Plot.jsx';
import { formatBig } from '../../core/mathUtils.js';

const GRID = 16;
const CELLS = GRID * GRID;

export function unitFor(count) {
  let unit = 1;
  while (count / unit > CELLS) unit *= 2;
  return unit;
}

export default function Granary({ count, day, height = 300 }) {
  const unit = unitFor(count);
  const filled = Math.round(count / unit);
  return (
    <div className="granary">
      <div className="granary-head">
        <div>
          <div className="eyebrow">Day {day}</div>
          <div className="big-number" key={count}>
            {formatBig(count)}
          </div>
          <div className="muted">sacks of grain</div>
        </div>
        {unit > 1 && <span className="tag">1 square = {formatBig(unit)} sacks</span>}
      </div>
      <Stage
        height={height}
        ariaLabel={`${count} sacks of grain`}
        draw={(ctx, { width, height: h, colors }) => {
          const size = Math.min(width, h) - 24;
          const cell = size / GRID;
          const ox = (width - size) / 2;
          const oy = (h - size) / 2;
          for (let i = 0; i < CELLS; i++) {
            const cx = ox + (i % GRID) * cell;
            const cy = oy + size - (Math.floor(i / GRID) + 1) * cell;
            ctx.fillStyle = i < filled ? '#e0a53a' : colors.grid;
            ctx.beginPath();
            ctx.roundRect(cx + 1.5, cy + 1.5, cell - 3, cell - 3, 3);
            ctx.fill();
          }
          if (count === 0) {
            ctx.fillStyle = colors.muted;
            ctx.font = `14px ${FONT}`;
            ctx.textAlign = 'center';
            ctx.fillText('empty', width / 2, h / 2);
          }
        }}
      />
    </div>
  );
}
