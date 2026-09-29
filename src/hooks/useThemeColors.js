/**
 * Reads the design-token colours from CSS custom properties so canvas drawings
 * match the current light/dark theme. Recomputes whenever the theme changes.
 * @module useThemeColors
 */
import { useMemo } from 'react';
import { useGame } from '../core/GameContext.jsx';

const TOKENS = {
  text: '--c-text',
  muted: '--c-muted',
  grid: '--c-grid',
  axis: '--c-axis',
  surface: '--c-surface-solid',
  accent: '--c-accent',
  accent2: '--c-accent-2',
  good: '--c-good',
  bad: '--c-bad',
  warn: '--c-warn',
  s1: '--c-series-1',
  s2: '--c-series-2',
  s3: '--c-series-3',
  s4: '--c-series-4',
  s5: '--c-series-5',
};

export function readThemeColors() {
  const style = getComputedStyle(document.documentElement);
  const out = {};
  for (const [key, cssVar] of Object.entries(TOKENS)) out[key] = style.getPropertyValue(cssVar).trim() || '#888';
  return out;
}

export function useThemeColors() {
  const { resolvedTheme } = useGame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => readThemeColors(), [resolvedTheme]);
}
