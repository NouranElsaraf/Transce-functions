/**
 * Teacher Mode ink layer: a transparent full-screen canvas the instructor can
 * draw on (over graphs, animations, anything). Only captures the pointer while
 * drawing is enabled; strokes survive toggling and are wiped by `clearSignal`.
 * @module DrawingOverlay
 */
import { useEffect, useRef, useState } from 'react';

const INKS = ['#ff4d6d', '#ffb020', '#22c3a6', '#3fa7ff', '#ffffff', '#111827'];

export default function DrawingOverlay({ active, clearSignal }) {
  const canvasRef = useRef(null);
  const strokes = useRef([]);
  const current = useRef(null);
  const [ink, setInk] = useState(INKS[0]);

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const s of strokes.current) {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      s.points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y + s.scroll - window.scrollY) : ctx.moveTo(x, y + s.scroll - window.scrollY)));
      ctx.stroke();
    }
  };

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      redraw();
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', redraw, { passive: true });
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', redraw);
    };
  }, []);

  useEffect(() => {
    strokes.current = [];
    redraw();
  }, [clearSignal]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`ink-layer ${active ? 'is-active' : ''}`}
        aria-hidden="true"
        onPointerDown={(e) => {
          if (!active) return;
          e.currentTarget.setPointerCapture?.(e.pointerId);
          current.current = { color: ink, scroll: window.scrollY, points: [[e.clientX, e.clientY]] };
          strokes.current.push(current.current);
        }}
        onPointerMove={(e) => {
          if (!active || !current.current) return;
          current.current.points.push([e.clientX, e.clientY]);
          redraw();
        }}
        onPointerUp={() => {
          current.current = null;
        }}
      />
      {active && (
        <div className="ink-palette" role="toolbar" aria-label="Ink colour">
          {INKS.map((c) => (
            <button
              key={c}
              type="button"
              className={`ink-swatch ${c === ink ? 'is-active' : ''}`}
              style={{ background: c }}
              aria-label={`Ink ${c}`}
              onClick={() => setInk(c)}
            />
          ))}
        </div>
      )}
    </>
  );
}
