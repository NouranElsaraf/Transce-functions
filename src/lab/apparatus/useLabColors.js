/**
 * Reads the Living Lab palette (CSS custom properties on `.lab`) for canvas
 * drawing, and re-reads it when the theme changes.
 * @module lab/apparatus/useLabColors
 */
import { useLayoutEffect, useState } from 'react';
import { useGame } from '../../core/GameContext.jsx';

const VARS = {
  paper: '--paper',
  ink: '--ink',
  inkSoft: '--ink-soft',
  rule: '--rule',
  water: '--water',
  waterDeep: '--water-deep',
  rate: '--rate',
  area: '--area',
  approx: '--approx',
  approxFill: '--approx-fill',
};

export function useLabColors(ref) {
  const { resolvedTheme } = useGame();
  const [colors, setColors] = useState(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const style = getComputedStyle(el);
    const out = {};
    for (const [k, v] of Object.entries(VARS)) out[k] = style.getPropertyValue(v).trim() || '#888';
    setColors(out);
  }, [ref, resolvedTheme]);
  return colors;
}
