/**
 * Playback controller for the explainer: one clock for animation, captions and
 * narration audio, with play / pause / replay / seek / speed / mute.
 *
 * Guarantees:
 *  - Only one playback is active app-wide: starting one pauses any other, so
 *    narration never overlaps.
 *  - `dispose()` stops audio and the clock; components call it on unmount
 *    (i.e. on navigation).
 *  - With an audio track the clock follows `audio.currentTime` (the recording
 *    is the master); otherwise a monotonic internal clock is used.
 *
 * The audio object only needs the HTMLMediaElement subset used here, so tests
 * can pass a fake.
 * @module engine/narration/playback
 */

let active = null;

export const RATES = [0.75, 1, 1.25, 1.5];

export class Playback {
  /**
   * @param {{ duration: number, now?: () => number, audio?: any, onEnd?: () => void }} opts
   */
  constructor({ duration, now = () => performance.now(), audio = null, onEnd } = {}) {
    if (!(duration > 0)) throw new RangeError('duration must be > 0');
    this.duration = duration;
    this.now = now;
    this.audio = audio;
    this.onEnd = onEnd;
    this.rate = 1;
    this.muted = false;
    this.playing = false;
    this.ended = false;
    this.disposed = false;
    this._base = 0; // timeline seconds at _startedAt
    this._startedAt = 0;
    if (audio) {
      audio.preload = 'auto';
      audio.muted = false;
      audio.playbackRate = 1;
    }
  }

  /** Current timeline time in seconds, clamped to [0, duration]. */
  time() {
    let t;
    if (this.playing && this.audio && this._audioDriving()) {
      // Follow the recording, and keep the internal clock aligned so that if
      // the recording ends early the animation carries on without a jump.
      t = this.audio.currentTime;
      this._base = t;
      this._startedAt = this.now();
    } else if (this.playing) t = this._base + ((this.now() - this._startedAt) / 1000) * this.rate;
    else t = this._base;
    if (t >= this.duration) {
      if (this.playing) this._finish();
      return this.duration;
    }
    return Math.max(0, t);
  }

  _audioDriving() {
    const a = this.audio;
    return a && !a.paused && Number.isFinite(a.duration) && a.duration > 0 && a.currentTime <= a.duration;
  }

  _finish() {
    this.playing = false;
    this.ended = true;
    this._base = this.duration;
    if (this.audio) this.audio.pause();
    if (active === this) active = null;
    this.onEnd?.();
  }

  play() {
    if (this.disposed) return;
    if (active && active !== this) active.pause();
    active = this;
    if (this.ended || this._base >= this.duration) this._base = 0;
    this.ended = false;
    this.playing = true;
    this._startedAt = this.now();
    if (this.audio) {
      this.audio.currentTime = this._base;
      this.audio.playbackRate = this.rate;
      this.audio.muted = this.muted;
      const p = this.audio.play();
      if (p && typeof p.catch === 'function') p.catch(() => {}); // autoplay blocked → internal clock keeps captions running
    }
  }

  pause() {
    if (!this.playing) return;
    this._base = this.time();
    this.playing = false;
    if (this.audio) this.audio.pause();
    if (active === this) active = null;
  }

  toggle() {
    if (this.playing) this.pause();
    else this.play();
  }

  replay() {
    this.seek(0);
    this.play();
  }

  seek(t) {
    this._base = Math.min(Math.max(0, t), this.duration);
    this.ended = this._base >= this.duration;
    this._startedAt = this.now();
    if (this.audio) this.audio.currentTime = this._base;
  }

  setRate(rate) {
    if (!RATES.includes(rate)) throw new RangeError(`rate must be one of ${RATES.join(', ')}`);
    this._base = this.time();
    this._startedAt = this.now();
    this.rate = rate;
    if (this.audio) this.audio.playbackRate = rate;
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    if (this.audio) this.audio.muted = this.muted;
  }

  dispose() {
    this.pause();
    this.disposed = true;
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute?.('src');
      this.audio.load?.();
    }
    if (active === this) active = null;
  }
}

/** The playback currently producing sound/motion (for tests and diagnostics). */
export const activePlayback = () => active;
