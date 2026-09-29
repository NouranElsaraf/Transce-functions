/**
 * Level 2 metadata.
 * @module GrowingKingdom/meta
 */
export default {
  id: 'growing-kingdom',
  order: 2,
  title: 'Growing Kingdom',
  topic: 'Exponential functions',
  tagline: 'Your granary doubles every morning. How bad could that be?',
  bigIdea:
    'Multiplying by the same factor each step (y = aˣ) starts slowly, then overtakes any steady growth. The special base e ≈ 2.718 grows at a rate equal to its own size.',
  icon: 'crown',
  accent: '#e08a1e',
  minutes: 9,
  steps: [
    { id: 'double', title: 'Day by day', goal: 'Experience doubling one step at a time and predict the next day.' },
    { id: 'week', title: 'One week', goal: 'Notice doubling beats the "add a bit each day" instinct.' },
    { id: 'month', title: 'One month', goal: 'Feel the explosion: each day outgrows all previous days combined.' },
    { id: 'race', title: 'The race', goal: 'Exponential growth eventually overtakes any linear growth.' },
    { id: 'base', title: 'Meet aˣ', goal: 'Connect the story to y = aˣ, see decay, and discover e.' },
  ],
};
