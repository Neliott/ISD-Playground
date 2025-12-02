<script setup>
import { ref, computed } from 'vue'
import LinearRegressionCanvas from './LinearRegressionCanvas.vue'
import ExperiencePanel from '../../components/ExperiencePanel.vue'
import BackToMenu from '../../components/BackToMenu.vue'
import Tooltip from '../../components/Tooltip.vue'

const points = ref([])
const selectedModel = ref('linear') // 'linear', 'logarithmic', 'exponential', 'power', 'quadratic', 'cubic'

const modelDescriptions = {
  linear: 'Finds the best-fitting straight line: y = mx + b',
  logarithmic: 'Best for data that rises quickly then levels off: y = a + b ln(x)',
  exponential: 'Best for data that rises or falls at increasing rates: y = a * e^(bx)',
  power: 'Best for data that changes at a specific rate: y = a * x^b',
  quadratic: 'Parabolic curve, good for data with one peak or valley: y = ax² + bx + c',
  cubic: 'S-shaped curve, good for data with two turning points: y = ax³ + bx² + cx + d'
}

function addPoint(point) {
  points.value.push(point)
}

function clearPoints() {
  points.value = []
}

// Gaussian elimination solver
function solveLinearSystem(A, B) {
  const n = A.length
  // Deep copy to avoid modifying original
  const M = A.map((row, i) => [...row, B[i]])

  for (let i = 0; i < n; i++) {
    // Pivot
    let maxEl = Math.abs(M[i][i])
    let maxRow = i
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > maxEl) {
        maxEl = Math.abs(M[k][i])
        maxRow = k
      }
    }

    // Swap
    [M[maxRow], M[i]] = [M[i], M[maxRow]]

    // Eliminate
    for (let k = i + 1; k < n; k++) {
      const c = -M[k][i] / M[i][i]
      for (let j = i; j < n + 1; j++) {
        if (i === j) M[k][j] = 0
        else M[k][j] += c * M[i][j]
      }
    }
  }

  // Back substitution
  const x = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    x[i] = M[i][n] / M[i][i]
    for (let k = i - 1; k >= 0; k--) {
      M[k][n] -= M[k][i] * x[i]
    }
  }
  return x
}

const regressionModel = computed(() => {
  const n = points.value.length
  if (n < 2) return null

  if (selectedModel.value === 'logarithmic') {
    // Logarithmic Regression: y = a + b * ln(x)
    // Linear regression on (ln(x), y)
    let sumX = 0 // sum of ln(x)
    let sumY = 0
    let sumXY = 0 // sum of ln(x) * y
    let sumXX = 0 // sum of (ln(x))^2
    let validPoints = 0

    for (const p of points.value) {
      if (p.x <= 0) continue
      const lx = Math.log(p.x)
      sumX += lx
      sumY += p.y
      sumXY += lx * p.y
      sumXX += lx * lx
      validPoints++
    }

    if (validPoints < 2) return null

    const denominator = validPoints * sumXX - sumX * sumX
    if (Math.abs(denominator) < 1e-9) return null

    const b = (validPoints * sumXY - sumX * sumY) / denominator
    const a = (sumY - b * sumX) / validPoints

    return { type: 'logarithmic', a, b }
  } else if (selectedModel.value === 'exponential') {
    // Exponential Regression: y = a * e^(bx)
    // Linear regression on (x, ln(y)) -> ln(y) = ln(a) + bx
    let sumX = 0
    let sumY = 0 // sum of ln(y)
    let sumXY = 0 // sum of x * ln(y)
    let sumXX = 0 // sum of x^2
    let validPoints = 0

    for (const p of points.value) {
      if (p.y <= 0) continue
      const ly = Math.log(p.y)
      sumX += p.x
      sumY += ly
      sumXY += p.x * ly
      sumXX += p.x * p.x
      validPoints++
    }

    if (validPoints < 2) return null

    const denominator = validPoints * sumXX - sumX * sumX
    if (Math.abs(denominator) < 1e-9) return null

    const b = (validPoints * sumXY - sumX * sumY) / denominator
    const A = (sumY - b * sumX) / validPoints
    const a = Math.exp(A)

    return { type: 'exponential', a, b }
  } else if (selectedModel.value === 'power') {
    // Power Regression: y = a * x^b
    // Linear regression on (ln(x), ln(y)) -> ln(y) = ln(a) + b * ln(x)
    let sumX = 0 // sum of ln(x)
    let sumY = 0 // sum of ln(y)
    let sumXY = 0 // sum of ln(x) * ln(y)
    let sumXX = 0 // sum of (ln(x))^2
    let validPoints = 0

    for (const p of points.value) {
      if (p.x <= 0 || p.y <= 0) continue
      const lx = Math.log(p.x)
      const ly = Math.log(p.y)
      sumX += lx
      sumY += ly
      sumXY += lx * ly
      sumXX += lx * lx
      validPoints++
    }

    if (validPoints < 2) return null

    const denominator = validPoints * sumXX - sumX * sumX
    if (Math.abs(denominator) < 1e-9) return null

    const b = (validPoints * sumXY - sumX * sumY) / denominator
    const A = (sumY - b * sumX) / validPoints
    const a = Math.exp(A)

    return { type: 'power', a, b }
  } else if (selectedModel.value === 'quadratic') {
    // Quadratic Regression: y = ax^2 + bx + c
    if (n < 3) return null
    
    let sX = 0, sX2 = 0, sX3 = 0, sX4 = 0
    let sY = 0, sXY = 0, sX2Y = 0

    for (const p of points.value) {
      const x2 = p.x * p.x
      sX += p.x
      sX2 += x2
      sX3 += x2 * p.x
      sX4 += x2 * x2
      sY += p.y
      sXY += p.x * p.y
      sX2Y += x2 * p.y
    }

    // Matrix equation:
    // [ n    sX   sX2 ] [ c ]   [ sY   ]
    // [ sX   sX2  sX3 ] [ b ] = [ sXY  ]
    // [ sX2  sX3  sX4 ] [ a ]   [ sX2Y ]

    const A = [
      [n, sX, sX2],
      [sX, sX2, sX3],
      [sX2, sX3, sX4]
    ]
    const B = [sY, sXY, sX2Y]

    try {
      const [c, b, a] = solveLinearSystem(A, B)
      if (isNaN(a) || isNaN(b) || isNaN(c)) return null
      return { type: 'quadratic', a, b, c }
    } catch (e) {
      return null
    }
  } else if (selectedModel.value === 'cubic') {
    // Cubic Regression: y = ax^3 + bx^2 + cx + d
    if (n < 4) return null

    let sX = 0, sX2 = 0, sX3 = 0, sX4 = 0, sX5 = 0, sX6 = 0
    let sY = 0, sXY = 0, sX2Y = 0, sX3Y = 0

    for (const p of points.value) {
      const x2 = p.x * p.x
      const x3 = x2 * p.x
      sX += p.x
      sX2 += x2
      sX3 += x3
      sX4 += x2 * x2
      sX5 += x2 * x3
      sX6 += x3 * x3
      sY += p.y
      sXY += p.x * p.y
      sX2Y += x2 * p.y
      sX3Y += x3 * p.y
    }

    // Matrix equation:
    // [ n    sX   sX2  sX3 ] [ d ]   [ sY   ]
    // [ sX   sX2  sX3  sX4 ] [ c ]   [ sXY  ]
    // [ sX2  sX3  sX4  sX5 ] [ b ] = [ sX2Y ]
    // [ sX3  sX4  sX5  sX6 ] [ a ]   [ sX3Y ]

    const A = [
      [n, sX, sX2, sX3],
      [sX, sX2, sX3, sX4],
      [sX2, sX3, sX4, sX5],
      [sX3, sX4, sX5, sX6]
    ]
    const B = [sY, sXY, sX2Y, sX3Y]

    try {
      const [d, c, b, a] = solveLinearSystem(A, B)
      if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d)) return null
      return { type: 'cubic', a, b, c, d }
    } catch (e) {
      return null
    }
  } else {
    // Linear Regression: y = mx + b
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
    if (denominator === 0) return null

    const m = (n * sumXY - sumX * sumY) / denominator
    const b = (sumY - m * sumX) / n

    return { type: 'linear', m, b }
  }
})
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden bg-background">
    <LinearRegressionCanvas 
      :points="points" 
      :model="regressionModel"
      @add-point="addPoint"
    />
    
    <div class="absolute top-4 left-4 w-80">
      <ExperiencePanel title="Regression">
        <template #header>
          <BackToMenu />
        </template>
        
        <div class="mb-4 text-sm text-text-muted">
          Click anywhere to add points.
        </div>
        
        <div v-if="regressionModel" class="mb-4 font-mono bg-black/30 p-2 rounded text-green-400 border border-white/5">
          <template v-if="regressionModel.type === 'linear'">
            y = {{ regressionModel.m.toFixed(3) }}x + {{ regressionModel.b.toFixed(1) }}
          </template>
          <template v-else-if="regressionModel.type === 'logarithmic'">
            y = {{ regressionModel.a.toFixed(1) }} + {{ regressionModel.b.toFixed(1) }} ln(x)
          </template>
          <template v-else-if="regressionModel.type === 'exponential'">
            y = {{ regressionModel.a.toFixed(3) }} e^({{ regressionModel.b.toFixed(3) }}x)
          </template>
          <template v-else-if="regressionModel.type === 'power'">
            y = {{ regressionModel.a.toFixed(3) }} x^({{ regressionModel.b.toFixed(3) }})
          </template>
          <template v-else-if="regressionModel.type === 'quadratic'">
            y = {{ regressionModel.a.toExponential(2) }}x² + {{ regressionModel.b.toExponential(2) }}x + {{ regressionModel.c.toFixed(1) }}
          </template>
          <template v-else-if="regressionModel.type === 'cubic'">
            y = {{ regressionModel.a.toExponential(2) }}x³ + {{ regressionModel.b.toExponential(2) }}x² + {{ regressionModel.c.toExponential(2) }}x + {{ regressionModel.d.toFixed(1) }}
          </template>
        </div>
        <div v-else class="mb-4 text-sm text-text-muted italic">
          Add at least {{ selectedModel === 'cubic' ? 4 : selectedModel === 'quadratic' ? 3 : 2 }} points
        </div>

        <div class="flex flex-col gap-2">
          <div class="grid grid-cols-2 gap-2 mb-2">
            <Tooltip 
              v-for="model in ['linear', 'logarithmic', 'exponential', 'power', 'quadratic', 'cubic']" 
              :key="model"
              :text="modelDescriptions[model]"
              position="top"
            >
              <button 
                @click="selectedModel = model"
                class="w-full px-2 py-1 text-xs rounded border transition capitalize"
                :class="selectedModel === model ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-text-muted hover:bg-white/10'"
              >
                {{ model }}
              </button>
            </Tooltip>
          </div>

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
