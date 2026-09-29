/**
 * The door. Type the five collected digits on the keypad. A wrong code shakes;
 * the right one swings the vault open, fires confetti and shows the escape time.
 * @module EscapeRoom/LockDoor
 */
import { useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import M from '../../components/MathText.jsx';
import { sound } from '../../core/sound.js';
import { confetti } from '../../core/confetti.js';
import VaultBar from './VaultBar.jsx';
import { CODE, elapsed } from './vault.js';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '↵'];

export default function LockDoor({ api }) {
  const [entry, setEntry] = useState('');
  const [shake, setShake] = useState(0);
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(null);

  const press = (k) => {
    if (open) return;
    if (k === '⌫') return setEntry((e) => e.slice(0, -1));
    if (k === '↵') {
      const ok = entry === CODE.join('');
      api.answer(ok);
      if (ok) {
        setTime(elapsed());
        setOpen(true);
        sound.play('levelUp');
        confetti({ count: 200, spread: 1.4 });
      } else {
        setShake((n) => n + 1);
        setEntry('');
      }
      return;
    }
    sound.play('tick');
    if (entry.length < CODE.length) setEntry((e) => e + k);
  };

  return (
    <>
      <VaultBar solved={CODE.length} current={-1} />
      <StepLayout
        api={api}
        eyebrow="The door"
        prompt={open ? 'You escaped!' : 'Enter the five digits you collected, in order.'}
        hint="Read the digits from the lock strip above: left to right."
        done={open}
        insightTitle={time ? `Escape time ${time}` : 'You escaped'}
        insight={
          <>
            Look at the code again: 2.7182… — it is <b>e</b>, the base that grows exactly as fast as it is. You opened this
            door with intuition, not memorisation.
          </>
        }
        formula={<M block>e ≈ 2.71828…</M>}
        continueLabel="Finish the chapter"
      >
        <div className={`door-scene ${open ? 'is-open' : ''}`}>
          <div className="door-light" />
          <div className="door door-left" />
          <div className="door door-right" />
          <div className="door-wheel" aria-hidden="true" />
        </div>
        {!open && (
          <div className="keypad-wrap">
            <div className="keypad-display" key={shake} data-shake={shake > 0}>
              {CODE.map((_, i) => (
                <span key={i}>{entry[i] ?? '•'}</span>
              ))}
            </div>
            <div className="keypad">
              {KEYS.map((k) => (
                <button key={k} type="button" className={`key ${k === '↵' ? 'key-enter' : ''}`} onClick={() => press(k)} aria-label={k === '⌫' ? 'Delete' : k === '↵' ? 'Enter' : k}>
                  {k}
                </button>
              ))}
            </div>
          </div>
        )}
      </StepLayout>
    </>
  );
}
