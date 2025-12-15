<script setup>
import { ref, computed, onUnmounted } from 'vue'
import LossSurface from './components/LossSurface.vue'
import DescentControls from './components/DescentControls.vue'

// ---------- Optimization Logic ----------

// The function we are optimizing: f(x, y) = x^2 + y^2 + sin(3x) + sin(3y)
// (A simple bowl with some ripples to create local minima)
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
  <div class="min-h-screen bg-background text-white p-8 pt-24 font-sans">
    <div class="max-w-6xl mx-auto">
      <header class="mb-12">
        <h1 class="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-accent-300 to-white">
          Gradient Descent Playground
        </h1>
        <p class="text-lg text-white/60 max-w-2xl">
          Visualize how optimization algorithms "walk down the hill" to find the minimum of a valid function (Low Loss).
          Adjust the <strong>Learning Rate</strong> to see how step size affects convergence!
        </p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Controls -->
        <div class="col-span-1 bg-surface/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm h-fit">
          <h2 class="text-xl font-bold mb-6 flex items-center gap-3">
            <span class="bg-accent/20 p-2 rounded-lg text-accent-300">1</span>
            Parameters
          </h2>
          <DescentControls 
            v-model:learningRate="learningRate"
            :isRunning="isRunning"
            @start="start"
            @stop="stop"
            @reset="reset"
            @step="step"
          />
          
          <div class="mt-8 pt-8 border-t border-white/10 text-sm text-white/60">
             <h3 class="font-bold text-white mb-2">Current State</h3>
             <div class="flex justify-between mb-1">
               <span>Iteration:</span>
               <span class="font-mono text-accent-100">{{ path.length - 1 }}</span>
             </div>
             <div class="flex justify-between mb-1">
               <span>Position:</span>
               <span class="font-mono text-accent-100">({{ path[path.length-1]?.x.toFixed(2) }}, {{ path[path.length-1]?.y.toFixed(2) }})</span>
             </div>
          </div>
        </div>

        <!-- Visualization -->
        <div class="col-span-1 lg:col-span-2 bg-black/40 border border-white/10 rounded-3xl p-4 relative overflow-hidden flex flex-col items-center justify-center">
          <h2 class="absolute top-6 left-8 text-xl font-bold flex items-center gap-3 z-10 pointer-events-none">
            <span class="bg-primary/20 p-2 rounded-lg text-primary-300">2</span>
            Loss Surface
          </h2>
          
          <LossSurface 
            :path="path" 
            :f="f"
            @set-start="setStartPoint"
          />
          
          <div class="absolute bottom-6 right-8 text-xs text-white/40 pointer-events-none italic">
            Click on map to change starting point
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
