<script setup>
import { ref, computed } from 'vue'
import LinearRegressionCanvas from './LinearRegressionCanvas.vue'
import ExperiencePanel from '../../components/ExperiencePanel.vue'
import BackToMenu from '../../components/BackToMenu.vue'

const points = ref([])

function addPoint(point) {
  points.value.push(point)
}

function clearPoints() {
  points.value = []
}

const regressionLine = computed(() => {
  const n = points.value.length
  if (n < 2) return null

  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumXX = 0

  for (const p of points.value) {
    sumX += p.x
    sumY += p.y
    sumXY += p.x * p.y
    sumXX += p.x * p.x
  }

  const denominator = n * sumXX - sumX * sumX
  if (denominator === 0) return null // Vertical line or all points on same X

  const m = (n * sumXY - sumX * sumY) / denominator
  const b = (sumY - m * sumX) / n

  return { m, b }
})
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden bg-background">
    <LinearRegressionCanvas 
      :points="points" 
      :line="regressionLine"
      @add-point="addPoint"
    />
    
    <div class="absolute top-4 left-4 w-80">
      <ExperiencePanel title="Linear Regression">
        <template #header>
          <BackToMenu />
        </template>
        
        <div class="mb-4 text-sm text-text-muted">
          Click anywhere to add points.
        </div>
        
        <div v-if="regressionLine" class="mb-4 font-mono bg-black/30 p-2 rounded text-green-400 border border-white/5">
          y = {{ regressionLine.m.toFixed(3) }}x + {{ regressionLine.b.toFixed(1) }}
        </div>
        <div v-else class="mb-4 text-sm text-text-muted italic">
          Add at least 2 points
        </div>

        <div class="flex gap-2">
          <button 
            @click="clearPoints"
            class="px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg text-white transition text-sm font-medium w-full"
          >
            Clear Points
          </button>
        </div>
      </ExperiencePanel>
    </div>
  </div>
</template>
