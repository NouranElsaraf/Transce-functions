import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { GameProvider } from '../src/core/GameContext.jsx';
import { LEVELS } from '../src/levels/registry.js';
import { LEVEL_METAS } from '../src/levels/metaRegistry.js';
import App from '../src/App.jsx';

let root;
let container;

function render(ui) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<GameProvider>{ui}</GameProvider>));
  return container;
}

afterEach(() => {
  if (root) act(() => root.unmount());
  container?.remove();
  root = null;
  container = null;
  window.localStorage.clear();
});

const api = { answer: (ok) => ok, hint: () => {}, complete: () => {}, reveal: false, paused: false, accent: '#000' };

describe('level registry', () => {
  it('component registry and metadata registry agree', () => {
    expect(LEVELS.map((l) => l.meta.id)).toEqual(LEVEL_METAS.map((m) => m.id));
  });

  it.each(LEVELS.map((l) => [l.meta.title, l]))('%s has one component per step', (_, level) => {
    expect(level.steps).toHaveLength(level.meta.steps.length);
    expect(level.meta.order).toBe(LEVELS.indexOf(level) + 1);
  });

  it('adds up to roughly an hour of play', () => {
    const minutes = LEVEL_METAS.reduce((n, m) => n + m.minutes, 0);
    expect(minutes).toBeGreaterThanOrEqual(50);
    expect(minutes).toBeLessThanOrEqual(75);
  });
});

describe('every step renders', () => {
  const cases = LEVELS.flatMap((l) => l.steps.map((Step, i) => [`${l.meta.title} › ${l.meta.steps[i].title}`, Step]));
  it.each(cases)('%s', (_, Step) => {
    const el = render(<Step api={api} />);
    expect(el.querySelector('h2')?.textContent.length).toBeGreaterThan(5);
  });

  it('teacher reveal shows the skip button on a fresh step', () => {
    const Step = LEVELS[0].steps[0];
    const el = render(<Step api={{ ...api, reveal: true }} />);
    expect(el.textContent).toContain('Skip step');
  });
});

describe('app shell', () => {
  it('renders the map with every level and locks all but the first', () => {
    window.location.hash = '';
    const el = render(<App />);
    const cards = el.querySelectorAll('.level-card');
    expect(cards).toHaveLength(LEVELS.length);
    expect(cards[0].disabled).toBe(false);
    expect(cards[1].disabled).toBe(true);
  });
});
