/**
 * requestAnimationFrame loop that respects Teacher-mode pause.
 *
 * `callback(dt, elapsed)` receives seconds since the last frame (clamped so a
 * backgrounded tab doesn't cause a giant jump) and total running seconds.
 * While paused or inactive, time does not advance.
 * @module useAnimationFrame
 */
import { useEffect, useRef } from 'react';
import { useGame } from '../core/GameContext.jsx';

export function useAnimationFrame(callback, active = true) {
  const { state } = useGame();
  const paused = state.teacher.paused;
  const cbRef = useRef(callback);
  const elapsed = useRef(0);
  cbRef.current = callback;

  useEffect(() => {
    if (!active || paused) return undefined;
    let raf;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      elapsed.current += dt;
      cbRef.current(dt, elapsed.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, paused]);
}
