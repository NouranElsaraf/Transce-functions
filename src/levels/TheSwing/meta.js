/**
 * Level 5 metadata.
 * @module TheSwing/meta
 */
export default {
  id: 'the-swing',
  order: 5,
  title: 'The Swing',
  topic: 'Periodic motion',
  tagline: 'Predict a pendulum seconds into the future — without watching it.',
  bigIdea:
    'A pendulum repeats the same cosine wave, θ(t) = A·cos(2πt/T). Its period depends on the rope length (T = 2π√(L/g)), not on how far you pull it — so one cycle predicts the future.',
  icon: 'swing',
  accent: '#3e7fd6',
  minutes: 8,
  steps: [
    { id: 'predict', title: 'Where will it be?', goal: 'Use half and quarter swings to predict position in time.' },
    { id: 'trace', title: 'Pen on paper', goal: 'Recognise the swing’s angle-time graph as a cosine wave.' },
    { id: 'length', title: 'Longer rope', goal: 'Discover that period depends on length but not amplitude.' },
    { id: 'forecast', title: 'Forecast', goal: 'Use periodicity to predict a far-future position.' },
  ],
};
