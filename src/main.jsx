/**
 * Entry point: mounts <App> inside the game state provider and loads styles.
 * @module main
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GameProvider } from './core/GameContext.jsx';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/screens.css';
import './styles/levels.css';
import './styles/lesson.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </StrictMode>,
);
