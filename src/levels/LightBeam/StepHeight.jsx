/**
 * Step 2 — Height of the spot. Drag the flashlight around; a ruler shows how
 * high the spot is. Three goals reveal the key values of sine.
 * @module LightBeam/StepHeight
 */
import { useEffect, useRef, useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Checklist from '../../components/Checklist.jsx';
import Readout from '../../components/Readout.jsx';
import Slider from '../../components/Slider.jsx';
import M from '../../components/MathText.jsx';
import { degToRad } from '../../core/mathUtils.js';
import BeamScene from './BeamScene.jsx';

const near = (a, t, tol = 5) => Math.abs(((a - t + 540) % 360) - 180) <= tol;

const GOALS = [
  { id: 'top', label: 'Make the spot as high as it can go', test: (a) => near(a, 90) },
  { id: 'bottom', label: 'Make it as low as it can go', test: (a) => near(a, 270) },
  { id: 'zero1', label: 'Height exactly 0 on the right', test: (a) => near(a, 0) },
  { id: 'zero2', label: 'Height exactly 0 somewhere else', test: (a) => near(a, 180) },
];

export default function StepHeight({ api }) {
  const [angle, setAngle] = useState(40);
  const [hit, setHit] = useState({});
  const seen = useRef(new Set());
  const done = GOALS.every((g) => hit[g.id]);
  const heightValue = Math.sin(degToRad(angle));

  useEffect(() => {
    for (const g of GOALS) {
      if (!seen.current.has(g.id) && g.test(angle)) {
        seen.current.add(g.id);
        api.answer(true);
        setHit((h) => ({ ...h, [g.id]: true }));
      }
    }
  }, [angle, api]);

  return (
    <StepLayout
      api={api}
      eyebrow="Measure the light"
      prompt="Drag around the room to aim. Watch the height ruler on the right."
      sub="The wall has radius 1, so the spot's height is always between −1 and 1."
      hint="Try pointing straight up, straight down, and straight sideways."
      done={done}
      insight={
        <>
          The height depends only on the angle: 1 at 90°, −1 at 270°, and 0 at 0° and 180°. That height has a name:{' '}
          <b>sine</b> of the angle.
        </>
      }
      formula={<M block>height = sin θ</M>}
      side={
        <>
          <Readout
            items={[
              { label: 'Angle θ', value: `${Math.round(angle)}°` },
              { label: 'Height', value: heightValue.toFixed(2), color: 'var(--c-series-2)' },
            ]}
          />
          <Checklist items={GOALS.map((g) => ({ label: g.label, done: Boolean(hit[g.id]) }))} />
        </>
      }
    >
      <BeamScene
        angle={angle}
        showHeight
        onPointer={(type, deg, dragging) => {
          if (type === 'down' || dragging) setAngle(deg);
        }}
      />
      <Slider label="…or turn the dial" value={angle} min={0} max={359} step={1} onChange={setAngle} format={(v) => `${v}°`} />
    </StepLayout>
  );
}
