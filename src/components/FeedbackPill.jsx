/**
 * Instant feedback after every answer: "+14 XP · 3× combo" or "Not quite — try again".
 * Driven by `state.lastGain`, so any step that calls `api.answer()` gets it for free.
 * @module FeedbackPill
 */
import { useEffect, useState } from 'react';
import { useGame } from '../core/GameContext.jsx';
import { sound } from '../core/sound.js';
import Icon from './Icon.jsx';

const PRAISE = ['Nice!', 'Sharp!', 'Exactly!', 'Nailed it!', 'Yes!', 'Beautiful!'];

export default function FeedbackPill() {
  const { state } = useGame();
  const [shown, setShown] = useState(null);
  const gain = state.lastGain;

  useEffect(() => {
    if (!gain) return undefined;
    setShown(gain);
    if (gain.combo > 0 && gain.combo % 5 === 0) sound.play('combo');
    const t = setTimeout(() => setShown(null), 1500);
    return () => clearTimeout(t);
  }, [gain]);

  if (!shown) return null;
  const good = shown.amount > 0;
  return (
    <div className={`feedback-pill ${good ? 'is-good' : 'is-bad'}`} key={shown.id} role="status">
      {good ? (
        <>
          <b>{PRAISE[shown.id % PRAISE.length]}</b>
          <span>+{shown.amount} XP</span>
          {shown.combo >= 2 && (
            <span className="feedback-combo">
              <Icon name="flame" size={14} /> {shown.combo}×
            </span>
          )}
        </>
      ) : (
        <b>Not quite — look again</b>
      )}
    </div>
  );
}
