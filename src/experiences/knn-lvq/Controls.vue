<script setup>
import ExperiencePanel from '../../components/ExperiencePanel.vue'
import BackToMenu from '../../components/BackToMenu.vue'
import Tooltip from '../../components/Tooltip.vue'
import ControlBox from '../../components/controls/ControlBox.vue'
import Toggle from '../../components/controls/Toggle.vue'
import Select from '../../components/controls/Select.vue'
import Slider from '../../components/controls/Slider.vue'
import Button from '../../components/controls/Button.vue'

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
  lvqInitMode: {
    type: String,
    default: 'random'
  },
  distanceMetric: {
    type: String,
    default: 'euclidean'
  },
  distanceWeighting: {
    type: Boolean,
    default: false
  },
  learningRate: {
    type: Number,
    default: 0.05
  },
  trainEpochs: {
    type: Number,
    default: 1
  },
  lvqK: {
    type: Number,
    default: 1
  }
})

defineEmits(['update:k', 'update:selectedClass', 'update:showLvq', 'update:resolveTies', 'update:prototypesPerClass', 'update:lvqInitMode', 'update:distanceMetric', 'update:distanceWeighting', 'update:learningRate', 'update:trainEpochs', 'update:lvqK', 'clear', 'init-lvq', 'train-lvq'])
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
    <ControlBox label="Mode">
      <Tooltip text="Choose your algorithm: k-NN remembers all data and votes based on neighbors (Lazy Learning). LVQ learns a few representative 'prototypes' to classify regions (Prototype-based Learning)." position="right">
        <Toggle 
          :model-value="showLvq" 
          @update:model-value="$emit('update:showLvq', $event)"
          :labels="['kNN', 'LVQ']"
        />
      </Tooltip>
    </ControlBox>

    <!-- kNN Controls -->
    <div v-if="!showLvq" class="flex flex-col gap-4">
      <ControlBox label="Neighbors (k)">
        <template #value>
          <span class="px-2 py-1 bg-white/10 rounded-md text-xs font-bold text-white font-mono">{{ k }}</span>
        </template>
        <Tooltip text="The 'k' in k-NN. It decides how many neighbors vote. Small k (e.g., 1) creates jagged boundaries sensitive to noise. Large k creates smoother boundaries but might miss local details." position="right">
          <Slider 
            :model-value="k"
            @update:model-value="$emit('update:k', $event)"
            :min="1"
            :max="20"
          />
        </Tooltip>
      </ControlBox>

      <ControlBox>
        <Tooltip text="What happens if 2 Red and 2 Blue neighbors vote? With this enabled, we break the tie by choosing the class of the single closest neighbor among them." position="right">
          <div class="flex items-center justify-between">
            <span class="text-sm text-white/70">Resolve ties</span>
            <Toggle 
              :model-value="resolveTies"
              @update:model-value="$emit('update:resolveTies', $event)"
              :labels="['Off', 'On']"
              class="w-24"
            />
          </div>
        </Tooltip>
      </ControlBox>

      <!-- Distance Controls -->
      <div class="flex flex-col gap-4 pt-4 border-t border-white/10">
        <ControlBox label="Distance Metric">
          <Select 
            :model-value="distanceMetric"
            @update:model-value="$emit('update:distanceMetric', $event)"
            :options="[
              { label: 'Euclidean', value: 'euclidean', tooltip: 'Standard straight-line distance (Pythagoras). Good for most natural data.' },
              { label: 'Manhattan', value: 'manhattan', tooltip: 'Taxicab geometry (L1). Sum of absolute differences. Like driving on a grid city layout.' },
              { label: 'Chebyshev', value: 'chebyshev', tooltip: 'Chessboard distance (L∞). The greatest difference along any single dimension (like a King in Chess).' }
            ]"
          />
        </ControlBox>

        <ControlBox>
          <Tooltip text="Democracy isn't always fair! With weighting, closer neighbors get more voting power (1/distance). A very close neighbor can outvote multiple distant ones." position="right">
            <div class="flex items-center justify-between">
              <span class="text-sm text-white/70">Distance Weighting</span>
              <Toggle 
                :model-value="distanceWeighting"
                @update:model-value="$emit('update:distanceWeighting', $event)"
                :labels="['Off', 'On']"
                class="w-24"
              />
            </div>
          </Tooltip>
        </ControlBox>
      </div>
    </div>

    <!-- LVQ Controls -->
    <div v-if="showLvq" class="flex flex-col gap-4">
      <div class="flex justify-between items-center">
        <label class="text-sm font-medium text-white/80">Total Prototypes</label>
        <span class="px-2 py-1 bg-white/10 rounded-md text-xs font-bold text-white font-mono">{{ prototypes.length }}</span>
      </div>

      <ControlBox label="Per Class">
        <template #value>
          <span class="px-2 py-1 bg-white/10 rounded-md text-xs font-bold text-white font-mono">{{ prototypesPerClass }}</span>
        </template>
        <Tooltip text="Prototypes are the 'memory' of LVQ. More prototypes per class allow learning more complex shapes, but require more training to position correctly." position="right">
          <Slider 
            :model-value="prototypesPerClass"
            @update:model-value="$emit('update:prototypesPerClass', $event)"
            :min="1"
            :max="10"
          />
        </Tooltip>
      </ControlBox>

        <ControlBox label="Init Strategy">
          <Tooltip text="Starting with random positions takes longer to learn. Initializing with real data points gives the algorithm a 'head start' towards the correct solution." position="right">
          <Select 
            :model-value="lvqInitMode"
            @update:model-value="$emit('update:lvqInitMode', $event)"
            :options="[
              { label: 'Random', value: 'random', tooltip: 'Random positions across the entire canvas.' },
              { label: 'From Class Sample', value: 'class_sample', tooltip: 'Pick random existing points from the class to start.' },
              { label: 'Class Center', value: 'class_center', tooltip: 'Start at the average position (center of gravity) of the class points.' }
            ]"
          />
          </Tooltip>
        </ControlBox>

      <!-- Advanced LVQ Settings -->
       <div class="flex flex-col gap-4 pt-4 border-t border-white/10">
        <ControlBox label="Learning Rate">
          <template #value>
            <span class="px-2 py-1 bg-white/10 rounded-md text-xs font-bold text-white font-mono">{{ learningRate }}</span>
          </template>
          <Tooltip text="How fast prototypes move. High = fast but unstable. Low = precise but slow." position="right">
            <Slider 
              :model-value="learningRate"
              @update:model-value="$emit('update:learningRate', $event)"
              :min="0.01"
              :max="0.5"
              :step="0.01"
            />
          </Tooltip>
        </ControlBox>

        <ControlBox label="Epochs per Click">
           <template #value>
            <span class="px-2 py-1 bg-white/10 rounded-md text-xs font-bold text-white font-mono">{{ trainEpochs }}</span>
          </template>
          <Tooltip text="Number of training rounds per button click. Increase this to speed up training." position="right">
            <Slider 
              :model-value="trainEpochs"
              @update:model-value="$emit('update:trainEpochs', $event)"
              :min="1"
              :max="50"
            />
          </Tooltip>
        </ControlBox>

        <ControlBox label="Update Count (k)">
           <template #value>
            <span class="px-2 py-1 bg-white/10 rounded-md text-xs font-bold text-white font-mono">{{ lvqK }}</span>
          </template>
          <Tooltip text="How many closest prototypes to update for each data point" position="right">
            <Slider 
              :model-value="lvqK"
              @update:model-value="$emit('update:lvqK', $event)"
              :min="1"
              :max="5"
            />
          </Tooltip>
        </ControlBox>
      </div>
      
      <div class="grid grid-cols-2 gap-2">
        <Tooltip text="Scatters new prototypes on the canvas. Do this if the current training is stuck or if you changed the number of prototypes." position="right">
          <Button variant="secondary" @click="$emit('init-lvq')">
            Initialize
          </Button>
        </Tooltip>
        <Tooltip text="Runs one learning step. Prototypes move TOWARDS data of their own class and AWAY from data of other classes." position="right">
          <Button 
            variant="primary"
            @click="$emit('train-lvq')" 
            :disabled="prototypes.length === 0"
            class="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Train Epoch
          </Button>
        </Tooltip>
      </div>
    </div>

    <!-- Class Selection -->
    <ControlBox label="Select Class">
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
    </ControlBox>

    <!-- Clear Button -->
    <div class="mt-auto pt-4 border-t border-white/10">
      <Tooltip text="Removes all points and prototypes. Use this to start a fresh experiment." position="right">
        <Button variant="danger" @click="$emit('clear')" class="flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Clear Canvas
        </Button>
      </Tooltip>
    </div>
    </div>
  </ExperiencePanel>
</template>
