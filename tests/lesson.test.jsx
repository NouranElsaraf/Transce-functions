import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { GameProvider, useGame } from '../src/core/GameContext.jsx';
import { LEVELS } from '../src/levels/registry.js';
import { LESSONS } from '../src/lesson/registry.js';
import { LessonProvider } from '../src/lesson/LessonContext.jsx';
import LessonToolbar from '../src/lesson/LessonToolbar.jsx';
import Misconceptions from '../src/lesson/Misconceptions.jsx';

const arabic = /[؀-ۿ]/;

describe('lesson content', () => {
  it.each(LEVELS.map((l) => [l.meta.title, l.meta]))('%s has complete bilingual companion content', (_, meta) => {
    const lesson = LESSONS[meta.id];
    expect(lesson).toBeTruthy();
    for (const key of ['reality', 'engineer']) {
      expect(lesson[key].en).toHaveLength(3);
      expect(lesson[key].ar).toHaveLength(3);
      lesson[key].ar.forEach((s) => expect(s).toMatch(arabic));
    }
    expect(lesson.misconceptions).toHaveLength(3);
    for (const m of lesson.misconceptions) {
      expect(m.en).toHaveLength(2);
      expect(m.ar).toHaveLength(2);
      expect(m.ar[1]).toMatch(arabic);
    }
    for (const step of meta.steps) {
      const s = lesson.steps[step.id];
      expect(s, `${meta.id}/${step.id}`).toBeTruthy();
      expect(s.ask.en.length).toBeGreaterThan(10);
      expect(s.ask.ar).toMatch(arabic);
      expect(s.masry).toHaveLength(2);
      s.masry.forEach((text) => expect(text).toMatch(arabic));
      if (s.bridge) {
        expect(s.bridge.en).toHaveLength(3);
        expect(s.bridge.ar).toHaveLength(3);
      }
    }
    expect(Object.keys(lesson.steps).sort()).toEqual(meta.steps.map((s) => s.id).sort());
  });
});

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
  window.localStorage.clear();
});

const api = { answer: (ok) => ok, hint: () => {}, complete: () => {}, reveal: true, paused: false, accent: '#000' };

function Masry({ on, children }) {
  const { actions, state } = useGame();
  if (state.settings.masry !== on) actions.setSetting('masry', on);
  return children;
}

describe('every formula is introduced through reality first', () => {
  const cases = LEVELS.flatMap((l) => l.steps.map((Step, i) => [`${l.meta.id}/${l.meta.steps[i].id}`, l.meta.id, l.meta.steps[i].id, Step]));
  it.each(cases)('%s', (_, levelId, stepId, Step) => {
    const el = render(
      <Masry on>
        <LessonProvider levelId={levelId} stepId={stepId}>
          <Step api={api} />
        </LessonProvider>
      </Masry>,
    );
    if (el.querySelector('.insight-formula')) {
      expect(el.querySelector('.bridge'), 'formula without a real-life bridge').toBeTruthy();
    }
    expect(el.querySelector('.masry-card')?.textContent).toMatch(arabic);
    expect(el.querySelector('.discovery')).toBeTruthy();
  });
});

describe('companion UI', () => {
  it('shows both real-world buttons and the Masry toggle in a lesson', () => {
    const el = render(
      <LessonProvider levelId="speed-detective" stepId="watch">
        <LessonToolbar />
      </LessonProvider>,
    );
    expect(el.textContent).toContain('فين بنشوف ده في الحقيقة؟');
    expect(el.textContent).toContain('المهندس بيستخدم ده فين؟');
    expect(el.textContent).toContain('اشرحها بالمصري');
    const reality = [...el.querySelectorAll('.lesson-btn')][0];
    act(() => reality.click());
    expect(el.querySelectorAll('.lesson-sheet li')).toHaveLength(3);
  });

  it('lists three misconceptions, in Arabic when Masry mode is on', () => {
    const el = render(
      <Masry on>
        <Misconceptions levelId="the-swing" />
      </Masry>,
    );
    expect(el.querySelectorAll('.misconceptions li')).toHaveLength(3);
    expect(el.textContent).toMatch(arabic);
  });
});
