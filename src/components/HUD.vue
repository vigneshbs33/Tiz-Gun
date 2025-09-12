<template>
  <aside class="hud">
    <div class="panel">
      <div class="row"><span>Score</span><strong>{{ score }}</strong></div>
      <div class="row"><span>High</span><strong>{{ highScore }}</strong></div>
      <div class="row"><span>Lives</span><strong>{{ lives }}</strong></div>
      <div class="row"><span>Level</span><strong>{{ level }}</strong></div>
    </div>
    <div v-if="gameOver" class="gameover">
      <h3>Game Over</h3>
      <p>Your score: <strong>{{ score }}</strong></p>
      <p>High score: <strong>{{ highScore }}</strong></p>
      <button class="btn" @click="$emit('restart')">Restart</button>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  score: { type: Number, default: 0 },
  highScore: { type: Number, default: 0 },
  lives: { type: Number, default: 3 },
  level: { type: Number, default: 1 },
  gameOver: { type: Boolean, default: false }
});
</script>

<style scoped>
.hud { display: flex; flex-direction: column; gap: 12px; }
.panel { background: rgba(8,18,32,0.7); border: 1px solid rgba(158,203,255,0.15); border-radius: 8px; padding: 12px; }
.row { display: flex; align-items: center; justify-content: space-between; margin: 6px 0; }
.row span { opacity: 0.8; }
.gameover { background: rgba(255,55,55,0.08); border: 1px solid rgba(255,100,100,0.25); padding: 12px; border-radius: 8px; }
.btn { background: #0b5bd7; border: none; color: #fff; padding: 8px 12px; border-radius: 6px; cursor: pointer; }
.btn:hover { filter: brightness(1.1); }
</style>


