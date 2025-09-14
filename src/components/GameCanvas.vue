<template>
  <div class="game" @click="focusForInput" @touchstart="handleTouchStart">
    <canvas ref="canvasRef" class="game__canvas" />
    <img class="game__img game__img--secondary" src="/assets/cool-img-1.png" alt="decor" />
    <input
      ref="hiddenInputRef"
      class="sr-only-input"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="none"
      spellcheck="false"
      inputmode="text"
      enterkeyhint="done"
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
// Enhanced gun animation state
let gunState = {
  recoil: 0,
  muzzle: 0,
  heat: 0,
  idleT: 0,
  laserIntensity: 0,
  laserPulse: 0,
  barrelGlow: 0,
  smoke: [],
  muzzleSmoke: 0
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
  
  // Mobile-friendly sizing
  const isMobile = window.innerWidth <= 768;
  const minWidth = isMobile ? 300 : 400;
  const minHeight = isMobile ? 200 : 300;
  
  const width = Math.max(minWidth, rect.width);
  const height = Math.max(minHeight, rect.height);
  
  canvas.width = Math.floor(width * scale);
  canvas.height = Math.floor(height * scale);
  ctx = canvas.getContext('2d');
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function focusForInput() {
  hiddenInputRef.value?.focus();
}

function handleTouchStart(e) {
  e.preventDefault();
  focusForInput();
}

function handleKeydown(e) {
  if (!running || paused || state.gameOver) return;
  const key = e.key;
  if (key.length === 1 && /[a-zA-Z0-9]/.test(key)) {
    const letter = key.toLowerCase();
    const result = wordsManager.typeLetter(letter);
    if (result.hit) {
      // Enhanced gun effects
      gunState.recoil = 1.2;
      gunState.muzzle = 1.5;
      gunState.heat = Math.min(1, gunState.heat + 0.6);
      gunState.barrelGlow = 1;
      gunState.laserIntensity = 1;
      gunState.muzzleSmoke = 1;
      
      // Add muzzle smoke
      for (let i = 0; i < 3; i++) {
        gunState.smoke.push({
          x: 0,
          y: 0,
          vx: (Math.random() - 0.5) * 20,
          vy: -Math.random() * 30,
          life: 0.8 + Math.random() * 0.4,
          age: 0,
          size: 2 + Math.random() * 3,
          opacity: 0.6 + Math.random() * 0.4
        });
      }
      
      if (!props.muted) audioManager.playShoot();
      if (result.killedWord) {
        state.score += result.scoreDelta;
        particles.explode(result.position.x, result.position.y, '#9ecbff', 'cyber');
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
    if (!props.muted) audioManager.playLevelUp();
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
  
  // Enhanced gun animation decay
  gunState.recoil = Math.max(0, gunState.recoil - dt * 6);
  gunState.muzzle = Math.max(0, gunState.muzzle - dt * 8);
  gunState.heat = Math.max(0, gunState.heat - dt * 0.3);
  gunState.barrelGlow = Math.max(0, gunState.barrelGlow - dt * 2);
  gunState.laserIntensity = Math.max(0, gunState.laserIntensity - dt * 3);
  gunState.muzzleSmoke = Math.max(0, gunState.muzzleSmoke - dt * 4);
  gunState.laserPulse += dt * 8;
  gunState.idleT += dt;
  
  // Update smoke particles
  const aliveSmoke = [];
  for (const s of gunState.smoke) {
    s.age += dt;
    if (s.age < s.life) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vx *= 0.98; // friction
      s.vy += 50 * dt; // gravity
      s.opacity = (1 - s.age / s.life) * 0.8;
      aliveSmoke.push(s);
    }
  }
  gunState.smoke = aliveSmoke;
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
  let gy = height - 15;
  const target = wordsManager.getActiveTarget();
  let angle = -Math.PI / 2;
  
  if (target) {
    const tx = target.x + (target.width || 0) / 2;
    const ty = target.y + 8;
    angle = Math.atan2(ty - gy, tx - gx);
  }
  
  // Idle sway when no target
  if (!target) {
    angle += Math.sin(gunState.idleT * 1.2) * 0.03;
  }
  
  // Enhanced recoil offsets
  const recoilOffset = gunState.recoil * 12;
  const recoilAngle = gunState.recoil * 0.12;
  angle += recoilAngle;
  gy -= recoilOffset;
  
  ctx.save();
  ctx.translate(gx, gy);
  ctx.rotate(angle);
  
  // Draw smoke particles first (behind gun)
  for (const s of gunState.smoke) {
    ctx.save();
    ctx.globalAlpha = s.opacity;
    ctx.fillStyle = `rgba(100, 100, 100, ${s.opacity * 0.6})`;
    ctx.shadowColor = '#666';
    ctx.shadowBlur = 8;
    ctx.fillRect(s.x - s.size/2, s.y - s.size/2, s.size, s.size);
    ctx.restore();
  }
  
  // Enhanced base body with premium gradient
  const bodyGrad = ctx.createLinearGradient(-25, -12, 25, 12);
  bodyGrad.addColorStop(0, '#0a1420');
  bodyGrad.addColorStop(0.3, '#1a2f4e');
  bodyGrad.addColorStop(0.7, '#2a4a6e');
  bodyGrad.addColorStop(1, '#0a1420');
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(-22, -10, 44, 20);
  
  // Premium accent stripes
  ctx.fillStyle = 'rgba(96,255,166,0.4)';
  ctx.fillRect(-22, -2, 44, 1);
  ctx.fillStyle = 'rgba(96,255,166,0.2)';
  ctx.fillRect(-22, 1, 44, 1);
  
  // Enhanced barrel with metallic sheen and glow
  const barrelGrad = ctx.createLinearGradient(0, -6, 60, 6);
  barrelGrad.addColorStop(0, '#2a3a5e');
  barrelGrad.addColorStop(0.2, '#4a5a7e');
  barrelGrad.addColorStop(0.5, '#6a7a9e');
  barrelGrad.addColorStop(0.8, '#8a9abe');
  barrelGrad.addColorStop(1, '#aabade');
  ctx.fillStyle = barrelGrad;
  ctx.fillRect(0, -5, 58, 10);
  
  // Barrel heat glow
  if (gunState.barrelGlow > 0) {
    ctx.save();
    ctx.globalAlpha = gunState.barrelGlow * 0.6;
    ctx.shadowColor = '#ff6b35';
    ctx.shadowBlur = 15 + gunState.barrelGlow * 25;
    ctx.fillStyle = '#ff6b35';
    ctx.fillRect(0, -5, 58, 10);
    ctx.restore();
  }
  
  // Barrel highlights and shadows
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(0, -4, 58, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(0, 2, 58, 2);
  
  // Heat glow halo
  if (gunState.heat > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.4, gunState.heat * 0.5);
    ctx.shadowColor = '#60ffa6';
    ctx.shadowBlur = 10 + gunState.heat * 15;
    ctx.fillStyle = '#60ffa6';
    ctx.fillRect(52, -4, 8, 8);
    ctx.restore();
  }
  
  // Enhanced muzzle flash with multiple layers
  if (gunState.muzzle > 0) {
    ctx.save();
    const flashSize = 15 + gunState.muzzle * 20;
    const flashAlpha = 0.9 * gunState.muzzle;
    
    // Outer flash
    ctx.globalAlpha = flashAlpha * 0.6;
    ctx.fillStyle = '#ff8b3d';
    ctx.shadowColor = '#ff8b3d';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.moveTo(58, 0);
    ctx.lineTo(58 + flashSize, -6);
    ctx.lineTo(58 + flashSize, 6);
    ctx.closePath();
    ctx.fill();
    
    // Inner flash
    ctx.globalAlpha = flashAlpha;
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(58, 0);
    ctx.lineTo(58 + flashSize * 0.7, -4);
    ctx.lineTo(58 + flashSize * 0.7, 4);
    ctx.closePath();
    ctx.fill();
    
    // Core flash
    ctx.globalAlpha = flashAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(58, 0);
    ctx.lineTo(58 + flashSize * 0.4, -2);
    ctx.lineTo(58 + flashSize * 0.4, 2);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }
  
  // Premium top rail with details
  ctx.fillStyle = '#0e1c2f';
  ctx.fillRect(-15, -12, 20, 4);
  ctx.fillStyle = 'rgba(96,255,166,0.3)';
  ctx.fillRect(-15, -11, 20, 1);
  
  // Side panels
  ctx.fillStyle = '#1a2a3a';
  ctx.fillRect(-20, -8, 6, 16);
  ctx.fillRect(14, -8, 6, 16);
  
  ctx.restore();

  // Enhanced laser sight system
  if (target && gunState.laserIntensity > 0) {
    ctx.save();
    const laserAlpha = gunState.laserIntensity * 0.7;
    const pulseIntensity = 0.5 + 0.5 * Math.sin(gunState.laserPulse);
    
    // Laser line
    ctx.globalAlpha = laserAlpha * pulseIntensity;
    ctx.strokeStyle = '#ff2a55';
    ctx.lineWidth = 1;
    ctx.shadowColor = '#ff2a55';
    ctx.shadowBlur = 5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(gx + Math.cos(angle) * 58, gy + Math.sin(angle) * 0);
    const tx = target.x + (target.width || 0) / 2;
    const ty = target.y + 8;
    ctx.lineTo(tx, ty);
    ctx.stroke();
    
    // Laser dots along the line
    const steps = 8;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const lx = gx + Math.cos(angle) * 58 + (tx - (gx + Math.cos(angle) * 58)) * t;
      const ly = gy + Math.sin(angle) * 0 + (ty - (gy + Math.sin(angle) * 0)) * t;
      
      ctx.globalAlpha = laserAlpha * pulseIntensity * (1 - t * 0.5);
      ctx.fillStyle = '#ff2a55';
      ctx.shadowColor = '#ff2a55';
      ctx.shadowBlur = 3;
      ctx.beginPath();
      ctx.arc(lx, ly, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Target crosshair
    ctx.globalAlpha = laserAlpha * pulseIntensity;
    ctx.strokeStyle = '#ff2a55';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(tx - 8, ty);
    ctx.lineTo(tx + 8, ty);
    ctx.moveTo(tx, ty - 8);
    ctx.lineTo(tx, ty + 8);
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
  // Cancel any existing animation frame
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
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
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
  running = false;
  paused = false;
  start();
}
function gameOver() {
  state.gameOver = true;
  running = false;
  paused = false;
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
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
  
  // Initialize audio system
  audioManager.init();

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
.game { 
  position: relative; 
  background: 
    linear-gradient(180deg, #071423, #030a12),
    radial-gradient(ellipse at center, rgba(96, 255, 166, 0.05) 0%, transparent 70%);
  border-radius: 16px; 
  overflow: hidden; 
  border: 1px solid rgba(158, 203, 255, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.game__canvas { 
  display: block; 
  width: 100%; 
  height: 60vh; 
  min-height: 300px;
  max-height: 80vh;
  border-radius: 16px;
  image-rendering: optimizeSpeed;
  image-rendering: -moz-crisp-edges;
  image-rendering: pixelated;
}

.game__img {
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 120px;
  height: 120px;
  opacity: 0.8;
  filter: 
    drop-shadow(0 0 15px rgba(96, 255, 166, 0.4)) 
    drop-shadow(0 0 30px rgba(11, 91, 215, 0.3))
    hue-rotate(10deg);
  animation: floating 4s ease-in-out infinite;
  pointer-events: none;
  z-index: 2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.game__img--secondary {
  right: 30px;
  bottom: 30px;
  width: 80px;
  height: 80px;
  opacity: 0.6;
  animation: floating 3s ease-in-out infinite reverse;
  z-index: 1;
  filter: 
    drop-shadow(0 0 10px rgba(0, 255, 255, 0.3))
    drop-shadow(0 0 20px rgba(255, 0, 255, 0.2));
}

.sr-only-input { 
  position: absolute; 
  opacity: 0; 
  pointer-events: none; 
  width: 1px; 
  height: 1px; 
  left: -1000px; 
}

@keyframes floating {
  0%, 100% { 
    transform: translateY(0) rotate(0deg) scale(1); 
  }
  50% { 
    transform: translateY(-8px) rotate(2deg) scale(1.02); 
  }
}

/* Hover effects for decorative images */
.game:hover .game__img {
  transform: translateY(-5px) scale(1.05);
  filter: 
    drop-shadow(0 0 20px rgba(96, 255, 166, 0.6)) 
    drop-shadow(0 0 40px rgba(11, 91, 215, 0.4))
    hue-rotate(20deg);
}

.game:hover .game__img--secondary {
  transform: translateY(-3px) scale(1.03);
  filter: 
    drop-shadow(0 0 15px rgba(0, 255, 255, 0.5))
    drop-shadow(0 0 30px rgba(255, 0, 255, 0.3));
}

/* Mobile-specific improvements */
@media (max-width: 768px) {
  .game__canvas {
    height: 50vh;
    min-height: 250px;
    max-height: 70vh;
  }
  
  .game__img {
    width: 80px;
    height: 80px;
    right: 15px;
    bottom: 15px;
  }
  
  .game__img--secondary {
    width: 60px;
    height: 60px;
    right: 20px;
    bottom: 20px;
  }
}

@media (max-width: 480px) {
  .game__canvas {
    height: 45vh;
    min-height: 200px;
    max-height: 60vh;
  }
  
  .game__img {
    width: 60px;
    height: 60px;
    right: 10px;
    bottom: 10px;
  }
  
  .game__img--secondary {
    width: 40px;
    height: 40px;
    right: 15px;
    bottom: 15px;
  }
}

/* Touch-friendly improvements */
@media (hover: none) and (pointer: coarse) {
  .game {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
  
  .game__canvas {
    touch-action: manipulation;
  }
}
</style>


