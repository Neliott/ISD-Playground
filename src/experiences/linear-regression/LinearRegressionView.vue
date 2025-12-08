<script setup>
import { ref, computed } from 'vue'
import LinearRegressionCanvas from './LinearRegressionCanvas.vue'
import ExperiencePanel from '../../components/ExperiencePanel.vue'
import BackToMenu from '../../components/BackToMenu.vue'
import ControlBox from '../../components/controls/ControlBox.vue'
import Select from '../../components/controls/Select.vue'
import Button from '../../components/controls/Button.vue'
import ExplanationOverlay from '../../components/ExplanationOverlay.vue'
import VisualResiduals from '../../components/visuals/VisualResiduals.vue'
import VisualGradientDescent from '../../components/visuals/VisualGradientDescent.vue'

const points = ref([])
const selectedModel = ref('linear') // 'linear', 'logarithmic', 'exponential', 'power', 'quadratic', 'cubic'

const showExplanation = ref(false)

const explanationSlides = [
  {
    title: 'Linear Regression',
    content: `
      <p class="mb-4">Linear Regression finds the relationship between variables.</p>
      <p>We want the straight line that best fits our data.</p>
    `
  },
  {
    title: 'Visualizing Error',
    content: `
      <p class="mb-4 text-sm">We calculate the distance from each point to the line.</p>
      <p class="text-sm">Squaring these distances (the red squares) makes all errors positive and punishes big outliers more.</p>
    `,
    component: VisualResiduals
  },
  {
    title: 'Iterative Learning',
    content: `
      <p class="mb-4 text-sm">Gradient Descent is like a ball rolling down a hill.</p>
      <p class="text-sm">The "hill" is the Error. The ball tries to find the lowest point (parameters m, b) to minimize error.</p>
    `,
    component: VisualGradientDescent
  }
]

const modelDescriptions = {
  linear: 'Finds the best-fitting straight line: y = mx + b',
  logarithmic: 'Best for data that rises quickly then levels off: y = a + b ln(x)',
  exponential: 'Best for data that rises or falls at increasing rates: y = a * e^(bx)',
  power: 'Best for data that changes at a specific rate: y = a * x^b',
  quadratic: 'Parabolic curve, good for data with one peak or valley: y = ax² + bx + c',
  cubic: 'S-shaped curve, good for data with two turning points: y = ax³ + bx² + cx + d'
}

const modelOptions = computed(() => [
  { label: 'linear', value: 'linear', tooltip: modelDescriptions.linear },
  { label: 'logarithmic', value: 'logarithmic', tooltip: modelDescriptions.logarithmic },
  { label: 'exponential', value: 'exponential', tooltip: modelDescriptions.exponential },
  { label: 'power', value: 'power', tooltip: modelDescriptions.power },
  { label: 'quadratic', value: 'quadratic', tooltip: modelDescriptions.quadratic },
  { label: 'cubic', value: 'cubic', tooltip: modelDescriptions.cubic }
])

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

function predict(x, model) {
  if (!model) return 0
  switch (model.type) {
    case 'linear': return model.m * x + model.b
    case 'logarithmic': return model.a + model.b * Math.log(x)
    case 'exponential': return model.a * Math.exp(model.b * x)
    case 'power': return model.a * Math.pow(x, model.b)
    case 'quadratic': return model.a * x * x + model.b * x + model.c
    case 'cubic': return model.a * Math.pow(x, 3) + model.b * Math.pow(x, 2) + model.c * x + model.d
    default: return 0
  }
}

const metrics = computed(() => {
  if (!regressionModel.value || points.value.length < 2) return null
  
  const n = points.value.length
  let sumY = 0
  for (const p of points.value) sumY += p.y
  const meanY = sumY / n

  let sse = 0
  let sst = 0
  let mae = 0

  for (const p of points.value) {
    const yPred = predict(p.x, regressionModel.value)
    const yActual = p.y
    
    const error = yActual - yPred
    sse += error * error
    sst += (yActual - meanY) * (yActual - meanY)
    mae += Math.abs(error)
  }

  const mse = sse / n
  const rmse = Math.sqrt(mse)
  const r2 = sst === 0 ? 1 : 1 - (sse / sst)

  return {
    mse,
    rmse,
    mae,
    r2
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
          <div class="flex items-center gap-2">
            <BackToMenu />
            <div class="flex-1"></div>
            <button 
              @click="showExplanation = true"
              class="text-xs text-text-muted hover:text-white underline transition-colors"
            >
              How it works?
            </button>
          </div>
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

        <div v-if="metrics" class="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div class="bg-white/5 p-2 rounded border border-white/5 flex flex-col">
            <span class="text-white/40 uppercase tracking-wider text-[10px]">MSE</span>
            <span class="font-mono text-white/90">{{ metrics.mse.toFixed(2) }}</span>
          </div>
          <div class="bg-white/5 p-2 rounded border border-white/5 flex flex-col">
            <span class="text-white/40 uppercase tracking-wider text-[10px]">RMSE</span>
            <span class="font-mono text-white/90">{{ metrics.rmse.toFixed(2) }}</span>
          </div>
          <div class="bg-white/5 p-2 rounded border border-white/5 flex flex-col">
            <span class="text-white/40 uppercase tracking-wider text-[10px]">MAE</span>
            <span class="font-mono text-white/90">{{ metrics.mae.toFixed(2) }}</span>
          </div>
          <div class="bg-white/5 p-2 rounded border border-white/5 flex flex-col">
            <span class="text-white/40 uppercase tracking-wider text-[10px]">R²</span>
            <span class="font-mono text-white/90">{{ metrics.r2.toFixed(4) }}</span>
          </div>
        </div>

        <div v-else class="mb-4 text-sm text-text-muted italic">
          Add at least {{ selectedModel === 'cubic' ? 4 : selectedModel === 'quadratic' ? 3 : 2 }} points
        </div>

        <div class="flex flex-col gap-4">
          <ControlBox label="Model Type">
            <Select 
              :model-value="selectedModel"
              @update:model-value="selectedModel = $event"
              :options="modelOptions"
              layout="grid"
            />
          </ControlBox>

          <Button 
            variant="danger"
            @click="clearPoints"
          >
            Clear Points
          </Button>
        </div>
      </ExperiencePanel>
    </div>

    <!-- Explanation Overlay -->
    <ExplanationOverlay
      :is-visible="showExplanation"
      title="Understanding Regression"
      :slides="explanationSlides"
      @close="showExplanation = false"
    />
  </div>
</template>
