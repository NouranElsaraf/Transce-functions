/**
 * Experiment: tank and flow-rate graph in sync. Controls (per lesson params):
 * play/pause the clock, scrub time, open/close the valve (scales Q).
 * @module lab/interactions/FlowTankInteraction
 */
import { useState } from 'react';
import Slider from '../../components/Slider.jsx';
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js';
import FlowTankView from '../apparatus/FlowTankView.jsx';
import { fmt } from '../format.js';
import Icon from '../../components/Icon.jsx';

const SECONDS_FOR_RUN = 12;

export default function FlowTankInteraction({ params, initialTime = 0, autoPlay = false }) {
  const { profile, initialVolume, capacity, duration, controls = [], showArea = true } = params;
  const [t, setT] = useState(initialTime);
  const [valve, setValve] = useState(1);
  const [playing, setPlaying] = useState(autoPlay);

  useAnimationFrame((dt) => {
    setT((prev) => {
      const next = prev + (dt * duration) / SECONDS_FOR_RUN;
      if (next >= duration) {
        setPlaying(false);
        return duration;
      }
      return next;
    });
  }, playing);

  return (
    <div className="experiment">
      <FlowTankView profile={profile} initialVolume={initialVolume} capacity={capacity} duration={duration} t={t} valve={valve} shadeTo={showArea ? t : 0} />
      {controls.length > 0 && (
        <div className="bench-controls">
          {controls.includes('play') && (
            <button
              type="button"
              className="lab-btn"
              onClick={() => {
                if (t >= duration) setT(0);
                setPlaying((p) => !p);
              }}
              aria-pressed={playing}
            >
              <Icon name={playing ? 'pause' : t >= duration ? 'replay' : 'play'} size={18} /> {playing ? 'وقّف' : t >= duration ? 'من الأول' : 'شغّل الوقت'}
            </button>
          )}
          {controls.includes('time') && (
            <Slider label="الزمن (دقيقة)" value={t} min={0} max={duration} step={0.1} onChange={(v) => { setPlaying(false); setT(v); }} format={(v) => fmt(v, 1)} />
          )}
          {controls.includes('valve') && (
            <Slider label="فتحة المحبس (بتضرب المعدل كله)" value={valve} min={0.5} max={1.6} step={0.1} onChange={setValve} format={(v) => `× ${fmt(v, 1)}`} />
          )}
        </div>
      )}
    </div>
  );
}
