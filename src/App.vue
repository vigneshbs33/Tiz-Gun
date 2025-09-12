<template>
  <div class="app">
    <header class="app__header">
      <h1 class="title logo">
        <span class="logo__mark">▲</span>
        Tiz-Gun
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
      <GameCanvas
        ref="gameRef"
        :muted="muted"
        @state="onGameState"
      />
      <HUD
        :score="score"
        :highScore="highScore"
        :lives="lives"
        :level="level"
        :gameOver="gameOver"
        @restart="onReset"
      />
    </main>
    <footer class="app__footer">
      <div class="credits">
        <span>Made by <a href="https://github.com/vigneshbs33" target="_blank" rel="noreferrer">vigneshbs33</a></span>
        <span> · </span>
        <a href="https://www.linkedin.com/in/vigneshbs-dev/" target="_blank" rel="noreferrer">LinkedIn</a>
      </div>
    </footer>
  </div>
  
</template>

<script setup>
import { ref, onMounted } from 'vue';
import GameCanvas from './components/GameCanvas.vue';
import HUD from './components/HUD.vue';
import GameControls from './components/GameControls.vue';

const gameRef = ref(null);

const running = ref(false);
const paused = ref(false);
const muted = ref(false);
const difficulty = ref('medium');
const score = ref(0);
const highScore = ref(0);
const lives = ref(3);
const level = ref(1);
const gameOver = ref(false);

onMounted(() => {
  try {
    const saved = localStorage.getItem('tizgun_high_score');
    highScore.value = saved ? Number(saved) : 0;
  } catch {}
});

function onGameState(payload) {
  score.value = payload.score;
  lives.value = payload.lives;
  level.value = payload.level;
  gameOver.value = payload.gameOver;
  if (payload.highScore != null) {
    highScore.value = payload.highScore;
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
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: radial-gradient(1200px 600px at 50% -20%, #0b1a2b, #050b12 60%);
  color: #e7f0ff;
}
.app__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  position: sticky;
  top: 0;
  z-index: 5;
  background: linear-gradient(180deg, rgba(7,20,35,0.85), rgba(5,11,18,0.6));
  border-bottom: 1px solid rgba(158,203,255,0.14);
  backdrop-filter: blur(6px);
}
.title {
  font-family: 'Orbitron', 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: 0;
}
.logo { display: inline-flex; align-items: center; gap: 10px; }
.logo__mark { display: inline-block; width: 22px; height: 22px; line-height: 22px; text-align: center; background: linear-gradient(135deg, #12b886, #60ffa6); color: #06141f; border-radius: 6px; box-shadow: 0 4px 14px rgba(96,255,166,0.35); animation: pop 2.8s ease-in-out infinite; }
.app__main {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 12px;
  padding: 12px 16px 16px;
}
@media (max-width: 900px) {
  .app__main { grid-template-columns: 1fr; }
}
.app__footer {
  padding: 10px 16px;
  font-size: 12px;
  opacity: 0.7;
}
.app__footer a { color: #9ecbff; }
.credits { display: inline-flex; gap: 6px; align-items: center; }

@keyframes pop {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-2px) scale(1.06); }
}
</style>


