/**
 * End-of-level celebration: animated stars, XP earned, the big idea recap and
 * the next action (next level · replay · map).
 * @module LevelComplete
 */
import { useGame } from '../core/GameContext.jsx';
import { xpForLevel } from '../core/scoring.js';
import Button from './Button.jsx';
import Stars from './Stars.jsx';

const HEADLINES = ['Level complete', 'Level complete', 'Great work', 'Flawless!'];

export default function LevelComplete({ meta, run, onNext, onReplay, onMap, isLast }) {
  const { state } = useGame();
  const stars = run.stars ?? 0;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="complete-title">
      <div className="modal card level-complete" style={{ '--level-accent': meta.accent }}>
        <div className="eyebrow">Level {meta.order}</div>
        <h2 id="complete-title">{HEADLINES[stars]}</h2>
        <Stars count={stars} size={44} animate />
        <div className="complete-stats">
          <div>
            <b>+{stars ? xpForLevel(stars) : 0}</b>
            <span>XP</span>
          </div>
          <div>
            <b>{run.mistakes}</b>
            <span>slips</span>
          </div>
          <div>
            <b>{run.hints}</b>
            <span>hints</span>
          </div>
          <div>
            <b>{state.bestCombo}×</b>
            <span>best combo</span>
          </div>
        </div>
        <div className="big-idea">
          <div className="eyebrow">The big idea</div>
          <p>{meta.bigIdea}</p>
        </div>
        <div className="modal-actions">
          <Button variant="ghost" icon="map" onClick={onMap}>
            Map
          </Button>
          <Button variant="secondary" icon="replay" onClick={onReplay}>
            Replay
          </Button>
          {!isLast && (
            <Button size="lg" iconRight="right" onClick={onNext} autoFocus>
              Next level
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
