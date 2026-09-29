/**
 * Lock 3 — Shape key. Reuses the Graph Sculptor table with every control:
 * rebuild y = 2(x + 1)² − 2.
 * @module EscapeRoom/LockShape
 */
import { useCallback, useState } from 'react';
import Sculptor from '../GraphSculptor/Sculptor.jsx';
import LockFrame from './LockFrame.jsx';

export default function LockShape({ api }) {
  const [done, setDone] = useState(false);
  const onMatch = useCallback(() => {
    api.answer(true);
    setDone(true);
  }, [api]);

  return (
    <LockFrame
      index={2}
      api={api}
      done={done}
      eyebrow="The vault · Lock 3"
      prompt="The key is a shape. Sculpt the bowl onto the ghost."
      hint="Its bottom is at x = −1, height −2, and it is narrower than the plain bowl."
      insight={<>Outside moves heights (×2, −2); inside moves where things happen — and backwards: +1 inside means one step left.</>}
    >
      <Sculptor base="square" controls={['k', 'c', 'a', 'flipY']} target={{ a: 2, c: 1, k: -2 }} onMatch={onMatch} showEquation={done} />
    </LockFrame>
  );
}
