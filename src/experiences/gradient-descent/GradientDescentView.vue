<script setup>
import { ref, computed, onUnmounted } from 'vue'
import LossSurface from './components/LossSurface.vue'
import DescentControls from './components/DescentControls.vue'
import ExperiencePanel from '../../components/ExperiencePanel.vue'
import BackToMenu from '../../components/BackToMenu.vue'
import ExplanationOverlay from '../../components/ExplanationOverlay.vue' // Optional but good to have ready

// ---------- Optimization Logic ----------

// The function we are optimizing: f(x, y) = x^2 + y^2 + sin(3x) + sin(3y)
function f(x, y) {
  return (x * x + y * y) * 0.5 - 0.2 * Math.cos(3 * x) - 0.2 * Math.cos(3 * y)
}

// Partial derivatives (Gradient)
function grad(x, y) {
  const df_dx = x + 0.6 * Math.sin(3 * x)
  const df_dy = y + 0.6 * Math.sin(3 * y)
  return { x: df_dx, y: df_dy }
}

const path = ref([])
const isRunning = ref(false)
const timer = ref(null)
const learningRate = ref(0.1)
const startPoint = ref({ x: 2, y: 1.5 })

// Reset the simulation
function reset() {
  stop()
  path.value = [{ ...startPoint.value }]
}

function start() {
  if (path.value.length === 0) reset()
  isRunning.value = true
  
  timer.value = setInterval(() => {
    step()
  }, 100)
}

function stop() {
  isRunning.value = false
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

function step() {
  const current = path.value[path.value.length - 1]
  const g = grad(current.x, current.y)
  
  // Update rule: x_new = x - lr * grad
  const next = {
    x: current.x - learningRate.value * g.x,
    y: current.y - learningRate.value * g.y
  }
  
  path.value.push(next)
  
  // Stop if converged or divergent
  if (path.value.length > 200 || Math.abs(next.x) > 5 || Math.abs(next.y) > 5) {
    stop()
  }
}

function setStartPoint(point) {
  startPoint.value = point
  reset()
}

onUnmounted(() => {
  stop()
})

// Initialize
reset()

</script>

<template>
  <div class="relative w-full h-screen overflow-hidden bg-black">
    
    <!-- Full Screen Visualization -->
    <div class="absolute inset-0 top-[35vh] md:top-0">
        <LossSurface 
            :path="path" 
            :f="f"
            @set-start="setStartPoint"
        />
    </div>

    <!-- Floating Panel -->
    <div class="absolute top-0 left-0 w-full h-[35vh] md:h-auto md:w-80 md:top-4 md:left-4 z-20 pointer-events-none p-4 pb-0 md:p-0 flex flex-col">
      <div class="pointer-events-auto w-full h-full md:h-auto overflow-y-auto">
        <ExperiencePanel title="Gradient Descent" class="h-full md:h-auto">
        <template #header>
           <div class="flex items-center gap-2">
            <BackToMenu />
            <div class="flex-1"></div>
          </div>
        </template>

        <div class="mb-6 text-sm text-text-muted">
           Visualize how optimization algorithms "walk down the hill" to minimize loss.
        </div>

        <DescentControls 
            v-model:learningRate="learningRate"
            :isRunning="isRunning"
            @start="start"
            @stop="stop"
            @reset="reset"
            @step="step"
          />
          
          <div class="mt-6 pt-6 border-t border-white/10 text-xs text-white/60 font-mono">
             <div class="flex justify-between mb-1">
               <span>Iteration:</span>
               <span class="text-accent-100">{{ path.length - 1 }}</span>
             </div>
             <div class="flex justify-between mb-1">
               <span>Position:</span>
               <span class="text-accent-100">({{ path[path.length-1]?.x.toFixed(2) }}, {{ path[path.length-1]?.y.toFixed(2) }})</span>
             </div>
             <div class="flex justify-between">
                <span>Loss:</span>
                <span class="text-accent-100">{{ f(path[path.length-1]?.x, path[path.length-1]?.y).toFixed(4) }}</span>
             </div>
          </div>
          
          <div class="mt-4 text-[10px] text-white/30 italic text-center">
            Click anywhere on the map to set a new starting point.
          </div>

        </ExperiencePanel>
      </div>
    </div>

  </div>
</template>
