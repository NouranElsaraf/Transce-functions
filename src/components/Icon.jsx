/**
 * Minimal stroke icon set (24×24, currentColor). Hand-drawn paths keep the
 * bundle dependency-free and give the UI a consistent, calm line style.
 * @module Icon
 */

const PATHS = {
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6',
  flame: 'M12 21c-4 0-6.5-2.8-6.5-6.2C5.5 10 10 8 10 3c3 1.5 7 5.5 7 10.5 0 .9-.1 1.6-.3 2.2.8-.6 1.3-1.6 1.4-2.7 1 1.2 1.4 2.4 1.4 3.4C19.5 19 16 21 12 21z',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  car: 'M3 16v-3l2-5h14l2 5v3H3zM7 16v2M17 16v2M6.5 13h.01M17.5 13h.01',
  crown: 'M3 8l4 4 5-7 5 7 4-4-2 11H5L3 8z',
  sculpt: 'M3 17c3 0 4-10 9-10s6 10 9 10M3 21h18',
  beam: 'M4 12h3M7 9l12-5v16L7 15V9z',
  swing: 'M12 3v2M12 5l-5 11M5 18a2 2 0 104 0 2 2 0 00-4 0M12 5l5 11',
  chain: 'M3 5c3 12 15 12 18 0M3 5v-1M21 5v-1',
  door: 'M6 21V4a1 1 0 011-1h10a1 1 0 011 1v17M3 21h18M14 12h.01',
  star: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3z',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z',
  rocket: 'M5 15c-1.5 1.5-2 4-2 6 2 0 4.5-.5 6-2M9 15l-3-3c1-4 4-8 11-9-1 7-5 10-9 11l-3-3M15 9h.01',
  moon: 'M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z',
  sun: 'M12 17a5 5 0 100-10 5 5 0 000 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4zM7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3',
  sound: 'M11 5L6 9H3v6h3l5 4V5zM15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13',
  mute: 'M11 5L6 9H3v6h3l5 4V5zM22 9l-6 6M16 9l6 6',
  teacher: 'M2 9l10-5 10 5-10 5-10-5zM6 11v5c3 2 9 2 12 0v-5M22 9v6',
  lock: 'M6 11h12v10H6V11zM8 11V7a4 4 0 118 0v4',
  check: 'M4 12l5 5L20 6',
  close: 'M6 6l12 12M18 6L6 18',
  left: 'M15 18l-6-6 6-6',
  right: 'M9 18l6-6-6-6',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z',
  pause: 'M8 5v14M16 5v14',
  play: 'M7 4l13 8-13 8V4z',
  pen: 'M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3',
  eraser: 'M8 20h12M5 15l9-9 5 5-9 9H8l-3-3v-2z',
  reset: 'M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8M3 3v5h5',
  skip: 'M5 5l10 7-10 7V5zM19 5v14',
  unlock: 'M6 11h12v10H6V11zM8 11V7a4 4 0 017.8-1.2',
  reveal: 'M12 3v2M5.6 5.6l1.4 1.4M3 12h2M19 12h2M17 7l1.4-1.4M8 16a4 4 0 118 0M4 20h16',
  map: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14',
  replay: 'M4 4v6h6M20 20v-6h-6M5.5 15a8 8 0 0013.9 2M18.5 9A8 8 0 004.6 7',
};

export default function Icon({ name, size = 20, strokeWidth = 1.8, className = '', title }) {
  const d = PATHS[name] || PATHS.spark;
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      <path d={d} />
    </svg>
  );
}
