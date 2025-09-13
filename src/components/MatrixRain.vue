<template>
  <canvas ref="canvasRef" class="matrix-rain-canvas"></canvas>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';

const canvasRef = ref(null);
let ctx = null;
let animationId = null;
let matrix = [];
let fontSize = 14;
let columns = 0;

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?';

function initMatrix() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  ctx = canvas.getContext('2d');
  resizeCanvas();
  
  // Initialize matrix columns
  columns = Math.floor(canvas.width / fontSize);
  matrix = [];
  
  for (let i = 0; i < columns; i++) {
    matrix[i] = {
      y: Math.random() * canvas.height,
      speed: Math.random() * 2 + 1,
      char: characters[Math.floor(Math.random() * characters.length)],
      opacity: Math.random()
    };
  }
}

function resizeCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  const rect = canvas.getBoundingClientRect();
  const dpi = window.devicePixelRatio || 1;
  
  canvas.width = rect.width * dpi;
  canvas.height = rect.height * dpi;
  
  ctx.scale(dpi, dpi);
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
}

function drawMatrix() {
  if (!ctx) return;
  
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  // Semi-transparent black background for trail effect
  ctx.fillStyle = 'rgba(5, 11, 18, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw matrix characters
  ctx.font = `${fontSize}px 'Courier New', monospace`;
  
  for (let i = 0; i < matrix.length; i++) {
    const char = matrix[i];
    
    // Create gradient for each character
    const gradient = ctx.createLinearGradient(0, char.y - fontSize, 0, char.y + fontSize);
    gradient.addColorStop(0, `rgba(0, 255, 0, ${char.opacity * 0.1})`);
    gradient.addColorStop(0.5, `rgba(0, 255, 255, ${char.opacity * 0.8})`);
    gradient.addColorStop(1, `rgba(0, 255, 0, ${char.opacity})`);
    
    ctx.fillStyle = gradient;
    ctx.fillText(char.char, i * fontSize, char.y);
    
    // Add glow effect
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.fillText(char.char, i * fontSize, char.y);
    ctx.shadowBlur = 0;
    
    // Update character position
    char.y += char.speed;
    
    // Reset character when it goes off screen
    if (char.y > canvas.height) {
      char.y = -fontSize;
      char.char = characters[Math.floor(Math.random() * characters.length)];
      char.opacity = Math.random();
      char.speed = Math.random() * 2 + 1;
    }
  }
}

function animate() {
  drawMatrix();
  animationId = requestAnimationFrame(animate);
}

onMounted(() => {
  initMatrix();
  animate();
  
  window.addEventListener('resize', resizeCanvas);
});

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  window.removeEventListener('resize', resizeCanvas);
});
</script>

<style scoped>
.matrix-rain-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  opacity: 0.3;
  mix-blend-mode: screen;
}
</style>
