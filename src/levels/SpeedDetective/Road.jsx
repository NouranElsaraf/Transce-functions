/**
 * Canvas road with a car, optional motion trail and distance markers.
 * Used as a full road (live playback) or a slim "photo strip" lane.
 * @module SpeedDetective/Road
 */
import Stage from '../../components/Stage.jsx';
import { FONT } from '../../components/Plot.jsx';
import { ROAD_LENGTH } from './trip.js';

/** Draw a small side-view car centred at (x, y). */
export function drawCar(ctx, x, y, color, alpha = 1, scale = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(-26, -10, 52, 16, 6);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(-14, -22, 28, 14, [8, 10, 2, 2]);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath();
  ctx.roundRect(-10, -19, 9, 9, 3);
  ctx.roundRect(1, -19, 10, 9, 3);
  ctx.fill();
  ctx.fillStyle = '#1b1d2e';
  for (const wx of [-15, 15]) {
    ctx.beginPath();
    ctx.arc(wx, 7, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export default function Road({ s, trail = [], height = 120, label, color, markers = true, ghost }) {
  return (
    <Stage
      height={height}
      ariaLabel={label || `Car at ${Math.round(s)} metres`}
      draw={(ctx, { width, height: h, colors }) => {
        const pad = 36;
        const toX = (m) => pad + (m / ROAD_LENGTH) * (width - 2 * pad);
        const roadY = h / 2 + 10;
        // road
        ctx.fillStyle = colors.grid;
        ctx.fillRect(0, roadY + 8, width, 22);
        ctx.strokeStyle = colors.axis;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(0, roadY + 19);
        ctx.lineTo(width, roadY + 19);
        ctx.stroke();
        ctx.setLineDash([]);
        if (markers) {
          ctx.fillStyle = colors.muted;
          ctx.font = `11px ${FONT}`;
          ctx.textAlign = 'center';
          for (let m = 0; m <= ROAD_LENGTH; m += 20) {
            ctx.fillRect(toX(m) - 0.5, roadY + 30, 1, 6);
            ctx.fillText(`${m} m`, toX(m), roadY + 48 > h ? h - 2 : roadY + 48);
          }
        }
        if (label) {
          ctx.fillStyle = colors.text;
          ctx.font = `700 14px ${FONT}`;
          ctx.textAlign = 'left';
          ctx.fillText(label, 10, 20);
        }
        const c = color || colors.accent;
        if (ghost != null) drawCar(ctx, toX(ghost), roadY, colors.muted, 0.25);
        trail.forEach((ts, i) => {
          ctx.globalAlpha = 0.15 + (0.5 * i) / Math.max(1, trail.length);
          ctx.fillStyle = c;
          ctx.beginPath();
          ctx.arc(toX(ts), roadY + 2, 5, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
        if (trail.length) {
          ctx.strokeStyle = c;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.moveTo(toX(trail[0]), roadY + 2);
          ctx.lineTo(toX(s), roadY + 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        drawCar(ctx, toX(s), roadY, c);
      }}
    />
  );
}
