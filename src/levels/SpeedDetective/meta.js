/**
 * Level 1 metadata.
 * @module SpeedDetective/meta
 */
export default {
  id: 'speed-detective',
  order: 1,
  title: 'The Speed Detective',
  topic: 'Rate of change',
  tagline: 'A car races past. When was it fastest? Find the clue hiding in the graph.',
  bigIdea:
    'Speed is the slope of the position graph. Zoom in on any point until the curve looks straight — that slope is the derivative, the instantaneous rate of change.',
  icon: 'car',
  accent: '#5b5bd6',
  minutes: 8,
  steps: [
    { id: 'watch', title: 'Photo finish', goal: 'Notice that "fast" means covering more distance in the same time.' },
    { id: 'tangent', title: 'Steepest point', goal: 'Connect speed with the steepness (slope) of the position-time graph.' },
    { id: 'zoom', title: 'Zoom in', goal: 'Watch average speed over a shrinking gap settle on one number: the derivative.' },
    { id: 'read', title: 'Read the slopes', goal: 'Flat tangent = stopped, downhill tangent = moving backwards.' },
  ],
};
