/**
 * Level 6 metadata.
 * @module HyperbolicWorld/meta
 */
export default {
  id: 'hyperbolic-world',
  order: 6,
  title: 'Hyperbolic World',
  topic: 'Hyperbolic functions',
  tagline: 'Hang a chain. It is not a parabola — so what is it?',
  bigIdea:
    'A hanging chain is y = cosh x = (eˣ + e⁻ˣ)/2. Hyperbolic functions mirror trig functions — circle vs hyperbola, cos² + sin² = 1 vs cosh² − sinh² = 1 — but grow like exponentials instead of repeating.',
  icon: 'chain',
  accent: '#8b5cf6',
  minutes: 9,
  steps: [
    { id: 'chain', title: 'Hang a chain', goal: 'Test parabola, circle and a mystery curve against a real hanging chain.' },
    { id: 'build', title: 'Build cosh', goal: 'Construct cosh and sinh by mixing eˣ and e⁻ˣ.' },
    { id: 'circle', title: 'Circle vs hyperbola', goal: 'Compare (cos t, sin t) on a circle with (cosh t, sinh t) on a hyperbola.' },
    { id: 'bridge', title: 'Chains, bridges & arches', goal: 'Tell catenaries from parabolas in real structures.' },
  ],
};
