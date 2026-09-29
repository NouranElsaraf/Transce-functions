/**
 * The vault's lock strip: solved locks show their glowing digit, the current
 * lock pulses, the rest stay dark. `solved` counts locks opened so far.
 * @module EscapeRoom/VaultBar
 */
import Icon from '../../components/Icon.jsx';
import { CODE } from './vault.js';

export default function VaultBar({ solved, current }) {
  return (
    <div className="vault-bar" aria-label={`${solved} of ${CODE.length} locks open`}>
      {CODE.map((digit, i) => (
        <div key={i} className={`vault-slot ${i < solved ? 'is-open' : ''} ${i === current ? 'is-current' : ''}`}>
          {i < solved ? <span className="vault-digit">{digit}</span> : <Icon name="lock" size={18} />}
        </div>
      ))}
    </div>
  );
}
