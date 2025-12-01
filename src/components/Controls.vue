<script setup>
defineProps({
  k: {
    type: Number,
    required: true
  },
  classes: {
    type: Array,
    required: true
  },
  selectedClass: {
    type: Number,
    required: true
  },
  showLvq: {
    type: Boolean,
    required: true
  },
  prototypes: {
    type: Array,
    required: true
  }
})

defineEmits(['update:k', 'update:selectedClass', 'update:showLvq', 'clear', 'init-lvq', 'train-lvq'])
</script>

<template>
  <div class="controls-card">
    <div class="control-group">
      <div class="label-row">
        <label>Mode</label>
      </div>
      <div class="mode-switch">
        <button 
          class="mode-btn" 
          :class="{ active: !showLvq }"
          @click="$emit('update:showLvq', false)"
        >
          kNN
        </button>
        <button 
          class="mode-btn" 
          :class="{ active: showLvq }"
          @click="$emit('update:showLvq', true)"
        >
          LVQ
        </button>
      </div>
    </div>

    <div v-if="!showLvq" class="control-group">
      <div class="label-row">
        <label for="k-value">Neighbors (k)</label>
        <span class="value-badge">{{ k }}</span>
      </div>
      <div class="slider-container">
        <input 
          id="k-value"
          type="range" 
          min="1" 
          max="20" 
          step="1"
          :value="k"
          @input="$emit('update:k', Number($event.target.value))"
        >
      </div>
    </div>

    <div v-if="showLvq" class="control-group">
      <div class="label-row">
        <label>Prototypes</label>
        <span class="value-badge">{{ prototypes.length }}</span>
      </div>
      <div class="lvq-actions">
        <button class="action-btn" @click="$emit('init-lvq')">
          Initialize
        </button>
        <button class="action-btn primary" @click="$emit('train-lvq')" :disabled="prototypes.length === 0">
          Train 1 Epoch
        </button>
      </div>
    </div>

    <div class="control-group">
      <h3>Select Class</h3>
      <div class="class-grid">
        <button
          v-for="cls in classes"
          :key="cls.id"
          class="class-btn"
          :class="{ active: selectedClass === cls.id }"
          :style="{ '--btn-color': cls.color }"
          @click="$emit('update:selectedClass', cls.id)"
        >
          <span class="color-dot" :style="{ backgroundColor: cls.color }"></span>
          <span class="class-name">{{ cls.name }}</span>
        </button>
      </div>
    </div>

    <button class="clear-btn" @click="$emit('clear')">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      Clear Canvas
    </button>
  </div>
</template>

<style scoped>
.controls-card {
  padding: 24px;
  background: rgba(30, 30, 30, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 32px;
  height: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

label {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.value-badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* Custom Slider */
input[type=range] {
  -webkit-appearance: none;
  width: 100%;
  background: transparent;
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  margin-top: -8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  transition: transform 0.1s;
}

input[type=range]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.class-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.class-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  font-size: 0.9rem;
}

.class-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.class-btn.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--btn-color);
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 8px var(--btn-color);
}

.clear-btn {
  margin-top: auto;
  padding: 14px;
  background: rgba(255, 68, 68, 0.1);
  color: #ff6666;
  border: 1px solid rgba(255, 68, 68, 0.2);
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: rgba(255, 68, 68, 0.2);
  transform: translateY(-1px);
}

.mode-switch {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}

.mode-btn {
  flex: 1;
  padding: 8px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.mode-btn.active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.lvq-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.action-btn.primary {
  background: rgba(68, 100, 255, 0.2);
  border-color: rgba(68, 100, 255, 0.4);
  color: #88aaff;
}

.action-btn.primary:hover:not(:disabled) {
  background: rgba(68, 100, 255, 0.3);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
