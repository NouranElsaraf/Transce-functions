/**
 * Lightweight canvas confetti. Creates a temporary full-screen canvas,
 * animates a burst of particles and removes itself when finished.
 * Honours `prefers-reduced-motion` by drastically reducing the burst.
 * @module confetti
 */

const COLORS = ['#6e6af0', '#22c3a6', '#ffb020', '#ff5d8f', '#3fa7ff', '#a3e635'];

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Fire a confetti burst.
 * @param {{x?: number, y?: number, count?: number, spread?: number}} options
 *   x/y are 0–1 fractions of the viewport (default: centre-top).
 */
export function confetti({ x = 0.5, y = 0.35, count = 120, spread = 1 } = {}) {
  if (typeof document === 'undefined') return;
  const n = reducedMotion() ? Math.min(20, count) : count;
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);

  const ox = x * window.innerWidth;
  const oy = y * window.innerHeight;
  const parts = Array.from({ length: n }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * spread;
    const speed = 6 + Math.random() * 9;
    return {
      x: ox,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: 5 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      life: 0,
    };
  });

  const MAX_LIFE = 150;
  function frame() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let alive = 0;
    for (const p of parts) {
      p.life += 1;
      if (p.life > MAX_LIFE) continue;
      alive += 1;
      p.vy += 0.25;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p.life / MAX_LIFE);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 2)));
      ctx.restore();
    }
    if (alive > 0) requestAnimationFrame(frame);
    else canvas.remove();
  }
  requestAnimationFrame(frame);
}
