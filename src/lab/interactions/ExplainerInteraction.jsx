/**
 * Animated explainer: one `Playback` clock drives the scene (via sceneAt),
 * the Arabic captions (captionAt) and — when a recording is attached — the
 * narration audio. Controls: play/pause, replay, mute, speed, seek.
 * Disposing on unmount stops audio when the student navigates away.
 *
 * After the explainer, the same simulation opens for free exploration.
 *
 * An optional browser speech preview exists for authors; it is labelled as a
 * preview and is not treated as real Egyptian-Arabic narration.
 * @module lab/interactions/ExplainerInteraction
 */
import { useEffect, useRef, useState } from 'react';
import { Playback, RATES } from '../../engine/narration/playback.js';
import { captionAt, captionIndexAt, sceneAt } from '../../engine/narration/timeline.js';
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js';
import { useGame } from '../../core/GameContext.jsx';
import FlowTankView from '../apparatus/FlowTankView.jsx';
import FlowTankInteraction from './FlowTankInteraction.jsx';
import { EquationTokens } from './EquationInteraction.jsx';
import Icon from '../../components/Icon.jsx';

const EQ = [
  { kind: 'var', value: 'V(t)' },
  { kind: 'op', value: '=' },
  { kind: 'sub', base: 'V', value: '0' },
  { kind: 'op', value: '+' },
  { kind: 'int', lower: '0', upper: 't' },
  { kind: 'var', value: 'Q(τ)' },
  { kind: 'text', value: 'dτ' },
];

const fmtClock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export default function ExplainerInteraction({ params, animation, resolveAsset, speechPreview = false }) {
  const { state } = useGame();
  const recording = animation.narration.status === 'recorded' ? animation.narration.assets.find((a) => a.kind === 'recorded') : null;
  const audioSrc = recording ? resolveAsset?.(recording.src) : null;
  const audioRef = useRef(null);
  const [t, setT] = useState(0);
  const [, force] = useState(0);
  const [explore, setExplore] = useState(false);
  const [useSpeech, setUseSpeech] = useState(false);
  const spoken = useRef(-1);

  // The playback is created in the effect (not during render) so that React's
  // StrictMode mount→cleanup→mount cycle gets a fresh, undisposed instance.
  // Cleanup disposes it: navigating away always stops audio and the clock.
  const [playback, setPlayback] = useState(null);
  useEffect(() => {
    const p = new Playback({ duration: animation.durationSec, audio: audioRef.current, onEnd: () => force((n) => n + 1) });
    setPlayback(p);
    return () => {
      p.dispose();
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    };
  }, [animation.durationSec, audioSrc]);

  // Teacher-mode pause also pauses the explainer.
  useEffect(() => {
    if (state.teacher.paused && playback?.playing) {
      playback.pause();
      force((n) => n + 1);
    }
  }, [state.teacher.paused, playback]);

  useAnimationFrame(() => {
    if (playback) setT(playback.time());
  }, Boolean(playback?.playing));

  // Optional author preview voice: speak each caption when it starts.
  const capIndex = captionIndexAt(animation.captions, t);
  useEffect(() => {
    if (!playback || !useSpeech || !playback.playing || playback.muted || capIndex < 0 || capIndex === spoken.current) return;
    spoken.current = capIndex;
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(animation.captions[capIndex].text.ar);
    u.lang = 'ar-EG';
    u.rate = playback.rate;
    synth.speak(u);
  }, [capIndex, useSpeech, playback, animation.captions]);

  const scene = sceneAt(animation.timeline, t);
  const caption = captionAt(animation.captions, t);
  const act = (fn) => () => {
    if (!playback) return;
    fn();
    if (!playback.playing) window.speechSynthesis?.cancel();
    spoken.current = -1;
    setT(playback.time());
    force((n) => n + 1);
  };

  if (explore) {
    return (
      <div className="explainer-explore">
        <p className="lab-note">نفس التجربة اللي في الفيديو، دلوقتي في إيدك.</p>
        <FlowTankInteraction params={{ ...params, controls: ['play', 'time', 'valve'], showArea: true }} />
        <button type="button" className="lab-btn ghost" onClick={() => setExplore(false)}>
          <Icon name="replay" size={18} /> ارجع للشرح المتحرك
        </button>
      </div>
    );
  }

  return (
    <div className="explainer">
      <div className="explainer-screen">
        <FlowTankView
          {...params}
          t={scene.simTime}
          shadeTo={scene.shadeTo}
          rects={scene.rects}
          focus={scene.focus}
          labels={scene.labels}
          height={260}
        />
        <div className="explainer-eq" style={{ opacity: scene.equation }} aria-hidden={scene.equation < 0.5}>
          <EquationTokens tokens={EQ} />
        </div>
      </div>

      <p className="caption" aria-live="polite" lang="ar" dir="rtl">
        {caption ? caption.text.ar : ' '}
      </p>

      {audioSrc && <audio ref={audioRef} src={audioSrc} preload="auto" />}

      <div className="player" role="group" aria-label="التحكم في الشرح المتحرك">
        <button type="button" className="lab-btn" onClick={act(() => playback.toggle())} aria-pressed={Boolean(playback?.playing)}>
          <Icon name={playback?.playing ? 'pause' : 'play'} size={18} /> {playback?.playing ? 'وقّف' : playback?.ended ? 'شغّل تاني' : 'شغّل'}
        </button>
        <button type="button" className="lab-btn ghost" onClick={act(() => playback.replay())}>
          <Icon name="replay" size={18} /> من الأول
        </button>
        <button type="button" className="lab-btn ghost" onClick={act(() => playback.setMuted(!playback.muted))} aria-pressed={Boolean(playback?.muted)}>
          <Icon name={playback?.muted ? 'mute' : 'sound'} size={18} /> {playback?.muted ? 'الصوت مقفول' : 'الصوت شغال'}
        </button>
        <label className="player-speed">
          السرعة
          <select value={playback?.rate ?? 1} onChange={(e) => act(() => playback.setRate(Number(e.target.value)))()}>
            {RATES.map((r) => (
              <option key={r} value={r}>
                {r}×
              </option>
            ))}
          </select>
        </label>
        <input
          className="player-seek"
          type="range"
          min={0}
          max={animation.durationSec}
          step={0.1}
          value={t}
          dir="ltr"
          aria-label="مكان الشرح"
          onChange={(e) => act(() => playback.seek(Number(e.target.value)))()}
        />
        <span className="player-time" dir="ltr">
          {fmtClock(t)} / {fmtClock(animation.durationSec)}
        </span>
      </div>

      <p className="narration-status">
        {recording
          ? 'الصوت: تسجيل بشري مرفوع.'
          : 'الصوت: لسه مفيش تسجيل للدرس ده — الشرح بالترجمة المكتوبة بس.'}
        {speechPreview && !recording && (
          <label className="speech-preview">
            <input type="checkbox" checked={useSpeech} onChange={(e) => setUseSpeech(e.target.checked)} /> تجربة صوت المتصفح (معاينة للمؤلف بس — مش لهجة مصرية مضمونة)
          </label>
        )}
      </p>

      {(playback?.ended || t >= animation.durationSec - 0.05) && (
        <button type="button" className="lab-btn" onClick={() => { playback?.pause(); window.speechSynthesis?.cancel(); setExplore(true); }}>
          <Icon name="sculpt" size={18} /> جرّب نفس التجربة بنفسك
        </button>
      )}
    </div>
  );
}
