<template>
  <div class="controls glass-panel">
    <button 
      class="btn btn--primary" 
      @click="$emit(running ? 'reset' : 'start')"
      :class="{ 'animate-shake': running }"
    >
      <span class="btn-icon">{{ running ? '↻' : '▶' }}</span>
      <span class="btn-text">{{ running ? 'Restart' : 'Start' }}</span>
    </button>
    
    <button 
      class="btn btn--ghost" 
      @click="$emit(paused ? 'resume' : 'pause')" 
      :disabled="!running"
    >
      <span class="btn-icon">{{ paused ? '▶' : '⏸' }}</span>
      <span class="btn-text">{{ paused ? 'Resume' : 'Pause' }}</span>
    </button>
    
    <div class="select-wrapper">
      <select 
        class="select" 
        :value="difficulty" 
        @change="$emit('set-difficulty', $event.target.value)"
      >
        <option value="classic">🎯 Classic</option>
        <option value="hard">🔥 Hard</option>
        <option value="insane">⚡ Insane</option>
      </select>
      <div class="select-arrow">▼</div>
    </div>
    
    <button 
      class="btn" 
      @click="$emit('toggle-mute')"
    >
      <span class="btn-icon">{{ muted ? '🔇' : '🔊' }}</span>
      <span class="btn-text">{{ muted ? 'Unmute' : 'Mute' }}</span>
    </button>
    
    <button 
      class="btn" 
      @click="$emit('toggle-fullscreen')"
    >
      <span class="btn-icon">⛶</span>
      <span class="btn-text">Full Screen</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  running: { type: Boolean, default: false },
  paused: { type: Boolean, default: false },
  muted: { type: Boolean, default: false },
  difficulty: { type: String, default: 'classic' }
});
</script>

<style scoped>
.controls { 
  display: flex; 
  gap: 12px; 
  align-items: center; 
  padding: 16px 20px; 
  flex-wrap: wrap;
  justify-content: center;
}

.btn { 
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px; 
  border-radius: 12px; 
  cursor: pointer; 
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 120px;
  justify-content: center;
}

.btn-icon {
  font-size: 16px;
  line-height: 1;
  transition: transform var(--transition-fast);
}

.btn-text {
  font-size: 13px;
  font-weight: 600;
}

.btn:hover .btn-icon {
  transform: scale(1.1);
}

.btn:active .btn-icon {
  transform: scale(0.95);
}

.btn--primary {
  background: linear-gradient(135deg, #12b886, #60ffa6);
  color: #06141f;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 4px 16px rgba(96, 255, 166, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
}

.btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 24px rgba(96, 255, 166, 0.4),
    0 0 30px rgba(96, 255, 166, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  filter: brightness(1.1);
}

.btn--ghost {
  background: linear-gradient(135deg, 
    rgba(11, 91, 215, 0.2), 
    rgba(23, 118, 255, 0.15)
  );
  color: var(--fg-primary);
  border: 1px solid rgba(158, 203, 255, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 12px rgba(23, 118, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.btn--ghost:hover {
  background: linear-gradient(135deg, 
    rgba(11, 91, 215, 0.3), 
    rgba(23, 118, 255, 0.25)
  );
  border-color: var(--fg-accent);
  box-shadow: 
    0 6px 20px rgba(23, 118, 255, 0.3),
    0 0 20px rgba(96, 255, 166, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.btn:disabled { 
  opacity: 0.4; 
  cursor: not-allowed; 
  filter: grayscale(0.3);
  transform: none !important;
}

.btn:active:not(:disabled) { 
  transform: translateY(0) scale(0.98); 
  transition: all 0.1s ease;
}

.select-wrapper { 
  position: relative; 
  display: inline-block;
  min-width: 140px;
}

.select { 
  background: linear-gradient(180deg, 
    rgba(10, 20, 35, 0.9), 
    rgba(7, 16, 28, 0.95)
  );
  color: var(--fg-primary); 
  border: 1px solid rgba(158, 203, 255, 0.3); 
  border-radius: 12px; 
  padding: 12px 40px 12px 16px; 
  outline: none; 
  cursor: pointer; 
  transition: all var(--transition-normal);
  backdrop-filter: blur(10px);
  box-shadow: 
    inset 0 1px 3px rgba(0, 0, 0, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.1);
  appearance: none;
  font-weight: 500;
  font-size: 13px;
  width: 100%;
}

.select:hover { 
  border-color: rgba(158, 203, 255, 0.5); 
  box-shadow: 
    inset 0 1px 3px rgba(0, 0, 0, 0.2),
    0 4px 16px rgba(23, 118, 255, 0.2),
    0 0 20px rgba(23, 118, 255, 0.1);
  transform: translateY(-1px);
}

.select:focus { 
  border-color: var(--fg-accent); 
  box-shadow: 
    inset 0 1px 3px rgba(0, 0, 0, 0.2),
    0 0 0 3px rgba(96, 255, 166, 0.2),
    0 0 30px rgba(96, 255, 166, 0.1);
}

.select-arrow { 
  position: absolute; 
  right: 12px; 
  top: 50%; 
  transform: translateY(-50%); 
  pointer-events: none; 
  color: var(--fg-secondary); 
  font-size: 12px; 
  transition: all var(--transition-normal);
  font-weight: bold;
}

.select-wrapper:hover .select-arrow { 
  transform: translateY(-50%) scale(1.2); 
  color: var(--fg-accent);
}

/* Responsive design */
@media (max-width: 768px) {
  .controls {
    gap: 8px;
    padding: 12px 16px;
  }
  
  .btn {
    padding: 10px 14px;
    min-width: 100px;
    font-size: 12px;
  }
  
  .btn-text {
    font-size: 11px;
  }
  
  .select-wrapper {
    min-width: 120px;
  }
  
  .select {
    padding: 10px 36px 10px 14px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .controls {
    gap: 6px;
    padding: 10px 12px;
  }
  
  .btn {
    padding: 8px 12px;
    min-width: 80px;
    font-size: 11px;
  }
  
  .btn-text {
    display: none;
  }
  
  .btn-icon {
    font-size: 14px;
  }
  
  .select-wrapper {
    min-width: 100px;
  }
  
  .select {
    padding: 8px 32px 8px 12px;
    font-size: 11px;
  }
}
</style>


