/**
 * Level 3 metadata.
 * @module GraphSculptor/meta
 */
export default {
  id: 'graph-sculptor',
  order: 3,
  title: 'Graph Sculptor',
  topic: 'Graph intuition',
  tagline: 'Lift, slide, stretch and flip curves until they match the ghost.',
  bigIdea:
    'Changes outside a function act on heights (up/down, stretch, flip). Changes inside act on x — and they work backwards: +3 inside moves the graph 3 to the left.',
  icon: 'sculpt',
  accent: '#16a085',
  minutes: 8,
  steps: [
    { id: 'lift', title: 'Lift', goal: 'Adding to the output shifts the graph vertically.' },
    { id: 'slide', title: 'Slide', goal: 'Adding to the input shifts the graph horizontally — in the opposite direction.' },
    { id: 'stretch', title: 'Stretch & squeeze', goal: 'Multiplying outside stretches vertically; inside compresses horizontally.' },
    { id: 'mirror', title: 'Mirror', goal: 'A minus outside reflects across the x-axis; inside reflects across the y-axis.' },
    { id: 'master', title: 'Master', goal: 'Combine all moves and read them off y = a·f(bx + c) + k.' },
  ],
};
