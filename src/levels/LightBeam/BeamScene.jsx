/**
 * The round room: a flashlight at the centre, its beam and light spot on the
 * wall, plus optional projections of the spot onto a height ruler (sine) and a
 * floor ruler (cosine). Reports pointer angles in degrees for aiming/dragging.
 * @module LightBeam/BeamScene
 */
import Stage from '../../components/Stage.jsx';
import { FONT } from '../../components/Plot.jsx';
import { degToRad, radToDeg, wrapAngle } from '../../core/mathUtils.js';

function geometry(width, height) {
  const R = Math.min(width * 0.32, height * 0.36);
  return { cx: width / 2 - R * 0.25, cy: height / 2 - 6, R };
}

export default function BeamScene({
  angle,
  beamOn = true,
  showHeight = false,
  showFloor = false,
  marks = [],
  onPointer,
  height = 340,
  label = 'Flashlight in a round room',
}) {
  const handler = (type) =>
    onPointer
      ? (p, e, dragging) => {
          const { cx, cy } = geometry(p.width, p.height);
          const deg = radToDeg(wrapAngle(Math.atan2(cy - p.py, p.px - cx)));
          onPointer(type, deg, dragging);
        }
      : undefined;

  return (
    <Stage
      height={height}
      ariaLabel={`${label}, angle ${Math.round(angle)} degrees`}
      cursor={onPointer ? 'pointer' : undefined}
      onPointerDown={handler('down')}
      onPointerMove={handler('move')}
      onPointerUp={handler('up')}
      draw={(ctx, { width, height: h, colors }) => {
        const { cx, cy, R } = geometry(width, h);
        const th = degToRad(angle);
        const sx = cx + R * Math.cos(th);
        const sy = cy - R * Math.sin(th);
        const pink = colors.s2;

        // Room
        ctx.fillStyle = colors.grid;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colors.axis;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Angle ticks
        ctx.font = `11px ${FONT}`;
        ctx.fillStyle = colors.muted;
        ctx.textAlign = 'center';
        for (let d = 0; d < 360; d += 30) {
          const r = degToRad(d);
          const x1 = cx + (R - 6) * Math.cos(r);
          const y1 = cy - (R - 6) * Math.sin(r);
          ctx.strokeStyle = colors.axis;
          ctx.lineWidth = d % 90 === 0 ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(cx + R * Math.cos(r), cy - R * Math.sin(r));
          ctx.stroke();
          if (d % 90 === 0) ctx.fillText(`${d}°`, cx + (R - 20) * Math.cos(r), cy - (R - 20) * Math.sin(r) + 4);
        }

        // Rulers
        const rx = cx + R + 34;
        const fy = cy + R + 22;
        if (showHeight) {
          ctx.strokeStyle = colors.axis;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(rx, cy - R);
          ctx.lineTo(rx, cy + R);
          ctx.stroke();
          ctx.fillStyle = colors.muted;
          ctx.textAlign = 'left';
          [1, 0, -1].forEach((v) => ctx.fillText(String(v), rx + 8, cy - v * R + 4));
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = pink;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(rx, sy);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = pink;
          ctx.beginPath();
          ctx.arc(rx, sy, 7, 0, Math.PI * 2);
          ctx.fill();
        }
        if (showFloor) {
          ctx.strokeStyle = colors.axis;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx - R, fy);
          ctx.lineTo(cx + R, fy);
          ctx.stroke();
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = colors.s5;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx, fy);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = colors.s5;
          ctx.beginPath();
          ctx.arc(sx, fy, 7, 0, Math.PI * 2);
          ctx.fill();
        }

        // Beam
        if (beamOn) {
          const spread = 0.09;
          const grad = ctx.createLinearGradient(cx, cy, sx, sy);
          grad.addColorStop(0, 'rgba(255, 214, 102, 0.85)');
          grad.addColorStop(1, 'rgba(255, 214, 102, 0.15)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + R * Math.cos(th - spread), cy - R * Math.sin(th - spread));
          ctx.lineTo(cx + R * Math.cos(th + spread), cy - R * Math.sin(th + spread));
          ctx.closePath();
          ctx.fill();
          ctx.save();
          ctx.shadowColor = '#ffd666';
          ctx.shadowBlur = 24;
          ctx.fillStyle = '#ffcf4d';
          ctx.beginPath();
          ctx.arc(sx, sy, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Prediction / goal marks
        for (const m of marks) {
          const r = degToRad(m.angle);
          const mx = cx + R * Math.cos(r);
          const my = cy - R * Math.sin(r);
          ctx.strokeStyle = colors[m.color] || m.color || colors.accent;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(mx, my, 11, 0, Math.PI * 2);
          ctx.stroke();
          if (m.label) {
            ctx.fillStyle = ctx.strokeStyle;
            ctx.font = `600 12px ${FONT}`;
            ctx.textAlign = 'center';
            ctx.fillText(m.label, cx + (R + 22) * Math.cos(r), cy - (R + 22) * Math.sin(r) + 4);
          }
        }

        // Flashlight body
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-th);
        ctx.fillStyle = colors.text;
        ctx.beginPath();
        ctx.roundRect(-16, -7, 30, 14, 4);
        ctx.fill();
        ctx.fillStyle = '#ffcf4d';
        ctx.fillRect(12, -8, 5, 16);
        ctx.restore();
      }}
    />
  );
}
