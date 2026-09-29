/**
 * Responsive, high-DPI canvas.
 *
 * The parent supplies a `draw(ctx, info)` function; it runs after every render and
 * whenever the canvas resizes, so animating is as simple as updating React state.
 * Pointer handlers receive coordinates in CSS pixels relative to the canvas.
 * @module Stage
 */
import { useLayoutEffect, useRef } from 'react';
import { useElementSize } from '../hooks/useElementSize.js';
import { useThemeColors } from '../hooks/useThemeColors.js';

export default function Stage({
  height = 320,
  draw,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  ariaLabel,
  className = '',
  cursor,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const dragging = useRef(false);
  const { width } = useElementSize(wrapRef);
  const colors = useThemeColors();

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width) return;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    draw?.(ctx, { width, height, colors });
  });

  const point = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { px: e.clientX - rect.left, py: e.clientY - rect.top, width, height };
  };

  return (
    <div ref={wrapRef} className={`stage ${className}`} style={{ height }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={ariaLabel}
        style={{ width: '100%', height, cursor, touchAction: onPointerMove ? 'none' : 'auto' }}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture?.(e.pointerId);
          onPointerDown?.(point(e), e);
        }}
        onPointerMove={(e) => onPointerMove?.(point(e), e, dragging.current)}
        onPointerUp={(e) => {
          dragging.current = false;
          onPointerUp?.(point(e), e);
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      />
    </div>
  );
}
