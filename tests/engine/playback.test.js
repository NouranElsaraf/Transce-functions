import { describe, expect, it, vi } from 'vitest';
import { Playback, activePlayback } from '../../src/engine/narration/playback.js';
import { captionAt, sceneAt } from '../../src/engine/narration/timeline.js';
import { demoLesson } from '../helpers.js';

const clock = () => {
  let ms = 0;
  return { now: () => ms, advance: (s) => (ms += s * 1000) };
};

function fakeAudio(duration = 48) {
  return {
    paused: true,
    currentTime: 0,
    duration,
    muted: false,
    playbackRate: 1,
    play: vi.fn(function play() {
      this.paused = false;
      return Promise.resolve();
    }),
    pause: vi.fn(function pause() {
      this.paused = true;
    }),
    removeAttribute: vi.fn(),
    load: vi.fn(),
  };
}

describe('single timeline playback', () => {
  it('plays, pauses and resumes without jumping', () => {
    const c = clock();
    const p = new Playback({ duration: 48, now: c.now });
    p.play();
    c.advance(5);
    expect(p.time()).toBeCloseTo(5);
    p.pause();
    c.advance(10);
    expect(p.time()).toBeCloseTo(5);
    p.play();
    c.advance(2);
    expect(p.time()).toBeCloseTo(7);
  });

  it('speed changes keep the current position and scale the clock', () => {
    const c = clock();
    const p = new Playback({ duration: 48, now: c.now });
    p.play();
    c.advance(4);
    p.setRate(1.5);
    c.advance(2);
    expect(p.time()).toBeCloseTo(7);
    expect(() => p.setRate(3)).toThrow();
  });

  it('seek, replay and end', () => {
    const c = clock();
    const onEnd = vi.fn();
    const p = new Playback({ duration: 30, now: c.now, onEnd });
    p.seek(28);
    p.play();
    c.advance(5);
    expect(p.time()).toBe(30);
    expect(p.playing).toBe(false);
    expect(onEnd).toHaveBeenCalledTimes(1);
    p.replay();
    expect(p.time()).toBe(0);
    expect(p.playing).toBe(true);
  });

  it('only one playback is active: starting another pauses the first (no overlapping audio)', () => {
    const c = clock();
    const a = new Playback({ duration: 40, now: c.now, audio: fakeAudio() });
    const b = new Playback({ duration: 40, now: c.now, audio: fakeAudio() });
    a.play();
    b.play();
    expect(a.playing).toBe(false);
    expect(a.audio.pause).toHaveBeenCalled();
    expect(activePlayback()).toBe(b);
  });

  it('with a recording, the audio is the master clock; mute and rate reach the audio', () => {
    const c = clock();
    const audio = fakeAudio();
    const p = new Playback({ duration: 48, now: c.now, audio });
    p.play();
    expect(audio.play).toHaveBeenCalled();
    audio.currentTime = 12.3;
    c.advance(50); // wall clock is irrelevant while audio drives
    expect(p.time()).toBeCloseTo(12.3);
    p.setMuted(true);
    expect(audio.muted).toBe(true);
    p.setRate(1.25);
    expect(audio.playbackRate).toBe(1.25);
    p.seek(20);
    expect(audio.currentTime).toBe(20);
  });

  it('dispose (navigation) stops audio and releases the active slot', () => {
    const audio = fakeAudio();
    const p = new Playback({ duration: 48, now: clock().now, audio });
    p.play();
    p.dispose();
    expect(audio.pause).toHaveBeenCalled();
    expect(audio.removeAttribute).toHaveBeenCalledWith('src');
    expect(activePlayback()).toBeNull();
    p.play();
    expect(p.playing).toBe(false);
  });
});

describe('captions and scene stay in sync on the same clock', () => {
  const { animation } = demoLesson();

  it('captions cover the whole explainer without gaps', () => {
    for (let t = 0; t < animation.durationSec; t += 0.25) expect(captionAt(animation.captions, t), `t=${t}`).not.toBeNull();
    expect(captionAt(animation.captions, animation.durationSec)).toBeNull();
  });

  it('the scene matches what each caption says at that moment', () => {
    expect(sceneAt(animation.timeline, 3).focus).toBe('tank');
    expect(sceneAt(animation.timeline, 10).focus).toBe('meter');
    const mid = sceneAt(animation.timeline, 19); // "first 3 minutes" caption
    expect(mid.simTime).toBeGreaterThan(0);
    expect(mid.simTime).toBeLessThan(3);
    expect(mid.shadeTo).toBeCloseTo(mid.simTime, 10); // tank and shaded area move together
    expect(sceneAt(animation.timeline, 28).labels.map((l) => l.id)).toContain('e7');
    const rects = sceneAt(animation.timeline, 36).rects;
    expect(rects.n).toBeGreaterThan(2);
    expect(sceneAt(animation.timeline, 47).equation).toBe(1);
    expect(sceneAt(animation.timeline, 47).simTime).toBe(10);
  });
});
