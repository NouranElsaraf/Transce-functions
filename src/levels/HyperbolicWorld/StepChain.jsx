/**
 * Step 1 — Hang a chain. Drag the posts (or use the slider); the chain settles
 * with a gentle sway. Then test three candidate curves against it: each pick
 * draws its overlay, so wrong answers are *visibly* wrong.
 * @module HyperbolicWorld/StepChain
 */
import { useRef, useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Plot from '../../components/Plot.jsx';
import Slider from '../../components/Slider.jsx';
import Choices from '../../components/Choices.jsx';
import M from '../../components/MathText.jsx';
import { clamp } from '../../core/mathUtils.js';
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js';
import { beads, chainCurve, circleArc, parabolaFit } from './catenary.js';

const LENGTH = 9;
const X = [-5.5, 5.5];
const Y = [-5.8, 1];

export default function StepChain({ api }) {
  const [target, setTarget] = useState(4);
  const [shown, setShown] = useState(4);
  const [sway, setSway] = useState(0);
  const velocity = useRef(0);
  const [overlay, setOverlay] = useState(null);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);

  // Damped spring towards the target span — the chain "settles" physically.
  useAnimationFrame((dt) => {
    const force = (target - shown) * 40 - velocity.current * 7;
    velocity.current += force * dt;
    setShown((s) => s + velocity.current * dt);
    setSway((w) => w * 0.96 + velocity.current * dt * 0.08);
  });

  const { f: chain, sag } = chainCurve(target, LENGTH);
  const pts = beads(shown, LENGTH).map(([x, y], i, arr) => [x + sway * Math.sin((Math.PI * i) / (arr.length - 1)) * 4, y]);

  const overlays = {
    parabola: { f: parabolaFit(target, sag), color: 's4' },
    circle: { points: circleArc(target, sag), color: 's5' },
    mystery: { f: chain, color: 'good' },
  };
  const ov = overlay && overlays[overlay];

  const setSpan = (v) => {
    setTarget(clamp(v, 2, 8.6));
    setMoves((m) => m + 1);
  };

  return (
    <StepLayout
      api={api}
      eyebrow="Hanging chain"
      prompt={moves < 4 ? 'Drag the posts apart and together. Watch how the chain hangs.' : 'Which curve fits the chain exactly? Pick one to overlay it.'}
      sub="Same chain, always 9 m long. Only the distance between the posts changes."
      hint="Push the posts close together, then compare: which overlay hugs the chain all the way up, not just at the bottom?"
      done={done}
      insight={
        <>
          It’s not a parabola and not a circle: both drift away near the posts. The chain’s curve is the <b>catenary</b> — from
          Latin <i>catena</i>, chain — and its formula uses a new function, <b>cosh</b>.
        </>
      }
      formula={<M block>y = a · cosh(x / a)</M>}
    >
      <Plot
        x={X}
        y={Y}
        height={360}
        equal
        grid={false}
        axes={false}
        ticks={false}
        ariaLabel="A chain hanging between two posts"
        cursor="ew-resize"
        fns={ov?.f ? [{ f: ov.f, color: ov.color, width: 4, dash: [10, 8], domain: [-target / 2, target / 2] }] : []}
        onPointer={(type, p, dragging) => {
          if (type === 'down' || dragging) setSpan(Math.abs(p.x) * 2);
        }}
        draw={(ctx, view) => {
          const { colors } = view;
          // posts
          for (const side of [-1, 1]) {
            const [px, py] = view.toPx((side * shown) / 2, 0);
            const [, groundY] = view.toPx(0, Y[0]);
            ctx.fillStyle = colors.axis;
            ctx.fillRect(px - 4, py, 8, groundY - py);
            ctx.fillStyle = colors.text;
            ctx.beginPath();
            ctx.arc(px, py, 9, 0, Math.PI * 2);
            ctx.fill();
          }
          // circle overlay (parametric)
          if (ov?.points) {
            ctx.strokeStyle = colors[ov.color];
            ctx.lineWidth = 4;
            ctx.setLineDash([10, 8]);
            ctx.beginPath();
            ov.points.forEach(([x, y], i) => (i ? ctx.lineTo(...view.toPx(x, y)) : ctx.moveTo(...view.toPx(x, y))));
            ctx.stroke();
            ctx.setLineDash([]);
          }
          // chain links
          ctx.strokeStyle = colors.muted;
          ctx.lineWidth = 2;
          ctx.beginPath();
          pts.forEach(([x, y], i) => {
            const [px, py] = view.toPx(x, y);
            if (i) ctx.lineTo(px, py);
            else ctx.moveTo(px, py);
          });
          ctx.stroke();
          ctx.fillStyle = colors.text;
          pts.forEach(([x, y], i) => {
            const [px, py] = view.toPx(x, y);
            ctx.beginPath();
            ctx.ellipse(px, py, 5, 3.5, i * 0.6, 0, Math.PI * 2);
            ctx.fill();
          });
        }}
      />
      <Slider label="Distance between posts" value={target} min={2} max={8.6} step={0.1} onChange={setSpan} format={(v) => `${v.toFixed(1)} m`} />
      {moves >= 4 && !done && (
        <Choices
          api={api}
          correct="mystery"
          columns={3}
          onPick={(opt) => setOverlay(opt.id)}
          onSolved={() => setDone(true)}
          options={[
            { id: 'parabola', label: 'Parabola', sub: 'like y = x²', why: 'Close at the bottom — but see the gap near the posts? Bring the posts closer and it gets obvious.' },
            { id: 'circle', label: 'Circle arc', why: 'Too round: it bulges away from the chain.' },
            { id: 'mystery', label: 'Mystery curve', sub: 'something new' },
          ]}
        />
      )}
    </StepLayout>
  );
}
