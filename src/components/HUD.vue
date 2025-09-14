<template>
  <aside class="hud">
    <div class="panel glass-panel">
      <div class="player-name-section">
        <label for="player-name" class="name-label">Player Name</label>
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
            <span class="stat-label">Score</span>
            <span class="stat-value">{{ score.toLocaleString() }}</span>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <span class="stat-label">High</span>
            <span class="stat-value high-score">{{ highScore.toLocaleString() }}</span>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">❤️</div>
          <div class="stat-content">
            <span class="stat-label">Lives</span>
            <span class="stat-value" :class="{ 'low-lives': lives <= 1 }">{{ lives }}</span>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">⚡</div>
          <div class="stat-content">
            <span class="stat-label">Level</span>
            <span class="stat-value">{{ level }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="gameOver" class="gameover glass-panel animate-fade-in-scale">
      <div class="gameover-content">
        <h3 class="gameover-title">Game Over</h3>
        <div class="score-display">
          <div class="score-item">
            <span class="score-label">Your Score</span>
            <span class="score-value">{{ score.toLocaleString() }}</span>
          </div>
          <div class="score-item">
            <span class="score-label">Your Best</span>
            <span class="score-value high-score">{{ highScore.toLocaleString() }}</span>
          </div>
          <div class="score-item global-champion">
            <span class="score-label">🏆 Global Champion</span>
            <div class="champion-details">
              <span class="champion-name">{{ globalHighScore.name }}</span>
              <span class="champion-score">{{ globalHighScore.score.toLocaleString() }}</span>
            </div>
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
  lives: { type: Number, default: 3 },
  level: { type: Number, default: 1 },
  gameOver: { type: Boolean, default: false }
});

const emit = defineEmits(['restart', 'name-change']);

const playerName = ref('');
const globalHighScore = ref({ name: 'Anonymous', score: 0 });

onMounted(() => {
  try {
    const saved = localStorage.getItem('tizgun_player_name');
    playerName.value = saved || '';
    
    // Load global high score
    const globalScore = localStorage.getItem('tizgun_global_high_score');
    if (globalScore) {
      globalHighScore.value = JSON.parse(globalScore);
    }
  } catch {}
});

function onNameChange() {
  try {
    localStorage.setItem('tizgun_player_name', playerName.value);
    emit('name-change', playerName.value);
  } catch {}
}

// Function to update global high score (called from parent)
function updateGlobalHighScore(score, name) {
  if (score > globalHighScore.value.score) {
    const playerName = name && name.trim() ? name.trim() : 'Anonymous';
    globalHighScore.value = { name: playerName, score };
    try {
      localStorage.setItem('tizgun_global_high_score', JSON.stringify(globalHighScore.value));
    } catch {}
    return true; // New global high score
  }
  return false;
}

// Expose function to parent
defineExpose({ updateGlobalHighScore });
</script>

<style scoped>
.hud { 
  display: flex; 
  flex-direction: column; 
  gap: 16px; 
  min-width: 280px;
}

.panel { 
  padding: 20px; 
  border-radius: 16px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
}

.player-name-section { 
  margin-bottom: 20px; 
  padding-bottom: 16px; 
  border-bottom: 1px solid rgba(158, 203, 255, 0.2);
}

.name-label { 
  display: block; 
  font-size: 12px; 
  color: var(--fg-secondary); 
  margin-bottom: 8px; 
  text-transform: uppercase; 
  letter-spacing: 0.5px; 
  font-weight: 600;
}

.name-input { 
  width: 100%; 
  font-size: 14px; 
  padding: 12px 16px;
  border-radius: 10px;
  transition: all var(--transition-normal);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all var(--transition-normal);
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(96, 255, 166, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(96, 255, 166, 0.1);
}

.stat-icon {
  font-size: 20px;
  line-height: 1;
  filter: drop-shadow(0 0 8px rgba(96, 255, 166, 0.3));
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.stat-label { 
  font-size: 11px; 
  color: var(--fg-secondary); 
  text-transform: uppercase; 
  letter-spacing: 0.5px; 
  font-weight: 600;
  opacity: 0.8;
}

.stat-value { 
  font-weight: 700; 
  font-size: 18px; 
  color: var(--fg-primary);
  line-height: 1;
}

.high-score { 
  color: var(--fg-accent);
  text-shadow: 0 0 10px rgba(96, 255, 166, 0.3);
}

.low-lives {
  color: var(--fg-danger);
  animation: pulse 1s ease-in-out infinite;
}


/* Game Over Global Champion Styles */
.global-champion {
  background: linear-gradient(135deg, 
    rgba(255, 215, 0, 0.15), 
    rgba(255, 165, 0, 0.1)
  ) !important;
  border: 1px solid rgba(255, 215, 0, 0.4) !important;
}

.champion-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.champion-details .champion-name {
  font-size: 14px;
  color: var(--fg-accent);
  text-shadow: 0 0 8px rgba(96, 255, 166, 0.4);
  margin-bottom: 0;
}

.champion-details .champion-score {
  font-size: 18px;
  color: #ffd700;
  text-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
}

.gameover { 
  background: linear-gradient(135deg, 
    rgba(255, 55, 55, 0.1), 
    rgba(255, 100, 100, 0.05)
  ); 
  border: 1px solid rgba(255, 100, 100, 0.3); 
  padding: 24px; 
  border-radius: 16px; 
  box-shadow: 
    0 8px 32px rgba(255, 55, 55, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.gameover-content { 
  text-align: center; 
}

.gameover-title { 
  margin: 0 0 20px 0; 
  color: var(--fg-danger); 
  font-size: 28px; 
  font-weight: 800; 
  text-transform: uppercase;
  letter-spacing: 1px;
}

.score-display { 
  margin: 20px 0; 
}

.score-item { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin: 12px 0; 
  padding: 16px 20px; 
  background: rgba(0, 0, 0, 0.3); 
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all var(--transition-normal);
}

.score-item:hover {
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(96, 255, 166, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(96, 255, 166, 0.1);
}

.score-label { 
  color: var(--fg-secondary); 
  font-size: 14px; 
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.score-value { 
  font-weight: 800; 
  font-size: 20px; 
  color: var(--fg-primary);
}

.gameover-actions { 
  margin-top: 24px; 
}

.btn { 
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px; 
  border-radius: 12px; 
  cursor: pointer; 
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #12b886, #60ffa6);
  color: #06141f;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 4px 16px rgba(96, 255, 166, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.btn:hover { 
  transform: translateY(-3px); 
  box-shadow: 
    0 8px 24px rgba(96, 255, 166, 0.4),
    0 0 30px rgba(96, 255, 166, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  filter: brightness(1.1);
}

.btn:active {
  transform: translateY(-1px) scale(0.98);
  transition: all 0.1s ease;
}

.btn-icon { 
  font-size: 18px; 
  line-height: 1;
  transition: transform var(--transition-fast);
}

.btn:hover .btn-icon {
  transform: scale(1.1);
}

.btn-text {
  font-weight: 700;
}

/* Responsive design */
@media (max-width: 1024px) {
  .hud {
    min-width: 240px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-item {
    padding: 10px;
  }
  
  .stat-value {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .hud {
    min-width: 200px;
  }
  
  .panel {
    padding: 16px;
  }
  
  .gameover {
    padding: 20px;
  }
  
  .gameover-title {
    font-size: 24px;
  }
  
  .score-value {
    font-size: 18px;
  }
  
  .btn {
    padding: 12px 20px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .hud {
    min-width: auto;
  }
  
  .stat-item {
    padding: 8px;
    gap: 8px;
  }
  
  .stat-icon {
    font-size: 16px;
  }
  
  .stat-value {
    font-size: 14px;
  }
  
  .btn-text {
    display: none;
  }
  
  .btn-icon {
    font-size: 16px;
  }
}
</style>


