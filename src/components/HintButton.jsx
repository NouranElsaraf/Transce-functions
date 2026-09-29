/**
 * Reveal-on-demand hint. The first reveal registers a hint (costs a star);
 * the text then stays visible.
 * @module HintButton
 */
import { useState } from 'react';
import Icon from './Icon.jsx';

export default function HintButton({ hint, api }) {
  const [open, setOpen] = useState(false);
  if (!hint) return null;
  return (
    <div className="hint">
      {!open ? (
        <button
          type="button"
          className="hint-btn"
          onClick={() => {
            setOpen(true);
            api?.hint();
          }}
        >
          <Icon name="bulb" size={16} /> Need a nudge?
        </button>
      ) : (
        <p className="hint-text" role="note">
          <Icon name="bulb" size={16} /> {hint}
        </p>
      )}
    </div>
  );
}
