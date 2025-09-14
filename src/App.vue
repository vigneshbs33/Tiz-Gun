<template>
  <div class="app">
    <!-- Matrix Rain Background -->
    <MatrixRain />
    
    <!-- Loading Screen -->
    <div v-if="!gameLoaded" class="loading-screen">
      <div class="loading-content">
        <div class="loading-logo">
          <span class="logo__mark">▲</span>
          <span class="logo__text">Tiz-Gun</span>
        </div>
        <div class="loading-bar glass-panel">
          <div class="loading-progress shimmer" :style="{ width: loadingProgress + '%' }"></div>
        </div>
        <p class="loading-text">Loading Tiz-Gun v6.0 - The ultimate cyber typing experience...</p>
      </div>
    </div>
    
    <!-- Main App -->
    <div v-else class="app-content">
      <header class="app__header glass-panel">
        <h1 class="title logo">
          <span class="logo__mark">▲</span>
          <span class="logo__text">Tiz-Gun</span>
          <span class="version-badge">v6.0</span>
        </h1>
        <GameControls
          :running="running"
          :paused="paused"
          :muted="muted"
          :difficulty="difficulty"
          @start="onStart"
          @pause="onPause"
          @resume="onResume"
          @reset="onReset"
          @toggle-mute="onToggleMute"
          @toggle-fullscreen="onToggleFullscreen"
          @set-difficulty="onSetDifficulty"
        />
      </header>
      
      <main class="app__main">
        <div class="game-container">
          <GameCanvas
            ref="gameRef"
            :muted="muted"
            @state="onGameState"
          />
        </div>
        <HUD
          ref="hudRef"
          :score="score"
          :highScore="highScore"
          :globalHighScore="globalHighScore"
          :lives="lives"
          :level="level"
          :gameOver="gameOver"
          :newHighScore="newHighScore"
          :newGlobalHighScore="newGlobalHighScore"
          :difficulty="difficulty"
          @restart="onReset"
          @name-change="onNameChange"
        />
      </main>
      
      <footer class="app__footer glass-panel">
        <div class="credits">
          <span>Made by <a href="https://github.com/vigneshbs33" target="_blank" rel="noreferrer">vigneshbs33</a></span>
          <span> · </span>
          <a href="https://www.linkedin.com/in/vigneshbs-dev/" target="_blank" rel="noreferrer">LinkedIn</a>
          <span> · </span>
          <span class="version">v6.0 Premium</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import GameCanvas from './components/GameCanvas.vue';
import HUD from './components/HUD.vue';
import GameControls from './components/GameControls.vue';
import MatrixRain from './components/MatrixRain.vue';
import { HighScoreManager } from './lib/HighScoreManager.js';

const gameRef = ref(null);
const hudRef = ref(null);

const running = ref(false);
const paused = ref(false);
const muted = ref(false);
const difficulty = ref('classic');
const score = ref(0);
const highScore = ref(0);
const globalHighScore = ref({ name: '', score: 0, mode: '', timestamp: null });
const lives = ref(3);
const level = ref(1);
const gameOver = ref(false);
const playerName = ref('');
const gameLoaded = ref(false);
const loadingProgress = ref(0);
const newHighScore = ref(false);
const newGlobalHighScore = ref(false);

let highScoreManager;

onMounted(async () => {
  // Initialize high score manager
  highScoreManager = new HighScoreManager();
  
  // Load current mode's high score
  const currentHighScore = highScoreManager.getHighScore(difficulty.value);
  highScore.value = currentHighScore.score;
  
  // Load global high score (async)
  try {
    const currentGlobalHighScore = await highScoreManager.getGlobalHighScore();
    globalHighScore.value = currentGlobalHighScore;
  } catch (error) {
    console.warn('Failed to load global high score:', error);
    globalHighScore.value = { name: '', score: 0, mode: '', timestamp: null };
  }
  
  // Load player name
  try {
    const saved = localStorage.getItem('tizgun_player_name');
    playerName.value = saved || '';
  } catch {}
  
  // Simulate loading progress
  const loadingInterval = setInterval(() => {
    loadingProgress.value += Math.random() * 15;
    if (loadingProgress.value >= 100) {
      loadingProgress.value = 100;
      clearInterval(loadingInterval);
      setTimeout(() => {
        gameLoaded.value = true;
      }, 500);
    }
  }, 100);
});

async function onGameState(payload) {
  console.log('Game state update:', payload);
  score.value = payload.score;
  lives.value = payload.lives;
  level.value = payload.level;
  gameOver.value = payload.gameOver;
  
  // Check for new high score when game ends
  if (payload.gameOver && highScoreManager) {
    try {
      const result = await highScoreManager.updateHighScore(
        difficulty.value, 
        playerName.value, 
        score.value
      );
      newHighScore.value = result.modeHigh;
      newGlobalHighScore.value = result.globalHigh;
      
      // Update current high score display
      const currentHighScore = highScoreManager.getHighScore(difficulty.value);
      highScore.value = currentHighScore.score;
      
      // Update global high score display
      const currentGlobalHighScore = await highScoreManager.getGlobalHighScore();
      globalHighScore.value = currentGlobalHighScore;
    } catch (error) {
      console.warn('Failed to update high scores:', error);
    }
  }
}

function onStart() {
  running.value = true;
  paused.value = false;
  gameRef.value?.start();
}
function onPause() {
  paused.value = true;
  gameRef.value?.pause();
}
function onResume() {
  paused.value = false;
  gameRef.value?.resume();
}
function onReset() {
  running.value = true;
  paused.value = false;
  gameRef.value?.reset();
}
function onToggleMute() {
  muted.value = !muted.value;
}
function onToggleFullscreen() {
  const el = document.documentElement;
  if (!document.fullscreenElement) {
    el.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

function onSetDifficulty(mode) {
  difficulty.value = mode;
  gameRef.value?.setDifficulty?.(mode);
  
  // Update high score display for new mode
  if (highScoreManager) {
    const currentHighScore = highScoreManager.getHighScore(mode);
    highScore.value = currentHighScore.score;
  }
}

function onNameChange(name) {
  playerName.value = name;
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: 
    radial-gradient(1200px 600px at 50% -20%, #0b1a2b, #050b12 60%),
    linear-gradient(135deg, #0a1420 0%, #050b12 50%, #0f1a2e 100%);
  color: var(--fg-primary);
  position: relative;
  overflow-x: hidden;
}

.app-content {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

.app__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  position: sticky;
  top: 0;
  z-index: 10;
  margin: 16px;
  margin-bottom: 0;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
}

.title {
  font-family: 'Orbitron', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.logo__mark {
  display: inline-block;
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  background: linear-gradient(135deg, #12b886, #60ffa6);
  color: #06141f;
  border-radius: 8px;
  box-shadow: 
    0 4px 14px rgba(96, 255, 166, 0.4),
    0 0 20px rgba(96, 255, 166, 0.2);
  animation: pop 2.8s ease-in-out infinite;
  font-weight: 900;
  font-size: 16px;
}

.logo__text {
  background: linear-gradient(135deg, #e7f0ff, #9ecbff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
}

.version-badge {
  background: linear-gradient(135deg, #60ffa6, #12b886);
  color: #06141f;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 
    0 2px 8px rgba(96, 255, 166, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  animation: neonPulse 2s ease-in-out infinite;
}

.app__main {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  padding: 20px;
  flex: 1;
}

@media (max-width: 1024px) {
  .app__main {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.game-container {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.app__footer {
  padding: 16px 24px;
  margin: 0 16px 16px;
  font-size: 13px;
  opacity: 0.8;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.credits {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

.version {
  background: linear-gradient(135deg, #60ffa6, #12b886);
  color: #06141f;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 
    0 2px 8px rgba(96, 255, 166, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

@keyframes pop {
  0%, 100% { 
    transform: translateY(0) scale(1); 
  }
  50% { 
    transform: translateY(-3px) scale(1.08); 
  }
}

/* Premium Loading Screen */
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(1200px 600px at 50% -20%, #0b1a2b, #050b12 60%),
    linear-gradient(135deg, #0a1420 0%, #050b12 50%, #0f1a2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.loading-content {
  text-align: center;
  color: var(--fg-primary);
  max-width: 400px;
  padding: 40px;
}

.loading-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 50px;
  font-family: 'Orbitron', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
  font-size: 36px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  position: relative;
}

.loading-logo .logo__mark {
  display: inline-block;
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background: linear-gradient(135deg, #12b886, #60ffa6);
  color: #06141f;
  border-radius: 12px;
  box-shadow: 
    0 6px 20px rgba(96, 255, 166, 0.4),
    0 0 30px rgba(96, 255, 166, 0.2);
  animation: pop 2s ease-in-out infinite;
  font-weight: 900;
  font-size: 20px;
}

.loading-logo .logo__text {
  background: linear-gradient(135deg, #e7f0ff, #9ecbff, #60ffa6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
}

.loading-bar {
  width: 100%;
  height: 6px;
  background: rgba(158, 203, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin: 0 auto 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.loading-progress {
  height: 100%;
  background: linear-gradient(90deg, #12b886, #60ffa6, #00ffff);
  border-radius: 3px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 0 20px rgba(96, 255, 166, 0.6),
    0 0 40px rgba(96, 255, 166, 0.3);
  position: relative;
}

.loading-progress::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.4), 
    transparent
  );
  animation: shimmer 1.5s infinite;
}

.loading-text {
  color: var(--fg-secondary);
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app__header {
    padding: 16px 20px;
    margin: 12px;
    margin-bottom: 0;
  }
  
  .title {
    font-size: 24px;
  }
  
  .logo__mark {
    width: 24px;
    height: 24px;
    line-height: 24px;
    font-size: 14px;
  }
  
  .app__main {
    padding: 16px;
    gap: 16px;
  }
  
  .loading-logo {
    font-size: 28px;
    gap: 12px;
  }
  
  .loading-logo .logo__mark {
    width: 32px;
    height: 32px;
    line-height: 32px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .app__header {
    padding: 12px 16px;
    margin: 8px;
    margin-bottom: 0;
  }
  
  .title {
    font-size: 20px;
  }
  
  .app__main {
    padding: 12px;
    gap: 12px;
  }
  
  .loading-content {
    padding: 20px;
  }
  
  .loading-logo {
    font-size: 24px;
    gap: 10px;
  }
}
</style>


