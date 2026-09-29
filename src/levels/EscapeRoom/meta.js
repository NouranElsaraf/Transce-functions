/**
 * Level 7 metadata.
 * @module EscapeRoom/meta
 */
export default {
  id: 'escape-room',
  order: 7,
  title: 'Escape Room',
  topic: 'Everything together',
  tagline: 'Five locks. No formulas. Only what you have noticed.',
  bigIdea:
    'Slopes, exponential growth, transformations, periodic waves and hanging chains are not five topics — they are one toolkit for reading how things change.',
  icon: 'door',
  accent: '#0ea5a4',
  minutes: 8,
  steps: [
    { id: 'tangent', title: 'Lock 1 · Flat spot', goal: 'Find where a curve’s tangent is horizontal.' },
    { id: 'jar', title: 'Lock 2 · The jar', goal: 'Reason backwards through exponential doubling.' },
    { id: 'shape', title: 'Lock 3 · Shape key', goal: 'Rebuild a transformed graph.' },
    { id: 'wave', title: 'Lock 4 · Signal', goal: 'Read the period of a wave.' },
    { id: 'chain', title: 'Lock 5 · Which curve?', goal: 'Identify cosh by its behaviour.' },
    { id: 'door', title: 'The door', goal: 'Enter the code and escape.' },
  ],
};
