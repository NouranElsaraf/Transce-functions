/**
 * Bar chart of grain per day on a linear scale. On a linear axis the early
 * days vanish into nothing — which is exactly the point.
 * @module GrowingKingdom/DayBars
 */
import Stage from '../../components/Stage.jsx';
import { FONT } from '../../components/Plot.jsx';

export default function DayBars({ days, value, highlight, height = 220, labelEvery = 1 }) {
  return (
    <Stage
      height={height}
      ariaLabel={`Bar chart of grain for days 0 to ${days}`}
      draw={(ctx, { width, height: h, colors }) => {
        const n = days + 1;
        const pad = 24;
        const bw = (width - pad * 2) / n;
        const max = value(days) || 1;
        ctx.font = `10px ${FONT}`;
        ctx.textAlign = 'center';
        for (let d = 0; d < n; d++) {
          const bh = ((h - pad * 2) * value(d)) / max;
          const x = pad + d * bw;
          ctx.fillStyle = d === highlight ? colors.accent : '#e0a53a';
          ctx.beginPath();
          ctx.roundRect(x + bw * 0.12, h - pad - bh, bw * 0.76, Math.max(bh, 0.5), 3);
          ctx.fill();
          if (d % labelEvery === 0 || d === days) {
            ctx.fillStyle = colors.muted;
            ctx.fillText(String(d), x + bw / 2, h - 8);
          }
        }
      }}
    />
  );
}
