/**
 * Level 4 metadata.
 * @module LightBeam/meta
 */
export default {
  id: 'light-beam',
  order: 4,
  title: 'Light Beam',
  topic: 'Trigonometric functions',
  tagline: 'A flashlight spins in a round room. Its light spot secretly draws a wave.',
  bigIdea:
    'A point moving round a circle has height sin θ and sideways position cos θ. Because turning repeats every 360° (2π), sine and cosine repeat forever — they are the maths of anything periodic.',
  icon: 'beam',
  accent: '#d9467a',
  minutes: 9,
  steps: [
    { id: 'aim', title: 'Aim', goal: 'Link an angle of rotation to a position on the circle.' },
    { id: 'height', title: 'Height of the spot', goal: 'Find where the spot is highest, lowest and level: the values of sine.' },
    { id: 'wave', title: 'Draw the wave', goal: 'See the height trace a sine wave that repeats every 360°.' },
    { id: 'cos', title: 'The floor shadow', goal: 'Discover cosine as the same wave shifted a quarter turn.' },
    { id: 'tune', title: 'Tune the wave', goal: 'Control amplitude and frequency: y = A·sin(kθ).' },
  ],
};
