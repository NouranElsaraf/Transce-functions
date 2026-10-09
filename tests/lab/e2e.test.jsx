import { act, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GameProvider } from '../../src/core/GameContext.jsx';
import LessonPlayer from '../../src/lab/LessonPlayer.jsx';
import ExplainerInteraction from '../../src/lab/interactions/ExplainerInteraction.jsx';
import { activePlayback } from '../../src/engine/narration/playback.js';
import { filterPublishable } from '../../src/engine/catalog/published.js';
import { resolveNumeric } from '../../src/engine/schema/lessonSchema.js';
import { createStore } from '../../server/store.mjs';
import { demoLesson, FULL_CHECKLIST, tempContent } from '../helpers.js';

let tmp;
let root;
let container;
beforeEach(() => {
  tmp = tempContent();
  window.localStorage.clear();
});
afterEach(() => {
  if (root) act(() => root.unmount());
  container?.remove();
  root = null;
  tmp.cleanup();
});

function mount(ui, { strict = false } = {}) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const tree = <GameProvider>{ui}</GameProvider>;
  // strict: wrap the whole root exactly like src/main.jsx does.
  act(() => root.render(strict ? <StrictMode>{tree}</StrictMode> : tree));
  return container;
}
function unmount() {
  act(() => root.unmount());
  container.remove();
  root = null;
}

const byText = (el, text, selector = 'button') =>
  [...el.querySelectorAll(selector)].find((b) => b.textContent.replace(/\s+/g, ' ').trim().includes(text));
const click = (node) => {
  expect(node, 'element to click').toBeTruthy();
  act(() => node.click());
};
const type = (input, value) => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  act(() => {
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
};
const answerNumeric = (el, value, index = 0) => {
  const forms = [...el.querySelectorAll('form.assess')];
  const form = forms[index];
  type(form.querySelector('input'), String(value));
  click(byText(form, 'اتأكد'));
};
const next = (el) => click(byText(el, 'اللي بعده'));

/** Run the real authoring pipeline in a temporary content folder. */
async function authorAndPublish() {
  const store = createStore(tmp.dir);
  await store.importLesson(demoLesson(), { by: 'author' }); // import (untrusted) → draft
  await store.submit('integration-water-tank', 'author'); // validated → in review
  await store.approve('integration-water-tank', { by: 'Dr. Mona (reviewer)', checklist: FULL_CHECKLIST, acknowledgeFlags: true });
  await store.publish('integration-water-tank', 'Dr. Mona (reviewer)');
  const snapshot = await store.getPublished('integration-water-tank');
  const { lessons, rejected } = filterPublishable([snapshot]); // the student-side gate
  expect(rejected).toEqual([]);
  return lessons[0];
}

describe('end to end: authoring → publishing gate → student lesson → progress', () => {
  it('a student completes the integration lesson by demonstrating every objective; progress persists and restores', async () => {
    const lesson = await authorAndPublish();
    const el = mount(<LessonPlayer lesson={lesson} mode="student" resolveAsset={() => null} />, { strict: true });
    expect(el.querySelector('.preview-banner')).toBeNull();

    // problem
    expect(el.textContent).toContain('خزان سعته ٥٠٠ لتر');
    expect(el.querySelector('.gauges')).toBeTruthy();
    next(el);

    // prediction: cannot continue before predicting
    expect(byText(el, 'اللي بعده').disabled).toBe(true);
    answerNumeric(el, 415);
    expect(el.textContent).toContain('توقع حلو');
    next(el);

    // experiment: tank + graph + reasoning question (a wrong pick explains the misconception)
    click(byText(el, 'ارتفاع المنحنى عند دقيقة ٦'));
    expect(el.textContent).toContain('غلطة شائعة');
    expect(byText(el, 'اللي بعده').disabled).toBe(true);
    click(byText(el, 'المساحة تحت المنحنى من ٠ لـ ٦'));
    next(el);

    // explainer (no gate) → rectangles
    expect(el.querySelector('.caption')).toBeTruthy();
    next(el);
    answerNumeric(el, 380, 0);
    click(byText(el, 'هيصغر ويقرب من الصفر'));
    next(el);

    // equation (oriented LTR inside the RTL page) + units question
    expect(el.querySelector('.eq').getAttribute('dir')).toBe('ltr');
    click(byText(el, 'الرمز Q(τ)'));
    next(el);

    // guided practice
    answerNumeric(el, 220, 0);
    click(byText(el, 'يفضل ثابت على آخر قيمة'));
    next(el);

    // independent challenge with new values (answer computed by the engine)
    const ch = lesson.assessments.find((a) => a.id === 'a-challenge');
    const { value, values } = resolveNumeric(ch.numeric, 1);
    expect(el.textContent).toContain(`من ${values.q0} لـ ${values.q1}`);
    answerNumeric(el, value + 50, 0); // wrong first
    expect(el.textContent).toContain('شبه منحرف');
    answerNumeric(el, value, 0);
    click(byText(el, 'خلّص الدرس'));
    expect(el.textContent).toContain('خلّصت الدرس');

    // persisted in the existing save
    const saved = JSON.parse(window.localStorage.getItem('transcendental-quest:progress'));
    const entry = saved.lessons['integration-water-tank'];
    expect(entry.completed).toBe(true);
    expect(Object.keys(entry.objectives).sort()).toEqual(['o-approx', 'o-area', 'o-compute', 'o-units']);
    expect(saved.xp).toBeGreaterThan(0);

    // restore after reload
    unmount();
    const el2 = mount(<LessonPlayer lesson={lesson} mode="student" resolveAsset={() => null} />, { strict: true });
    expect(el2.textContent).toContain('خلّصت الدرس');
    expect(el2.querySelectorAll('.notebook .objective-list li.is-done')).toHaveLength(4);
  });

  it('elimination does not count: a choice solved on the second pick leaves its objective open', async () => {
    const lesson = await authorAndPublish();
    const el = mount(<LessonPlayer lesson={lesson} mode="student" resolveAsset={() => null} />, { strict: true });
    next(el);
    answerNumeric(el, 999);
    next(el);
    click(byText(el, 'ميل المنحنى عند دقيقة ٦'));
    click(byText(el, 'المساحة تحت المنحنى من ٠ لـ ٦'));
    expect(el.textContent).toContain('حاول تاني من الأول');
    const saved = JSON.parse(window.localStorage.getItem('transcendental-quest:progress'));
    expect(saved.lessons['integration-water-tank'].objectives['o-area']).toBeUndefined();
  });

  it('preview mode renders a draft for review without writing progress', () => {
    const el = mount(<LessonPlayer lesson={{ ...demoLesson(), review: { status: 'in_review', history: [] } }} mode="preview" resolveAsset={() => null} />);
    expect(el.querySelector('.preview-banner').textContent).toContain('مش منشور');
    expect(el.querySelector('.preview-banner').textContent).toContain('مش مولّد بالذكاء الاصطناعي');
    next(el);
    answerNumeric(el, 415);
    expect(JSON.parse(window.localStorage.getItem('transcendental-quest:progress') ?? '{}').lessons ?? {}).toEqual({});
  });
});

describe('explainer controls', () => {
  it('play / pause / mute / speed / replay drive one playback, which stops on navigation', () => {
    const lesson = demoLesson();
    const params = lesson.stages.find((s) => s.interaction?.type === 'explainer').interaction.params;
    // StrictMode on purpose: effects mount → clean up → mount again, like the dev app.
    // (Regression: a playback disposed by that first cleanup could never play.)
    const el = mount(<ExplainerInteraction params={params} animation={lesson.animation} resolveAsset={() => null} />, { strict: true });
    expect(el.querySelector('.narration-status').textContent).toContain('مفيش تسجيل');
    click(byText(el, 'شغّل'));
    expect(activePlayback()).not.toBeNull();
    expect(activePlayback().playing).toBe(true);
    click(byText(el, 'الصوت شغال'));
    expect(activePlayback().muted).toBe(true);
    const speed = el.querySelector('.player-speed select');
    act(() => {
      speed.value = '1.5';
      speed.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(activePlayback().rate).toBe(1.5);
    click(byText(el, 'وقّف'));
    expect(activePlayback()).toBeNull();
    click(byText(el, 'من الأول'));
    const p = activePlayback();
    expect(p.playing).toBe(true);
    unmount(); // navigation away
    expect(p.disposed).toBe(true);
    expect(activePlayback()).toBeNull();
  });
});
