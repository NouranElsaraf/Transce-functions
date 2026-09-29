/**
 * 0–3 star display; `animate` pops them in one by one.
 * @module Stars
 */
import Icon from './Icon.jsx';

export default function Stars({ count = 0, max = 3, size = 18, animate = false }) {
  return (
    <span className={`stars ${animate ? 'stars-animate' : ''}`} aria-label={`${count} of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`star ${i < count ? 'is-on' : ''}`} style={{ animationDelay: `${0.3 + i * 0.25}s` }}>
          <Icon name="star" size={size} strokeWidth={1.5} />
        </span>
      ))}
    </span>
  );
}
