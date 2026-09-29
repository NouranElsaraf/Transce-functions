/**
 * Achievement catalogue.
 *
 * Each achievement has a pure `check(state)` predicate. After every state change the
 * GameContext evaluates the locked ones and unlocks whatever became true — so adding a
 * new achievement is just adding an object here.
 * @module achievements
 */

const completed = (state, id) => Boolean(state.levels[id]?.completed);

export const ACHIEVEMENTS = [
  {
    id: 'first-insight',
    icon: 'spark',
    title: 'First Insight',
    description: 'Answer your first question correctly.',
    check: (s) => s.stats.correct >= 1,
  },
  {
    id: 'combo-5',
    icon: 'flame',
    title: 'On Fire',
    description: 'Reach a 5× combo streak.',
    check: (s) => s.bestCombo >= 5,
  },
  {
    id: 'combo-12',
    icon: 'bolt',
    title: 'Unstoppable',
    description: 'Reach a 12× combo streak.',
    check: (s) => s.bestCombo >= 12,
  },
  {
    id: 'speed-detective',
    icon: 'car',
    title: 'Case Closed',
    description: 'Discover that speed is slope.',
    check: (s) => completed(s, 'speed-detective'),
  },
  {
    id: 'growing-kingdom',
    icon: 'crown',
    title: 'Exponential Mind',
    description: 'Watch doubling explode.',
    check: (s) => completed(s, 'growing-kingdom'),
  },
  {
    id: 'graph-sculptor',
    icon: 'sculpt',
    title: 'Sculptor',
    description: 'Bend graphs to your will.',
    check: (s) => completed(s, 'graph-sculptor'),
  },
  {
    id: 'light-beam',
    icon: 'beam',
    title: 'Light Bender',
    description: 'Turn a rotation into a wave.',
    check: (s) => completed(s, 'light-beam'),
  },
  {
    id: 'the-swing',
    icon: 'swing',
    title: 'Rhythm Keeper',
    description: 'Predict the pendulum.',
    check: (s) => completed(s, 'the-swing'),
  },
  {
    id: 'hyperbolic-world',
    icon: 'chain',
    title: 'Chain Reaction',
    description: 'Find cosh hiding in a hanging chain.',
    check: (s) => completed(s, 'hyperbolic-world'),
  },
  {
    id: 'escape-room',
    icon: 'door',
    title: 'Escape Artist',
    description: 'Escape using nothing but intuition.',
    check: (s) => completed(s, 'escape-room'),
  },
  {
    id: 'flawless',
    icon: 'star',
    title: 'Flawless',
    description: 'Earn 3 stars on any level.',
    check: (s) => Object.values(s.levels).some((l) => l.bestStars === 3),
  },
  {
    id: 'no-hints',
    icon: 'eye',
    title: 'Hint? Never Heard of It',
    description: 'Finish 3 levels without using a single hint.',
    check: (s) => s.stats.noHintLevels >= 3,
  },
  {
    id: 'xp-500',
    icon: 'rocket',
    title: 'Rising Engineer',
    description: 'Collect 500 XP.',
    check: (s) => s.xp >= 500,
  },
  {
    id: 'night-owl',
    icon: 'moon',
    title: 'Night Owl',
    description: 'Switch to dark mode.',
    check: (s) => s.settings.theme === 'dark',
  },
  {
    id: 'perfectionist',
    icon: 'trophy',
    title: 'Perfectionist',
    description: '3 stars on every level.',
    check: (s, levelIds = []) => levelIds.length > 0 && levelIds.every((id) => s.levels[id]?.bestStars === 3),
  },
];

/** Return achievements that are newly satisfied (not yet unlocked). */
export function newlyUnlocked(state, levelIds) {
  return ACHIEVEMENTS.filter((a) => !state.achievements[a.id] && a.check(state, levelIds));
}

export const achievementById = (id) => ACHIEVEMENTS.find((a) => a.id === id);
