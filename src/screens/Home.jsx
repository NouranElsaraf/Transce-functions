/**
 * The map: hero with a single obvious "continue" action, the level path,
 * the achievement shelf and — once everything is solved — the certificate.
 * @module Home
 */
import { useGame } from '../core/GameContext.jsx';
import { isUnlocked } from '../core/gameReducer.js';
import { ACHIEVEMENTS } from '../core/achievements.js';
import { rankFor } from '../core/scoring.js';
import { LEVELS } from '../levels/registry.js';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Icon from '../components/Icon.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Stars from '../components/Stars.jsx';

export default function Home({ onPlay }) {
  const { state } = useGame();
  const ids = LEVELS.map((l) => l.meta.id);
  const doneCount = ids.filter((id) => state.levels[id]?.completed).length;
  const nextLevel = LEVELS.find((l) => !state.levels[l.meta.id]?.completed) || LEVELS[0];
  const allDone = LEVELS.length > 0 && doneCount === LEVELS.length;
  const unlockedAch = Object.keys(state.achievements).length;

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-text">
          <div className="eyebrow">Chapter 1 · Transcendental Functions</div>
          <h1>
            Calculus isn&apos;t memorised.
            <br />
            <span className="grad">It&apos;s noticed.</span>
          </h1>
          <p className="hero-sub">
            Seven rooms. No formulas up front. Poke, predict, and discover the rules yourself — about{' '}
            {LEVELS.reduce((n, l) => n + l.meta.minutes, 0)} minutes of play.
          </p>
          <div className="hero-actions">
            {nextLevel && (
              <Button size="lg" iconRight="right" onClick={() => onPlay(nextLevel.meta.id)}>
                {doneCount === 0 ? 'Start playing' : allDone ? 'Play again' : `Continue: ${nextLevel.meta.title}`}
              </Button>
            )}
          </div>
        </div>
        <Card className="hero-progress">
          <div className="hero-progress-row">
            <span>Rooms solved</span>
            <b>
              {doneCount}/{LEVELS.length}
            </b>
          </div>
          <ProgressBar value={LEVELS.length ? doneCount / LEVELS.length : 0} label="Chapter progress" />
          <div className="hero-progress-row">
            <span>Rank</span>
            <b>{rankFor(state.xp).current.title}</b>
          </div>
          <div className="hero-progress-row">
            <span>Achievements</span>
            <b>
              {unlockedAch}/{ACHIEVEMENTS.length}
            </b>
          </div>
        </Card>
      </section>

      {allDone && (
        <Card className="certificate">
          <Icon name="trophy" size={36} />
          <div>
            <h2>Chapter complete!</h2>
            <p>
              You discovered slopes, exponential growth, transformations, waves and hyperbolic functions — by noticing, not
              memorising. {state.xp} XP well earned.
            </p>
          </div>
        </Card>
      )}

      <section aria-labelledby="map-title">
        <h2 id="map-title" className="section-title">
          The Map
        </h2>
        <ol className="level-map">
          {LEVELS.map(({ meta }, i) => {
            const unlocked = isUnlocked(state, ids, i);
            const progress = state.levels[meta.id];
            const isNext = meta.id === nextLevel?.meta.id && !allDone;
            return (
              <li key={meta.id} style={{ '--level-accent': meta.accent, animationDelay: `${i * 60}ms` }}>
                <button
                  type="button"
                  className={`level-card ${unlocked ? '' : 'is-locked'} ${progress?.completed ? 'is-done' : ''} ${isNext ? 'is-next' : ''}`}
                  onClick={() => unlocked && onPlay(meta.id)}
                  disabled={!unlocked}
                  aria-label={`Level ${meta.order}: ${meta.title}${unlocked ? '' : ' (locked)'}`}
                >
                  <div className="level-card-icon">
                    <Icon name={unlocked ? meta.icon : 'lock'} size={26} />
                  </div>
                  <div className="level-card-body">
                    <div className="level-card-top">
                      <span className="level-num">{meta.order}</span>
                      <span className="level-topic">{meta.topic}</span>
                      {isNext && <span className="badge-next">Up next</span>}
                    </div>
                    <h3>{meta.title}</h3>
                    <p>{meta.tagline}</p>
                    <div className="level-card-foot">
                      <Stars count={progress?.bestStars || 0} size={16} />
                      <span className="level-min">~{meta.minutes} min</span>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="ach-title">
        <h2 id="ach-title" className="section-title">
          Achievements
        </h2>
        <div className="achievements">
          {ACHIEVEMENTS.map((a) => {
            const got = Boolean(state.achievements[a.id]);
            return (
              <div key={a.id} className={`achievement ${got ? 'is-got' : ''}`} title={a.description}>
                <div className="achievement-icon">
                  <Icon name={got ? a.icon : 'lock'} size={22} />
                </div>
                <div>
                  <div className="achievement-title">{a.title}</div>
                  <div className="achievement-desc">{a.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="home-foot">
        Instructor? Tap the <Icon name="teacher" size={16} /> cap in the top bar for Teacher Mode (skip levels, draw, pause,
        reveal).
      </footer>
    </main>
  );
}
