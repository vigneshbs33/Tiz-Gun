<template>
  <aside class="hud">
    <div class="panel glass-panel">
      <div class="player-name-section">
        <label for="player-name" class="name-label">PLAYER NAME</label>
        <input 
          id="player-name"
          v-model="playerName" 
          type="text" 
          class="name-input input-field" 
          placeholder="Enter your name"
          maxlength="20"
          @input="onNameChange"
        />
      </div>
      
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <span class="stat-label">SCORE</span>
            <span class="stat-value">{{ score.toLocaleString() }}</span>
          </div>
        </div>
        
        <div class="stat-item high-score-item">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <span class="stat-label">HIGH</span>
            <span class="stat-value high-score">{{ highScore.toLocaleString() }}</span>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">❤️</div>
          <div class="stat-content">
            <span class="stat-label">LIVES</span>
            <span class="stat-value" :class="{ 'low-lives': lives <= 1 }">{{ lives }}</span>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">⚡</div>
          <div class="stat-content">
            <span class="stat-label">LEVEL</span>
            <span class="stat-value">{{ level }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="gameOver" class="gameover glass-panel animate-fade-in-scale">
      <div class="gameover-content">
        <h3 class="gameover-title">
          {{ newHighScore ? 'New High Score!' : 'Game Over' }}
        </h3>
        <div v-if="newHighScore" class="new-high-score-badge">
          <span class="badge-icon">🏆</span>
          <span class="badge-text">New High Score in {{ difficulty.toUpperCase() }} Mode!</span>
        </div>
        <div class="score-display">
          <div class="score-item">
            <span class="score-label">Your Score</span>
            <span class="score-value" :class="{ 'new-high': newHighScore }">{{ score.toLocaleString() }}</span>
          </div>
          <div class="score-item">
            <span class="score-label">{{ difficulty.toUpperCase() }} High Score</span>
            <span class="score-value high-score">{{ highScore.toLocaleString() }}</span>
          </div>
        </div>
        <div class="gameover-actions">
          <button class="btn btn--primary" @click="$emit('restart')">
            <span class="btn-icon">↻</span>
            <span class="btn-text">Play Again</span>
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  score: { type: Number, default: 0 },
  highScore: { type: Number, default: 0 },
  globalHighScore: { type: Object, default: () => ({ name: '', score: 0, mode: '', timestamp: null }) },
  lives: { type: Number, default: 3 },
  level: { type: Number, default: 1 },
  gameOver: { type: Boolean, default: false },
  newHighScore: { type: Boolean, default: false },
  newGlobalHighScore: { type: Boolean, default: false },
  difficulty: { type: String, default: 'classic' }
});

const emit = defineEmits(['restart', 'name-change']);

const playerName = ref('');

onMounted(() => {
  try {
    const saved = localStorage.getItem('tizgun_player_name');
    playerName.value = saved || '';
  } catch {}
});

function onNameChange() {
  try {
    localStorage.setItem('tizgun_player_name', playerName.value);
    emit('name-change', playerName.value);
  } catch {}
}

</script>

<style scoped>
.hud { 
  display: flex; 
  flex-direction: column; 
  gap: 16px; 
  min-width: 320px;
}

.panel { 
  padding: 24px; 
  border-radius: 20px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: rgba(15, 20, 35, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.1), 
    transparent
  );
}

.player-name-section { 
  margin-bottom: 24px; 
  padding-bottom: 20px; 
  border-bottom: 1px solid rgba(158, 203, 255, 0.15);
}

.name-label { 
  display: block; 
  font-size: 11px; 
  color: #9ecbff; 
  margin-bottom: 10px; 
  text-transform: uppercase; 
  letter-spacing: 0.8px; 
  font-weight: 600;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
}

.name-input { 
  width: 100%; 
  font-size: 14px; 
  padding: 14px 18px;
  border-radius: 12px;
  transition: all var(--transition-normal);
  background: rgba(10, 20, 35, 0.9);
  border: 1px solid rgba(158, 203, 255, 0.2);
  color: #e7f0ff;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
}

.name-input:focus {
  border-color: #60ffa6;
  box-shadow: 
    0 0 0 3px rgba(96, 255, 166, 0.2),
    0 0 20px rgba(96, 255, 166, 0.1);
  background: rgba(10, 20, 35, 0.95);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: rgba(10, 20, 35, 0.6);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.1), 
    transparent
  );
}

.stat-item:hover {
  background: rgba(10, 20, 35, 0.8);
  border-color: rgba(96, 255, 166, 0.2);
  transform: translateY(-2px);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(96, 255, 166, 0.1);
}

.high-score-item {
  background: rgba(10, 20, 35, 0.7);
  border-color: rgba(255, 215, 0, 0.2);
}

.high-score-item:hover {
  border-color: rgba(255, 215, 0, 0.3);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(255, 215, 0, 0.1);
}

.stat-icon {
  font-size: 22px;
  line-height: 1;
  filter: drop-shadow(0 0 8px rgba(96, 255, 166, 0.4));
  min-width: 24px;
  text-align: center;
}

.high-score-item .stat-icon {
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.stat-label { 
  font-size: 10px; 
  color: #9ecbff; 
  text-transform: uppercase; 
  letter-spacing: 0.8px; 
  font-weight: 600;
  opacity: 0.9;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
}

.stat-value { 
  font-weight: 700; 
  font-size: 20px; 
  color: #e7f0ff;
  line-height: 1;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
}

.high-score { 
  color: #60ffa6;
  text-shadow: 0 0 10px rgba(96, 255, 166, 0.4);
}



.low-lives {
  color: var(--fg-danger);
  animation: pulse 1s ease-in-out infinite;
}



.gameover { 
  background: linear-gradient(135deg, 
    rgba(255, 55, 55, 0.15), 
    rgba(255, 100, 100, 0.08)
  ); 
  border: 1px solid rgba(255, 100, 100, 0.3); 
  padding: 32px; 
  border-radius: 20px; 
  box-shadow: 
    0 12px 40px rgba(255, 55, 55, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
}

.gameover::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.2), 
    transparent
  );
}

.gameover-content { 
  text-align: center; 
  position: relative;
  z-index: 1;
}

.gameover-title { 
  margin: 0 0 24px 0; 
  color: #ff6b6b; 
  font-size: 32px; 
  font-weight: 800; 
  text-transform: uppercase;
  letter-spacing: 1.2px;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
  text-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
}

.new-high-score-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 0 20px 0;
  padding: 12px 20px;
  background: linear-gradient(135deg, 
    rgba(96, 255, 166, 0.2), 
    rgba(18, 184, 134, 0.15)
  );
  border: 1px solid rgba(96, 255, 166, 0.4);
  border-radius: 12px;
  animation: glow 2s ease-in-out infinite;
}


.badge-icon {
  font-size: 20px;
  animation: bounce 1s ease-in-out infinite;
}

.badge-text {
  color: var(--fg-accent);
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 0 10px rgba(96, 255, 166, 0.5);
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@keyframes pop {
  0%, 100% { 
    transform: translateY(0) scale(1); 
  }
  50% { 
    transform: translateY(-2px) scale(1.05); 
  }
}

@keyframes neonPulse {
  0%, 100% { 
    box-shadow: 
      0 2px 6px rgba(96, 255, 166, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  50% { 
    box-shadow: 
      0 4px 12px rgba(96, 255, 166, 0.4),
      0 0 20px rgba(96, 255, 166, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
}

.score-display { 
  margin: 24px 0; 
}

.score-item { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin: 16px 0; 
  padding: 20px 24px; 
  background: rgba(10, 20, 35, 0.8); 
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.score-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.1), 
    transparent
  );
}

.score-item:hover {
  background: rgba(10, 20, 35, 0.9);
  border-color: rgba(96, 255, 166, 0.3);
  transform: translateY(-2px);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(96, 255, 166, 0.1);
}

.score-label { 
  color: #9ecbff; 
  font-size: 13px; 
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
}

.score-value { 
  font-weight: 800; 
  font-size: 22px; 
  color: #e7f0ff;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
}

.score-value.new-high {
  color: var(--fg-accent);
  text-shadow: 0 0 15px rgba(96, 255, 166, 0.6);
  animation: pulse 1.5s ease-in-out infinite;
}


.gameover-actions { 
  margin-top: 24px; 
}

.btn { 
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 28px; 
  border-radius: 16px; 
  cursor: pointer; 
  font-weight: 700;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #12b886, #60ffa6);
  color: #06141f;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 6px 20px rgba(96, 255, 166, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.3), 
    transparent
  );
  transition: left 0.6s ease;
}

.btn:hover::before {
  left: 100%;
}

.btn:hover { 
  transform: translateY(-3px); 
  box-shadow: 
    0 12px 32px rgba(96, 255, 166, 0.5),
    0 0 40px rgba(96, 255, 166, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  filter: brightness(1.1);
}

.btn:active {
  transform: translateY(-1px) scale(0.98);
  transition: all 0.1s ease;
}

.btn-icon { 
  font-size: 20px; 
  line-height: 1;
  transition: transform var(--transition-fast);
}

.btn:hover .btn-icon {
  transform: scale(1.1);
}

.btn-text {
  font-weight: 700;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
}

/* Responsive design */
@media (max-width: 1024px) {
  .hud {
    min-width: 280px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  
  .stat-item {
    padding: 14px;
  }
  
  .stat-value {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .hud {
    min-width: 260px;
  }
  
  .panel {
    padding: 20px;
  }
  
  .gameover {
    padding: 24px;
  }
  
  .gameover-title {
    font-size: 28px;
  }
  
  .score-value {
    font-size: 20px;
  }
  
  .btn {
    padding: 14px 24px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .hud {
    min-width: auto;
  }
  
  .panel {
    padding: 16px;
  }
  
  .stat-item {
    padding: 12px;
    gap: 10px;
  }
  
  .stat-icon {
    font-size: 18px;
  }
  
  .stat-value {
    font-size: 16px;
  }
  
  .gameover {
    padding: 20px;
  }
  
  .gameover-title {
    font-size: 24px;
  }
  
  .btn {
    padding: 12px 20px;
    font-size: 13px;
  }
  
  .btn-text {
    display: none;
  }
  
  .btn-icon {
    font-size: 18px;
  }
}
</style>


