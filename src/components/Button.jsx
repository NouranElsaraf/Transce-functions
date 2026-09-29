/**
 * Large, rounded button with variants: primary · secondary · ghost · success.
 * Plays a soft click sound on press.
 * @module Button
 */
import { sound } from '../core/sound.js';
import Icon from './Icon.jsx';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  className = '',
  onClick,
  silent = false,
  ...rest
}) {
  return (
    <button
      type="button"
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={(e) => {
        if (!silent) sound.play('click');
        onClick?.(e);
      }}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === 'lg' ? 22 : 18} />}
      {children && <span>{children}</span>}
      {iconRight && <Icon name={iconRight} size={size === 'lg' ? 22 : 18} />}
    </button>
  );
}
