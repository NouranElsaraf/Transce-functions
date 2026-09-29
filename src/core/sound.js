/**
 * Tiny Web Audio synthesiser — every sound effect is generated in code,
 * so the game ships with zero audio files and works offline.
 *
 * Call `sound.setEnabled(false)` to mute; `sound.play(name)` is always safe to call.
 * @module sound
 */

let ctx = null;
let enabled = true;

function audio() {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** Play one soft enveloped tone. */
function tone(ac, { freq, start = 0, duration = 0.15, type = 'sine', gain = 0.12, slideTo }) {
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

const SOUNDS = {
  click: (ac) => tone(ac, { freq: 660, duration: 0.05, gain: 0.05, type: 'triangle' }),
  correct: (ac) => {
    tone(ac, { freq: 660, duration: 0.12 });
    tone(ac, { freq: 990, start: 0.08, duration: 0.18 });
  },
  wrong: (ac) => tone(ac, { freq: 220, duration: 0.22, type: 'triangle', gain: 0.1, slideTo: 170 }),
  combo: (ac) => [784, 988, 1175].forEach((f, i) => tone(ac, { freq: f, start: i * 0.06, duration: 0.12, gain: 0.08 })),
  levelUp: (ac) =>
    [523, 659, 784, 1047].forEach((f, i) => tone(ac, { freq: f, start: i * 0.1, duration: 0.3, gain: 0.1 })),
  achievement: (ac) =>
    [1319, 1568, 2093].forEach((f, i) => tone(ac, { freq: f, start: i * 0.07, duration: 0.25, gain: 0.06, type: 'triangle' })),
  whoosh: (ac) => tone(ac, { freq: 300, duration: 0.25, gain: 0.04, slideTo: 900 }),
  tick: (ac) => tone(ac, { freq: 1200, duration: 0.03, gain: 0.03, type: 'square' }),
};

export const sound = {
  setEnabled(value) {
    enabled = Boolean(value);
  },
  isEnabled() {
    return enabled;
  },
  play(name) {
    if (!enabled || !SOUNDS[name]) return;
    try {
      const ac = audio();
      if (ac) SOUNDS[name](ac);
    } catch {
      /* audio is decorative — never let it break the game */
    }
  },
};
