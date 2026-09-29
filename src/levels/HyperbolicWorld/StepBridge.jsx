/**
 * Step 4 — Chains, bridges & arches. Two real-world structures, two quick
 * calls: a suspension bridge cable (parabola!) and an upside-down chain arch.
 * @module HyperbolicWorld/StepBridge
 */
import { useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Stage from '../../components/Stage.jsx';
import Choices from '../../components/Choices.jsx';
import { chainCurve } from './catenary.js';

const SCENES = [
  {
    id: 'bridge',
    prompt: 'A suspension bridge cable holds up a heavy, flat road. Its shape is closer to…',
    hint: 'The chain carried only its own weight, spread along the curve. Here the weight is the road, spread evenly along the ground.',
    correct: 'parabola',
    options: [
      { id: 'cosh', label: 'cosh (a chain)', why: 'Tempting! But the road — not the cable — carries almost all the weight.' },
      { id: 'parabola', label: 'A parabola' },
      { id: 'circle', label: 'A circle arc', why: 'A circle has no reason to appear here — think about how the load is spread.' },
    ],
  },
  {
    id: 'arch',
    prompt: 'Freeze a hanging chain and flip it upside down. This arch is…',
    hint: 'Nothing about the shape changed — only its direction.',
    correct: 'cosh',
    options: [
      { id: 'cosh', label: 'An upside-down cosh' },
      { id: 'parabola', label: 'A parabola', why: 'Flipping doesn’t change which curve it is.' },
      { id: 'sin', label: 'A sine wave', why: 'Sine waves repeat; this is one smooth arch.' },
    ],
  },
];

function drawBridge(ctx, w, h, colors) {
  const deckY = h * 0.72;
  const towerTop = h * 0.14;
  const t1 = w * 0.18;
  const t2 = w * 0.82;
  ctx.fillStyle = colors.grid;
  ctx.fillRect(0, deckY + 14, w, h - deckY);
  ctx.fillStyle = colors.axis;
  ctx.fillRect(0, deckY, w, 10);
  for (const x of [t1, t2]) ctx.fillRect(x - 7, towerTop, 14, deckY - towerTop + 30);
  const sagY = deckY - 22;
  const cable = (x) => {
    const u = (x - (t1 + t2) / 2) / ((t2 - t1) / 2);
    return sagY - (sagY - towerTop) * u * u;
  };
  ctx.strokeStyle = colors.s4;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = t1; x <= t2; x += 2) (x === t1 ? ctx.moveTo : ctx.lineTo).call(ctx, x, cable(x));
  ctx.stroke();
  ctx.lineWidth = 1.5;
  for (let x = t1 + 18; x < t2 - 8; x += 18) {
    ctx.beginPath();
    ctx.moveTo(x, cable(x));
    ctx.lineTo(x, deckY);
    ctx.stroke();
  }
}

function drawArch(ctx, w, h, colors) {
  const { f, sag } = chainCurve(3, 7);
  const ground = h * 0.88;
  const scale = (ground - h * 0.1) / -sag;
  ctx.fillStyle = colors.grid;
  ctx.fillRect(0, ground, w, h - ground);
  ctx.strokeStyle = colors.s1;
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i <= 100; i++) {
    const x = -1.5 + (3 * i) / 100;
    const px = w / 2 + x * scale;
    const py = ground + f(x) * scale;
    if (i) ctx.lineTo(px, py);
    else ctx.moveTo(px, py);
  }
  ctx.stroke();
}

export default function StepBridge({ api }) {
  const [q, setQ] = useState(0);
  const done = q >= SCENES.length;
  const scene = SCENES[Math.min(q, SCENES.length - 1)];

  return (
    <StepLayout
      api={api}
      eyebrow="Out in the world"
      prompt={done ? 'You can read structures now.' : scene.prompt}
      hint={scene.hint}
      done={done}
      insight={
        <>
          A chain carrying only its own weight hangs as <b>cosh</b>; flipped, it becomes the strongest arch there is (the
          Gateway Arch in St. Louis). Load a cable with a flat road and it becomes a <b>parabola</b> instead.
        </>
      }
    >
      <Stage
        key={scene.id}
        height={300}
        ariaLabel={scene.id === 'bridge' ? 'A suspension bridge' : 'An arch shaped like an upside-down chain'}
        draw={(ctx, { width, height, colors }) =>
          scene.id === 'bridge' ? drawBridge(ctx, width, height, colors) : drawArch(ctx, width, height, colors)
        }
      />
      {!done && (
        <Choices key={q} api={api} columns={3} options={scene.options} correct={scene.correct} onSolved={() => setTimeout(() => setQ((n) => n + 1), 700)} />
      )}
    </StepLayout>
  );
}
