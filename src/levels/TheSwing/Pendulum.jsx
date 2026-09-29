/**
 * Canvas pendulum: pivot, rope, bob, the swing arc, an optional ghost bob
 * (the player's prediction) and pointer reporting as an angle from vertical.
 * @module TheSwing/Pendulum
 */
import Stage from '../../components/Stage.jsx';
import { FONT } from '../../components/Plot.jsx';
import { degToRad, radToDeg } from '../../core/mathUtils.js';

const MAX_L = 4;

function geometry(width, height, L, maxL) {
  const px = width / 2;
  const py = 24;
  const scale = (height - 70) / maxL;
  return { px, py, len: Math.max(30, L * scale) };
}

export default function Pendulum({ angle, L = 1, maxL = 1.2, amplitude = 30, ghost, onPointer, height = 320, timeLabel }) {
  const handler = (type) =>
    onPointer
      ? (p, e, dragging) => {
          const { px, py } = geometry(p.width, p.height, L, maxL);
          const deg = radToDeg(Math.atan2(p.px - px, p.py - py));
          onPointer(type, deg, dragging);
        }
      : undefined;

  return (
    <Stage
      height={height}
      ariaLabel={`Pendulum at ${Math.round(angle)} degrees`}
      cursor={onPointer ? 'grab' : undefined}
      onPointerDown={handler('down')}
      onPointerMove={handler('move')}
      onPointerUp={handler('up')}
      draw={(ctx, { width, height: h, colors }) => {
        const { px, py, len } = geometry(width, h, L, Math.min(maxL, MAX_L));
        const pos = (deg, r = len) => [px + r * Math.sin(degToRad(deg)), py + r * Math.cos(degToRad(deg))];

        // Swing arc
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(px, py, len, degToRad(90 - amplitude - 8), degToRad(90 + amplitude + 8));
        ctx.stroke();
        // Labels: left / middle / right (only when there is room for them)
        const roomy = len * Math.sin(degToRad(amplitude)) > 60;
        ctx.fillStyle = colors.muted;
        ctx.font = `11px ${FONT}`;
        ctx.textAlign = 'center';
        [
          [-amplitude, 'far left'],
          [0, 'middle'],
          [amplitude, 'far right'],
        ].forEach(([d, t]) => {
          if (!roomy) return;
          const [x, y] = pos(d, len + 26);
          ctx.fillText(t, x, y + 4);
        });

        // Ceiling
        ctx.fillStyle = colors.axis;
        ctx.fillRect(px - 50, py - 6, 100, 4);

        // Ghost prediction
        if (ghost != null) {
          const [gx, gy] = pos(ghost);
          ctx.setLineDash([4, 6]);
          ctx.strokeStyle = colors.s2;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(gx, gy);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 0.45;
          ctx.fillStyle = colors.s2;
          ctx.beginPath();
          ctx.arc(gx, gy, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        // Rope and bob
        const [bx, by] = pos(angle);
        ctx.strokeStyle = colors.text;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(bx, by);
        ctx.stroke();
        const grad = ctx.createRadialGradient(bx - 5, by - 5, 2, bx, by, 18);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.25, colors.accent);
        grad.addColorStop(1, colors.accent);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx, by, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = colors.text;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();

        if (timeLabel) {
          ctx.fillStyle = colors.text;
          ctx.font = `700 15px ${FONT}`;
          ctx.textAlign = 'left';
          ctx.fillText(timeLabel, 14, h - 14);
        }
      }}
    />
  );
}
