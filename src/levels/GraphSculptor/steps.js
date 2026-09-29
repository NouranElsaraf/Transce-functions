/**
 * Graph Sculptor step configurations. Each entry becomes one step via <SculptStep>.
 * Insights stay ≤ 3 sentences; equations appear only after the shape is matched.
 * @module GraphSculptor/steps
 */
import { createElement as h } from 'react';
import M from '../../components/MathText.jsx';

const math = (...children) => h(M, { block: true }, ...children);

export const STEP_CONFIGS = [
  {
    eyebrow: 'Warm-up',
    sub: 'Your curve is solid. The target is the dashed ghost. Only one control is available.',
    hint: 'The target is the same bowl, just higher. How much higher is its bottom?',
    challenges: [{ base: 'square', controls: ['k'], target: { k: 2 }, prompt: 'Move your bowl onto the ghost.', label: 'Lift' }],
    insight: 'Adding to the result moves every single point up by the same amount. The shape never changes — it just floats.',
    formula: math('y = x', h('sup', null, '2'), ' + 2'),
  },
  {
    eyebrow: 'Prediction',
    predict: {
      base: 'square',
      question: 'You are about to add 3 to x before squaring. Which way will the bowl move?',
      sub: 'Commit to a guess first. Being surprised is how the rule sticks.',
      hint: 'Where is the new bottom? The bottom happens when the thing being squared is 0.',
      options: [
        { id: 'up', label: 'Up', why: 'Adding to the result moves it up. This time we add to x first.' },
        { id: 'right', label: 'Right', why: 'Most people guess right! Test it: where does (x + 3) equal zero?' },
        { id: 'left', label: 'Left' },
        { id: 'down', label: 'Down', why: 'The height of the bottom doesn’t change here, only where it happens.' },
      ],
      correct: 'left',
    },
    sub: 'Now prove it: slide the bowl onto the ghost.',
    hint: 'The ghost’s bottom sits at x = −3.',
    challenges: [{ base: 'square', controls: ['c'], target: { c: 3 }, prompt: 'Slide the bowl onto the ghost.', label: 'Slide' }],
    insight:
      'Adding inside moves the graph the opposite way. The bottom used to be at x = 0; now it happens when x + 3 = 0, which is x = −3.',
    formula: math('y = (x + 3)', h('sup', null, '2')),
  },
  {
    eyebrow: 'Stretch & squeeze',
    sub: 'A new base shape: a wave. Match two targets in a row.',
    hint: 'One target is taller, the other has waves twice as often.',
    challenges: [
      { base: 'sin', controls: ['a'], target: { a: 2 }, prompt: 'Make the wave as tall as the ghost.', label: 'Stretch it taller' },
      { base: 'sin', controls: ['b'], target: { b: 2 }, prompt: 'Now make the waves come as often as the ghost’s.', label: 'Squeeze it sideways' },
    ],
    donePrompt: 'Stretched and squeezed.',
    insight:
      'Multiplying the result stretches up and down. Multiplying x first squeezes sideways — the wave repeats twice as fast.',
    formula: math('y = 2·sin x', h('span', { className: 'up' }, '   vs   '), 'y = sin(2x)'),
  },
  {
    eyebrow: 'Mirror, mirror',
    sub: 'The growth curve from the Kingdom is back. Two flips, two ghosts.',
    hint: 'One ghost is upside-down, the other is left-right mirrored.',
    challenges: [
      { base: 'exp', controls: ['flipY', 'flipX'], target: { flipY: true }, prompt: 'Match the ghost.', label: 'Upside down' },
      { base: 'exp', controls: ['flipY', 'flipX'], target: { flipX: true }, prompt: 'Match this ghost.', label: 'Mirror image' },
    ],
    donePrompt: 'Both reflections found.',
    insight:
      'A minus outside flips the graph upside down. A minus inside mirrors it left–right — and turns growth into decay.',
    formula: math('y = −e', h('sup', null, 'x'), h('span', { className: 'up' }, '   ·   '), 'y = e', h('sup', null, '−x')),
  },
  {
    eyebrow: 'Master sculptor',
    sub: 'Every control is unlocked, and the equation now updates as you sculpt.',
    hint: 'Flip it first, then place the peak: it sits at x = 2, height 3.',
    challenges: [
      {
        base: 'square',
        controls: ['flipY', 'c', 'k', 'a'],
        target: { flipY: true, c: -2, k: 3 },
        prompt: 'Sculpt the arch onto the ghost.',
        label: 'The arch',
        showEquation: true,
      },
    ],
    donePrompt: 'Master sculptor!',
    insight:
      'Every move you learned is one piece of a single equation. Outside the function changes heights; inside changes where things happen — backwards.',
    formula: math('y = a·f(b·x + c) + k'),
  },
];
