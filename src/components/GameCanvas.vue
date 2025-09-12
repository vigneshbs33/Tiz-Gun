<template>
  <div class="game" @click="focusForInput">
    <canvas ref="canvasRef" class="game__canvas" />
    <img class="game__img" src="/assets/cool-img-1.svg" alt="decor" />
    <input
      ref="hiddenInputRef"
      class="sr-only-input"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="none"
      spellcheck="false"
    />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { WordsManager } from '../lib/WordsManager.js';
import { AudioManager } from '../lib/AudioManager.js';
import { ParticleSystem } from '../lib/ParticleEffect.js';

const props = defineProps({
  muted: { type: Boolean, default: false }
});
const emit = defineEmits(['state']);

const canvasRef = ref(null);
const hiddenInputRef = ref(null);

let ctx;
let rafId = 0;
let running = false;
let paused = false;

const state = {
  score: 0,
  lives: 3,
  level: 1,
  gameOver: false,
  highScore: 0
};

let wordsManager;
let audioManager;
let particles;
// Gun animation state
let gunState = {
  recoil: 0,
  muzzle: 0,
  heat: 0,
  idleT: 0
};

const dpi = () => window.devicePixelRatio || 1;

function emitState() {
  try {
    if (state.score > (state.highScore || 0)) {
      state.highScore = state.score;
      localStorage.setItem('tizgun_high_score', String(state.highScore));
    }
  } catch {}
  emit('state', { ...state });
}

function resizeCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const scale = dpi();
  canvas.width = Math.floor(rect.width * scale);
  canvas.height = Math.floor(rect.height * scale);
  ctx = canvas.getContext('2d');
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function focusForInput() {
  hiddenInputRef.value?.focus();
}

function handleKeydown(e) {
  if (!running || paused || state.gameOver) return;
  const key = e.key;
  if (key.length === 1 && /[a-zA-Z]/.test(key)) {
    const letter = key.toLowerCase();
    const result = wordsManager.typeLetter(letter);
    if (result.hit) {
      // kick gun effects
      gunState.recoil = 1;
      gunState.muzzle = 1;
      gunState.heat = Math.min(1, gunState.heat + 0.4);
      if (!props.muted) audioManager.playShoot();
      if (result.killedWord) {
        state.score += result.scoreDelta;
        particles.explode(result.position.x, result.position.y, '#9ecbff');
        maybeLevelUp();
      }
    } else {
      if (!props.muted) audioManager.playMiss();
    }
  } else if (key === 'Escape') {
    togglePause();
  } else if (key === 'Backspace') {
    e.preventDefault();
    const res = wordsManager.backspace();
    if (res.ok && !props.muted) {
      audioManager.playMiss();
    }
  }
}

function maybeLevelUp() {
  const nextLevelAt = state.level * 200; // simple pacing
  if (state.score >= nextLevelAt) {
    state.level += 1;
    wordsManager.setLevel(state.level);
  }
}

function tick(dt, width, height) {
  wordsManager.update(dt, width, height);
  const missed = wordsManager.consumeMissed();
  if (missed > 0) {
    state.lives -= missed;
    if (!props.muted) audioManager.playMiss();
    if (state.lives <= 0) {
      gameOver();
    }
  }
  particles.update(dt);
  // gun animation decay
  gunState.recoil = Math.max(0, gunState.recoil - dt * 8);
  gunState.muzzle = Math.max(0, gunState.muzzle - dt * 10);
  gunState.heat = Math.max(0, gunState.heat - dt * 0.4);
  gunState.idleT += dt;
}

function draw(width, height) {
  ctx.clearRect(0, 0, width, height);
  // background stars
  ctx.fillStyle = 'rgba(10,20,35,0.6)';
  ctx.fillRect(0, 0, width, height);

  drawGun(width, height);
  wordsManager.draw(ctx);
  particles.draw(ctx);
}

function drawGun(width, height) {
  // gun at bottom center
  const gx = width / 2;
  let gy = height - 10;
  const target = wordsManager.getActiveTarget();
  let angle = -Math.PI / 2;
  if (target) {
    const tx = target.x + (target.width || 0) / 2;
    const ty = target.y + 8;
    angle = Math.atan2(ty - gy, tx - gx);
  }
  // Idle sway when no target
  if (!target) {
    angle += Math.sin(gunState.idleT * 1.2) * 0.02;
  }
  // Recoil offsets
  const recoilOffset = gunState.recoil * 8;
  const recoilAngle = gunState.recoil * 0.09;
  angle += recoilAngle;
  gy -= recoilOffset;
  ctx.save();
  ctx.translate(gx, gy);
  ctx.rotate(angle);
  // Base body with subtle gradient
  const bodyGrad = ctx.createLinearGradient(-20, -10, 20, 10);
  bodyGrad.addColorStop(0, '#12233b');
  bodyGrad.addColorStop(0.5, '#1a2f4e');
  bodyGrad.addColorStop(1, '#12233b');
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(-18, -8, 36, 16);
  // Accent stripe
  ctx.fillStyle = 'rgba(96,255,166,0.25)';
  ctx.fillRect(-18, -1, 36, 2);
  // Barrel with metallic sheen
  const barrelGrad = ctx.createLinearGradient(0, -5, 52, 5);
  barrelGrad.addColorStop(0, '#3a4c6e');
  barrelGrad.addColorStop(0.3, '#5c6e92');
  barrelGrad.addColorStop(0.7, '#7f93b9');
  barrelGrad.addColorStop(1, '#9ecbff');
  ctx.fillStyle = barrelGrad;
  ctx.fillRect(0, -4, 50, 8);
  // Barrel highlights/shadows
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(0, -3, 50, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, 1, 50, 2);
  // Heat glow halo based on heat
  if (gunState.heat > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.7, gunState.heat * 0.8);
    ctx.shadowColor = '#60ffa6';
    ctx.shadowBlur = 18 + gunState.heat * 20;
    ctx.fillStyle = '#60ffa6';
    ctx.fillRect(46, -3, 8, 6);
    ctx.restore();
  }
  // Muzzle flash
  if (gunState.muzzle > 0) {
    ctx.save();
    const s = 10 + gunState.muzzle * 10;
    ctx.globalAlpha = 0.8 * gunState.muzzle;
    ctx.fillStyle = '#ff8b3d';
    ctx.shadowColor = '#ff8b3d';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(50, 0);
    ctx.lineTo(50 + s, -4);
    ctx.lineTo(50 + s, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  // Top rail detail
  ctx.fillStyle = '#0e1c2f';
  ctx.fillRect(-12, -10, 16, 3);
  ctx.restore();

  // Laser sight outside local transform (draw after restore)
  if (target) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = '#ff2a55';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(gx + Math.cos(angle) * 50, gy + Math.sin(angle) * 0);
    const tx = target.x + (target.width || 0) / 2;
    const ty = target.y + 8;
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.restore();
  }
}

let lastTime = 0;
function loop(ts) {
  if (!running || paused) return;
  if (!lastTime) lastTime = ts;
  const dt = Math.min(0.05, (ts - lastTime) / 1000);
  lastTime = ts;
  const canvas = canvasRef.value;
  if (!canvas) return;
  const width = canvas.width / dpi();
  const height = canvas.height / dpi();
  tick(dt, width, height);
  draw(width, height);
  rafId = requestAnimationFrame(loop);
  emitState();
}

function start() {
  if (running) return;
  running = true;
  paused = false;
  state.score = 0;
  state.lives = 3;
  state.level = 1;
  state.gameOver = false;
  wordsManager.reset();
  particles.clear();
  lastTime = 0;
  rafId = requestAnimationFrame(loop);
  if (!props.muted) audioManager.startMusic();
}

function pause() {
  paused = true;
  if (!props.muted) audioManager.pauseMusic();
}
function resume() {
  if (!running) return;
  paused = false;
  lastTime = 0;
  rafId = requestAnimationFrame(loop);
  if (!props.muted) audioManager.resumeMusic();
}
function togglePause() {
  if (!running) return;
  if (paused) resume(); else pause();
}
function reset() {
  cancelAnimationFrame(rafId);
  running = false;
  paused = false;
  start();
}
function gameOver() {
  state.gameOver = true;
  running = false;
  paused = false;
  cancelAnimationFrame(rafId);
  if (!props.muted) audioManager.playGameOver();
}

function setDifficulty(mode) {
  wordsManager?.setDifficulty(mode);
}

defineExpose({ start, pause, resume, reset, setDifficulty });

onMounted(() => {
  const canvas = canvasRef.value;
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('keydown', handleKeydown);
  focusForInput();

  try {
    const saved = localStorage.getItem('tizgun_high_score');
    state.highScore = saved ? Number(saved) : 0;
  } catch {}

  wordsManager = new WordsManager();
  audioManager = new AudioManager();
  particles = new ParticleSystem();

  // ensure canvas has some minimum default size via CSS
  if (canvas) {
    if (!canvas.style.width) canvas.style.width = '100%';
    if (!canvas.style.height) canvas.style.height = '60vh';
  }
});

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId);
  window.removeEventListener('resize', resizeCanvas);
  window.removeEventListener('keydown', handleKeydown);
  audioManager?.dispose?.();
});
</script>

<style scoped>
.game { position: relative; background: linear-gradient(180deg, #071423, #030a12); border-radius: 8px; overflow: hidden; border: 1px solid rgba(158,203,255,0.15); }
.game__canvas { display: block; width: 100%; height: 60vh; }
.sr-only-input { position: absolute; opacity: 0; pointer-events: none; width: 1px; height: 1px; left: -1000px; }
</style>


