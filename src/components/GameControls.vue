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
  gap: 14px; 
  align-items: center; 
  padding: 20px 24px; 
  flex-wrap: wrap;
  justify-content: center;
}

.btn { 
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px; 
  border-radius: 16px; 
  cursor: pointer; 
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  min-width: 130px;
  justify-content: center;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
}

.btn-icon {
  font-size: 18px;
  line-height: 1;
  transition: transform var(--transition-fast);
}

.btn-text {
  font-size: 13px;
  font-weight: 600;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
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
    0 6px 20px rgba(96, 255, 166, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
}

.btn--primary::before {
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

.btn--primary:hover::before {
  left: 100%;
}

.btn--primary:hover {
  transform: translateY(-3px);
  box-shadow: 
    0 12px 32px rgba(96, 255, 166, 0.5),
    0 0 40px rgba(96, 255, 166, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  filter: brightness(1.1);
}

.btn--ghost {
  background: linear-gradient(135deg, 
    rgba(11, 91, 215, 0.25), 
    rgba(23, 118, 255, 0.2)
  );
  color: #e7f0ff;
  border: 1px solid rgba(158, 203, 255, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 
    0 6px 16px rgba(23, 118, 255, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.btn--ghost:hover {
  background: linear-gradient(135deg, 
    rgba(11, 91, 215, 0.35), 
    rgba(23, 118, 255, 0.3)
  );
  border-color: #60ffa6;
  box-shadow: 
    0 8px 24px rgba(23, 118, 255, 0.4),
    0 0 30px rgba(96, 255, 166, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
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
  min-width: 150px;
}

.select { 
  background: linear-gradient(180deg, 
    rgba(10, 20, 35, 0.95), 
    rgba(7, 16, 28, 0.98)
  );
  color: #e7f0ff; 
  border: 1px solid rgba(158, 203, 255, 0.3); 
  border-radius: 16px; 
  padding: 14px 44px 14px 18px; 
  outline: none; 
  cursor: pointer; 
  transition: all var(--transition-normal);
  backdrop-filter: blur(10px);
  box-shadow: 
    inset 0 1px 3px rgba(0, 0, 0, 0.2),
    0 4px 12px rgba(0, 0, 0, 0.15);
  appearance: none;
  font-weight: 500;
  font-size: 13px;
  width: 100%;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
}

.select:hover { 
  border-color: rgba(158, 203, 255, 0.5); 
  box-shadow: 
    inset 0 1px 3px rgba(0, 0, 0, 0.2),
    0 6px 20px rgba(23, 118, 255, 0.25),
    0 0 25px rgba(23, 118, 255, 0.15);
  transform: translateY(-2px);
}

.select:focus { 
  border-color: #60ffa6; 
  box-shadow: 
    inset 0 1px 3px rgba(0, 0, 0, 0.2),
    0 0 0 3px rgba(96, 255, 166, 0.2),
    0 0 30px rgba(96, 255, 166, 0.15);
}

.select-arrow { 
  position: absolute; 
  right: 14px; 
  top: 50%; 
  transform: translateY(-50%); 
  pointer-events: none; 
  color: #9ecbff; 
  font-size: 14px; 
  transition: all var(--transition-normal);
  font-weight: bold;
}

.select-wrapper:hover .select-arrow { 
  transform: translateY(-50%) scale(1.2); 
  color: #60ffa6;
}

/* Responsive design */
@media (max-width: 768px) {
  .controls {
    gap: 10px;
    padding: 16px 20px;
  }
  
  .btn {
    padding: 12px 16px;
    min-width: 110px;
    font-size: 13px;
  }
  
  .btn-text {
    font-size: 12px;
  }
  
  .select-wrapper {
    min-width: 130px;
  }
  
  .select {
    padding: 12px 40px 12px 16px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .controls {
    gap: 8px;
    padding: 12px 16px;
  }
  
  .btn {
    padding: 10px 14px;
    min-width: 90px;
    font-size: 12px;
  }
  
  .btn-text {
    display: none;
  }
  
  .btn-icon {
    font-size: 16px;
  }
  
  .select-wrapper {
    min-width: 110px;
  }
  
  .select {
    padding: 10px 36px 10px 14px;
    font-size: 11px;
  }
}
</style>


