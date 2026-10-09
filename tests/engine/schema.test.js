import { describe, expect, it } from 'vitest';
import { validateLesson, resolveNumeric, PHASES } from '../../src/engine/schema/lessonSchema.js';
import { INTERACTIONS, interactionsForSkill, SKILLS } from '../../src/engine/interactions/catalog.js';
import { RENDERERS } from '../../src/lab/registry.jsx';
import { demoLesson } from '../helpers.js';

const errorsOf = (l) => validateLesson(l).errors.map((e) => `${e.path}: ${e.message}`);

describe('lesson schema v1', () => {
  it('accepts the demo lesson, with narration flagged as a warning', () => {
    const r = validateLesson(demoLesson());
    expect(r.errors).toEqual([]);
    expect(r.ok).toBe(true);
    expect(r.warnings.map((w) => w.path)).toContain('animation.narration');
  });

  it('rejects unsupported interaction types and tells the author what is supported', () => {
    const l = demoLesson();
    l.stages[2].interaction = { type: 'vr-simulator', params: {} };
    expect(errorsOf(l).join('\n')).toMatch(/unsupported interaction "vr-simulator".*flag this concept/);
  });

  it('rejects negative flow rates in interaction parameters', () => {
    const l = demoLesson();
    l.stages[2].interaction.params.profile = [[0, 10], [5, -3]];
    expect(errorsOf(l).join('\n')).toMatch(/negative/);
  });

  it('rejects answers that cannot be computed or reference unknown computations', () => {
    const l = demoLesson();
    l.assessments[0].numeric.answer = { compute: 'trust-me', args: {} };
    expect(errorsOf(l).join('\n')).toMatch(/unknown computation "trust-me"/);
    const m = demoLesson();
    m.assessments[0].numeric.answer.args.t = 'ten';
    expect(errorsOf(m).join('\n')).toMatch(/cannot be computed/);
  });

  it('rejects a literal answer field (answers must be computed)', () => {
    const l = demoLesson();
    l.assessments[0].numeric.value = 415;
    expect(errorsOf(l).join('\n')).toMatch(/assessments\[0\]\.numeric\.value: unknown field/);
  });

  it('enforces the teaching order and every phase', () => {
    const l = demoLesson();
    [l.stages[5], l.stages[2]] = [l.stages[2], l.stages[5]]; // equation before experiment
    expect(errorsOf(l).join('\n')).toMatch(/must follow problem → prediction/);
    const m = demoLesson();
    m.stages = m.stages.filter((s) => s.phase !== 'challenge');
    expect(errorsOf(m).join('\n')).toMatch(/missing the "challenge" phase/);
  });

  it('requires every objective to be assessed and every assessment to be placed', () => {
    const l = demoLesson();
    l.objectives.push({ id: 'o-extra', skill: 'computation', text: { ar: 'هدف زيادة' } });
    expect(errorsOf(l).join('\n')).toMatch(/"o-extra" is never assessed/);
    const m = demoLesson();
    m.stages.forEach((s) => (s.assessmentIds = (s.assessmentIds || []).filter((id) => id !== 'a-closed')));
    expect(errorsOf(m).join('\n')).toMatch(/"a-closed" is not placed/);
  });

  it('rejects choice questions without exactly one correct option', () => {
    const l = demoLesson();
    l.assessments[1].choice.options.forEach((o) => (o.correct = false));
    expect(errorsOf(l).join('\n')).toMatch(/exactly one correct option/);
  });

  it('checks the animation: 30–60 s, captions inside and non-overlapping, Arabic text', () => {
    const l = demoLesson();
    l.animation.durationSec = 90;
    expect(errorsOf(l).join('\n')).toMatch(/30–60 seconds/);
    const m = demoLesson();
    m.animation.captions[1].t0 = 3;
    expect(errorsOf(m).join('\n')).toMatch(/overlaps the previous caption/);
    const n = demoLesson();
    n.animation.captions[0].text.ar = 'English only';
    expect(errorsOf(n).join('\n')).toMatch(/must be written in Arabic/);
    const o = demoLesson();
    o.animation.narration = { status: 'recorded', assets: [] };
    expect(errorsOf(o).join('\n')).toMatch(/no recording is attached/);
  });

  it('treats content as untrusted: rejects markup, script URLs, unknown fields and bad sources', () => {
    const l = demoLesson();
    l.stages[0].body.ar = 'شوف <img src=x onerror=alert(1)>';
    l.sources[0].url = 'javascript:alert(1)';
    l.surprise = true;
    const errs = errorsOf(l).join('\n');
    expect(errs).toMatch(/plain text/);
    expect(errs).toMatch(/https URL/);
    expect(errs).toMatch(/\$\.surprise: unknown field/);
  });

  it('only accepts Egyptian Arabic in schema v1 and requires AI provenance details', () => {
    const l = demoLesson();
    l.meta.language = 'en';
    l.provenance = { origin: 'ai-generated', createdAt: '2026-01-01', note: 'x' };
    const errs = errorsOf(l).join('\n');
    expect(errs).toMatch(/ar-EG/);
    expect(errs).toMatch(/provider and model/);
  });

  it('flags unsupported concepts for author review (warning, not silent)', () => {
    const l = demoLesson();
    l.unsupportedConcepts = [{ concept: 'water leaving through a drain (negative flow)', reason: 'no outflow interaction yet' }];
    const r = validateLesson(l);
    expect(r.ok).toBe(true);
    expect(r.warnings.some((w) => /flagged for author review/.test(w.message))).toBe(true);
  });

  it('resolves numeric answers programmatically, including new-value challenges', () => {
    const l = demoLesson();
    const ch = l.assessments.find((a) => a.id === 'a-challenge');
    for (const seed of [1, 2, 3, 99]) {
      const { value, values } = resolveNumeric(ch.numeric, seed);
      expect(value).toBeCloseTo(values.initialVolume + ((values.q0 + values.q1) / 2) * values.duration, 10);
    }
  });
});

describe('interaction catalogue and renderer registry', () => {
  it('every catalogued interaction has a renderer (new lessons need no renderer change)', () => {
    expect(Object.keys(RENDERERS).sort()).toEqual(Object.keys(INTERACTIONS).sort());
  });
  it('selects interactions by learning objective skill', () => {
    expect(interactionsForSkill('approximation')).toContain('riemann-sum');
    expect(interactionsForSkill('accumulation')).toContain('flow-tank');
    for (const s of SKILLS) expect(interactionsForSkill(s).length).toBeGreaterThan(0);
  });
  it('the demo lesson walks the full teaching flow', () => {
    expect([...new Set(demoLesson().stages.map((s) => s.phase))]).toEqual(PHASES);
  });
  it('warns when no interaction serves an objective skill', () => {
    const l = demoLesson();
    // Both the rectangle stage and the explainer (which animates rectangles) teach approximation.
    l.stages = l.stages.map((s) => (['riemann-sum', 'explainer'].includes(s.interaction?.type) ? { ...s, interaction: { type: 'question', params: {} } } : s));
    expect(validateLesson(l).warnings.some((w) => /approximation/.test(w.message))).toBe(true);
  });
});
