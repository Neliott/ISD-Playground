<script setup>
const props = defineProps({
  learningRate: Number,
  isRunning: Boolean
})

const emit = defineEmits(['update:learningRate', 'start', 'stop', 'reset', 'step'])

function handleRateChange(e) {
  emit('update:learningRate', parseFloat(e.target.value))
}

</script>

<template>
  <div class="space-y-8">
    <!-- Learning Rate Slider -->
    <div>
      <div class="flex justify-between mb-2">
        <label class="text-sm font-bold text-white">Learning Rate (Step Size)</label>
        <span class="text-sm font-mono text-accent">{{ learningRate }}</span>
      </div>
      <input 
        type="range" 
        min="0.01" 
        max="1.5" 
        step="0.01" 
        :value="learningRate"
        @input="handleRateChange"
        class="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent hover:accent-accent-300"
      >
      <div class="flex justify-between text-xs text-white/30 mt-1">
        <span>Tiny Steps (Slow)</span>
        <span>Huge Steps (Unstable)</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-col gap-3">
      <button 
        v-if="!isRunning"
        class="w-full py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
        @click="$emit('start')"
      >
        <span>▶</span> Start Descent
      </button>

      <button 
        v-else
        class="w-full py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/10 flex items-center justify-center gap-2"
        @click="$emit('stop')"
      >
        <span>⏸</span> Pause
      </button>

      <div class="grid grid-cols-2 gap-3">
        <button 
          class="py-3 bg-white/5 text-white text-sm font-semibold rounded-xl hover:bg-white/10 transition-colors border border-white/5"
          @click="$emit('step')"
        >
          Step (+1)
        </button>
        <button 
          class="py-3 bg-white/5 text-white text-sm font-semibold rounded-xl hover:bg-white/10 transition-colors border border-white/5"
          @click="$emit('reset')"
        >
          Reset
        </button>
      </div>
    </div>
  </div>
</template>
