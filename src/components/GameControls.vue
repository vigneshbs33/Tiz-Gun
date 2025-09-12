<template>
  <div class="controls">
    <button class="btn btn--primary" @click="$emit(running ? 'reset' : 'start')">
      {{ running ? 'Restart' : 'Start' }}
    </button>
    <button class="btn btn--ghost" @click="$emit(paused ? 'resume' : 'pause')" :disabled="!running">
      {{ paused ? 'Resume' : 'Pause' }}
    </button>
    <select class="select" :value="difficulty" @change="$emit('set-difficulty', $event.target.value)">
      <option value="easy">Speed Easy</option>
      <option value="medium">Typer</option>
      <option value="hard">Keyboard God</option>
    </select>
    <button class="btn" @click="$emit('toggle-mute')">
      {{ muted ? 'Unmute' : 'Mute' }}
    </button>
    <button class="btn" @click="$emit('toggle-fullscreen')">Full Screen</button>
  </div>
</template>

<script setup>
defineProps({
  running: { type: Boolean, default: false },
  paused: { type: Boolean, default: false },
  muted: { type: Boolean, default: false },
  difficulty: { type: String, default: 'medium' }
});
</script>

<style scoped>
.controls { display: flex; gap: 10px; align-items: center; padding: 8px 10px; background: linear-gradient(180deg, rgba(8,18,32,0.7), rgba(5,12,20,0.6)); border: 1px solid rgba(158,203,255,0.18); border-radius: 10px; backdrop-filter: blur(6px); box-shadow: 0 6px 20px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.04); }
.btn { background: linear-gradient(135deg, #0b5bd7, #1776ff); border: 1px solid rgba(255,255,255,0.12); color: #fff; padding: 10px 14px; border-radius: 10px; cursor: pointer; transition: transform .08s ease, box-shadow .2s ease, filter .2s ease; box-shadow: 0 6px 20px rgba(23,118,255,0.25), inset 0 0 0 1px rgba(255,255,255,0.08); text-shadow: 0 1px 0 rgba(0,0,0,0.2); }
.btn--primary { background: linear-gradient(135deg, #12b886, #60ffa6); color: #06141f; box-shadow: 0 6px 20px rgba(96,255,166,0.25), inset 0 0 0 1px rgba(255,255,255,0.2); }
.btn--ghost { background: linear-gradient(135deg, rgba(11,91,215,0.15), rgba(23,118,255,0.12)); color: #e7f0ff; border: 1px solid rgba(158,203,255,0.25); }
.btn:disabled { opacity: 0.55; cursor: not-allowed; filter: grayscale(0.2); }
.btn:hover:not(:disabled) { filter: brightness(1.05); box-shadow: 0 10px 28px rgba(23,118,255,0.35), inset 0 0 0 1px rgba(255,255,255,0.16); }
.btn:active:not(:disabled) { transform: translateY(1px) scale(0.99); }
.select { background: linear-gradient(180deg, rgba(10,20,35,0.85), rgba(7,16,28,0.9)); color: #e7f0ff; border: 1px solid rgba(158,203,255,0.3); border-radius: 10px; padding: 9px 12px; outline: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06); }
</style>


