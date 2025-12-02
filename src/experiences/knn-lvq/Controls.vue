<script setup>
import ExperiencePanel from '../../components/ExperiencePanel.vue'
import BackToMenu from '../../components/BackToMenu.vue'

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
  },
  resolveTies: {
    type: Boolean,
    default: true
  }
})

defineEmits(['update:k', 'update:selectedClass', 'update:showLvq', 'update:resolveTies', 'clear', 'init-lvq', 'train-lvq'])
</script>

<template>
  <ExperiencePanel title="kNN Visualization" class="h-full overflow-y-auto pointer-events-auto">
    <template #header>
      <BackToMenu />
    </template>

    <div class="flex flex-col gap-6">
      
      <div class="text-sm text-white/60 font-light">
        Double-click to add points.
      </div>

    <!-- Mode Switcher -->
    <div class="flex flex-col gap-3">
      <label class="text-xs font-medium text-white/50 uppercase tracking-wider">Mode</label>
      <div class="flex p-1 bg-black/20 rounded-xl">
        <button 
          class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200"
          :class="!showLvq ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/60'"
          @click="$emit('update:showLvq', false)"
        >
          kNN
        </button>
        <button 
          class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200"
          :class="showLvq ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/60'"
          @click="$emit('update:showLvq', true)"
        >
          LVQ
        </button>
      </div>
    </div>

    <!-- kNN Controls -->
    <div v-if="!showLvq" class="flex flex-col gap-4">
      <div class="flex justify-between items-center">
        <label for="k-value" class="text-sm font-medium text-white/80">Neighbors (k)</label>
        <span class="px-2 py-1 bg-white/10 rounded-md text-xs font-bold text-white font-mono">{{ k }}</span>
      </div>
      
      <div class="relative h-6 flex items-center">
        <input 
          id="k-value"
          type="range" 
          min="1" 
          max="20" 
          step="1"
          :value="k"
          @input="$emit('update:k', Number($event.target.value))"
          class="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
        >
      </div>

      <label class="flex items-center gap-3 text-sm text-white/70 cursor-pointer group select-none">
        <div class="relative flex items-center">
          <input 
            type="checkbox" 
            :checked="resolveTies"
            @change="$emit('update:resolveTies', $event.target.checked)"
            class="peer sr-only"
          >
          <div class="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
        </div>
        <span class="group-hover:text-white transition-colors">Resolve ties</span>
      </label>
    </div>

    <!-- LVQ Controls -->
    <div v-if="showLvq" class="flex flex-col gap-4">
      <div class="flex justify-between items-center">
        <label class="text-sm font-medium text-white/80">Prototypes</label>
        <span class="px-2 py-1 bg-white/10 rounded-md text-xs font-bold text-white font-mono">{{ prototypes.length }}</span>
      </div>
      
      <div class="grid grid-cols-2 gap-2">
        <button 
          class="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-colors"
          @click="$emit('init-lvq')"
        >
          Initialize
        </button>
        <button 
          class="py-2 px-3 bg-primary/20 hover:bg-primary/30 border border-primary/40 rounded-xl text-sm font-medium text-primary-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="$emit('train-lvq')" 
          :disabled="prototypes.length === 0"
        >
          Train Epoch
        </button>
      </div>
    </div>

    <!-- Class Selection -->
    <div class="flex flex-col gap-3">
      <h3 class="text-xs font-medium text-white/50 uppercase tracking-wider">Select Class</h3>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="cls in classes"
          :key="cls.id"
          class="group relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200"
          :class="selectedClass === cls.id ? 'bg-white/10 border-white/30 shadow-lg' : 'bg-white/5 border-transparent hover:bg-white/10'"
          @click="$emit('update:selectedClass', cls.id)"
        >
          <span 
            class="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
            :style="{ backgroundColor: cls.color, color: cls.color }"
          ></span>
          <span class="text-sm font-medium text-white/90">{{ cls.name }}</span>
          
          <!-- Active Indicator -->
          <div 
            v-if="selectedClass === cls.id"
            class="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20"
          ></div>
        </button>
      </div>
    </div>

    <!-- Clear Button -->
    <div class="mt-auto pt-4 border-t border-white/10">
      <button 
        class="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-red-900/20"
        @click="$emit('clear')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        Clear Canvas
      </button>
    </div>
    </div>
  </ExperiencePanel>
</template>
