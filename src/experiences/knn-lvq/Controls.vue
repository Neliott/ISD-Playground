<script setup>
import ExperiencePanel from '../../components/ExperiencePanel.vue'
import BackToMenu from '../../components/BackToMenu.vue'
import Tooltip from '../../components/Tooltip.vue'

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
  },
  prototypesPerClass: {
    type: Number,
    default: 3
  },
  initFromSameClass: {
    type: Boolean,
    default: false
  },
  distanceMetric: {
    type: String,
    default: 'euclidean'
  },
  distanceWeighting: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:k', 'update:selectedClass', 'update:showLvq', 'update:resolveTies', 'update:prototypesPerClass', 'update:initFromSameClass', 'update:distanceMetric', 'update:distanceWeighting', 'clear', 'init-lvq', 'train-lvq'])
</script>

<template>
  <ExperiencePanel title="kNN Visualization" class="h-full overflow-y-auto pointer-events-auto">
    <template #header>
      <BackToMenu />
    </template>

    <div class="flex flex-col gap-6">
      
      <div class="text-sm text-white/60 font-light">
        Click to add points.
      </div>

    <!-- Mode Switcher -->
    <div class="flex flex-col gap-3">
      <label class="text-xs font-medium text-white/50 uppercase tracking-wider">Mode</label>
      <Tooltip text="Choose your algorithm: k-NN remembers all data and votes based on neighbors (Lazy Learning). LVQ learns a few representative 'prototypes' to classify regions (Prototype-based Learning)." position="right">
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
      </Tooltip>
    </div>

    <!-- kNN Controls -->
    <div v-if="!showLvq" class="flex flex-col gap-4">
      <Tooltip text="The 'k' in k-NN. It decides how many neighbors vote. Small k (e.g., 1) creates jagged boundaries sensitive to noise. Large k creates smoother boundaries but might miss local details." position="right">
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
      </Tooltip>

      <Tooltip text="What happens if 2 Red and 2 Blue neighbors vote? With this enabled, we break the tie by choosing the class of the single closest neighbor among them." position="right">
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
      </Tooltip>

      <!-- Distance Controls -->
      <div class="flex flex-col gap-4 pt-4 border-t border-white/10">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-white/80">Distance Metric</label>
          <div class="grid grid-cols-3 gap-1 bg-black/20 p-1 rounded-xl">
            <Tooltip 
              v-for="metric in ['euclidean', 'manhattan', 'chebyshev']" 
              :key="metric"
              :text="metric === 'euclidean' 
                ? 'Standard straight-line distance (Pythagoras). Good for most natural data.' 
                : metric === 'manhattan' 
                  ? 'Taxicab geometry (L1). Sum of absolute differences. Like driving on a grid city layout.' 
                  : 'Chessboard distance (L∞). The greatest difference along any single dimension (like a King in Chess).'
              "
              position="top"
            >
              <button 
                class="w-full py-1.5 px-2 rounded-lg text-xs font-medium capitalize transition-all duration-200"
                :class="distanceMetric === metric ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/60'"
                @click="$emit('update:distanceMetric', metric)"
              >
                {{ metric }}
              </button>
            </Tooltip>
          </div>
        </div>

        <Tooltip text="Democracy isn't always fair! With weighting, closer neighbors get more voting power (1/distance). A very close neighbor can outvote multiple distant ones." position="right">
          <label class="flex items-center gap-3 text-sm text-white/70 cursor-pointer group select-none">
            <div class="relative flex items-center">
              <input 
                type="checkbox" 
                :checked="distanceWeighting"
                @change="$emit('update:distanceWeighting', $event.target.checked)"
                class="peer sr-only"
              >
              <div class="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </div>
            <span class="group-hover:text-white transition-colors">Distance Weighting</span>
          </label>
        </Tooltip>
      </div>
    </div>

    <!-- LVQ Controls -->
    <div v-if="showLvq" class="flex flex-col gap-4">
      <div class="flex justify-between items-center">
        <label class="text-sm font-medium text-white/80">Total Prototypes</label>
        <span class="px-2 py-1 bg-white/10 rounded-md text-xs font-bold text-white font-mono">{{ prototypes.length }}</span>
      </div>

      <Tooltip text="Prototypes are the 'memory' of LVQ. More prototypes per class allow learning more complex shapes, but require more training to position correctly." position="right">
        <div class="flex justify-between items-center">
          <label for="proto-count" class="text-sm font-medium text-white/80">Per Class</label>
          <span class="px-2 py-1 bg-white/10 rounded-md text-xs font-bold text-white font-mono">{{ prototypesPerClass }}</span>
        </div>
        
        <div class="relative h-6 flex items-center">
          <input 
            id="proto-count"
            type="range" 
            min="1" 
            max="10" 
            step="1"
            :value="prototypesPerClass"
            @input="$emit('update:prototypesPerClass', Number($event.target.value))"
            class="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
          >
        </div>
      </Tooltip>

      <Tooltip text="Starting with random positions takes longer to learn. Initializing with real data points gives the algorithm a 'head start' towards the correct solution." position="right">
        <label class="flex items-center gap-3 text-sm text-white/70 cursor-pointer group select-none">
          <div class="relative flex items-center">
            <input 
              type="checkbox" 
              :checked="initFromSameClass"
              @change="$emit('update:initFromSameClass', $event.target.checked)"
              class="peer sr-only"
            >
            <div class="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </div>
          <span class="group-hover:text-white transition-colors">Init from data</span>
        </label>
      </Tooltip>
      
      <div class="grid grid-cols-2 gap-2">
        <Tooltip text="Scatters new prototypes on the canvas. Do this if the current training is stuck or if you changed the number of prototypes." position="right">
          <button 
            class="w-full py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-colors"
            @click="$emit('init-lvq')"
          >
            Initialize
          </button>
        </Tooltip>
        <Tooltip text="Runs one learning step. Prototypes move TOWARDS data of their own class and AWAY from data of other classes." position="right">
          <button 
            class="w-full py-2 px-3 bg-primary/20 hover:bg-primary/30 border border-primary/40 rounded-xl text-sm font-medium text-primary-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            @click="$emit('train-lvq')" 
            :disabled="prototypes.length === 0"
          >
            Train Epoch
          </button>
        </Tooltip>
      </div>
    </div>

    <!-- Class Selection -->
    <div class="flex flex-col gap-3">
      <h3 class="text-xs font-medium text-white/50 uppercase tracking-wider">Select Class</h3>
      <Tooltip text="Select the category for the next points you add to the canvas. Try adding different classes in clusters to see how the algorithm separates them." position="right">
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
      </Tooltip>
    </div>

    <!-- Clear Button -->
    <div class="mt-auto pt-4 border-t border-white/10">
      <Tooltip text="Removes all points and prototypes. Use this to start a fresh experiment." position="right">
        <button 
          class="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-red-900/20"
          @click="$emit('clear')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Clear Canvas
        </button>
      </Tooltip>
    </div>
    </div>
  </ExperiencePanel>
</template>
