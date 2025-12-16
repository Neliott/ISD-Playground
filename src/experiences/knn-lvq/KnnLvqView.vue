<script setup>
import { ref } from 'vue'
import Controls from './Controls.vue'
import KnnCanvas from './KnnCanvas.vue'
import ExplanationOverlay from '../../components/ExplanationOverlay.vue'
import VisualKnnVoting from '../../components/visuals/VisualKnnVoting.vue'
import VisualLvqUpdate from '../../components/visuals/VisualLvqUpdate.vue'
import VisualDistanceMetrics from '../../components/visuals/VisualDistanceMetrics.vue'
import VisualKEffect from '../../components/visuals/VisualKEffect.vue'

const k = ref(3)
const selectedClass = ref(1)
const points = ref([])
const prototypes = ref([])
const showLvq = ref(false)
const resolveTies = ref(true)

const prototypesPerClass = ref(3)
const lvqInitMode = ref('random')
const distanceMetric = ref('euclidean')
const distanceWeighting = ref(false)

// LVQ Parameters
const lvqLearningRate = ref(0.05)
const lvqEpochs = ref(1)
const lvqK = ref(1)

const showExplanation = ref(false)

const explanationSlides = [
  {
    title: 'Lazy Learning (k-NN)',
    content: `
      <p class="text-xl text-white mb-6">Tell me who your neighbors are, and I'll tell you who you are.</p>
      <p class="mb-4">k-Nearest Neighbors (k-NN) is a simple but powerful algorithm.</p>
      <p class="mb-4">It doesn't "learn" a model. Instead, it memorizes all training data effectively postponing the decision until you ask for a prediction (Lazy Learning).</p>
    `
  },
  {
    title: 'Voting Mechanism',
    content: `
      <p class="mb-4">When a new point appears (the question mark), we find the <strong>k</strong> closest known points.</p>
      <p class="mb-4">These neighbors vote on the class of the new point. Majority wins.</p>
      <p class="text-sm text-text-muted">In the visual, watch the circle expand to find its 3 closest friends.</p>
    `,
    component: VisualKnnVoting
  },
  {
    title: 'How do we measure "Close"?',
    content: `
      <p class="mb-4">Distance isn't always a straight line.</p>
      <ul class="list-disc pl-5 space-y-2 mb-4 text-sm text-text-muted">
        <li><strong>Euclidean (L2)</strong>: The standard straight line (crow flies). Best for physical setups.</li>
        <li><strong>Manhattan (L1)</strong>: Only horizontal/vertical moves (like a taxi in a grid city).</li>
      </ul>
      <p class="text-sm">Changing the metric changes which neighbors are "closest"!</p>
    `,
    component: VisualDistanceMetrics
  },
  {
    title: 'The "k" Hyperparameter',
    content: `
      <p class="mb-4">How many neighbors should we trust?</p>
      <ul class="list-disc pl-5 space-y-2 text-sm text-text-muted mb-4">
        <li><strong>Low k (e.g., 1)</strong>: Very detailed, jagged boundaries. Fits every noisy point. (High Variance)</li>
        <li><strong>High k</strong>: Smooth boundaries. Ignores small islands of data. (High Bias)</li>
      </ul>
    `,
    component: VisualKEffect
  },
  {
    title: 'Switching to LVQ',
    content: `
      <p class="mb-4">k-NN is slow if you have millions of points. You have to measure distance to ALL of them.</p>
      <p class="mb-4"><strong>Learning Vector Quantization (LVQ)</strong> solves this by using "Prototypes".</p>
      <p>We only keep a few points per class. These prototypes move to represent the data.</p>
    `
  },
  {
    title: 'LVQ Training Dynamics',
    content: `
      <p class="mb-4">Prototypes learn by moving based on feedback:</p>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="p-3 bg-green-500/10 border border-green-500/20 rounded">
          <strong class="text-green-400 block mb-1">Attraction</strong>
          If nearest prototype is CORRECT class -> Move Closer.
        </div>
        <div class="p-3 bg-red-500/10 border border-red-500/20 rounded">
          <strong class="text-red-400 block mb-1">Repulsion</strong>
          If nearest prototype is WRONG class -> Move Away.
        </div>
      </div>
    `,
    component: VisualLvqUpdate
  }
]

const classes = [
  { id: 1, name: 'Red', color: '#ff4444' },
  { id: 2, name: 'Blue', color: '#4444ff' },
  { id: 3, name: 'Green', color: '#44ff44' },
  { id: 4, name: 'Yellow', color: '#ffff44' },
  { id: 5, name: 'Purple', color: '#ff44ff' },
]

function addPoint({ x, y }) {
  points.value.push({
    x,
    y,
    classId: selectedClass.value,
    id: Date.now()
  })
}

function clearPoints() {
  points.value = []
  prototypes.value = []
}

function initLvq() {
  prototypes.value = []
  
  // Find bounds or use canvas size (approx 800x600)
  // Ideally we should base this on data distribution, but random is fine for MVP
  const width = window.innerWidth
  const height = window.innerHeight
  
  for (const cls of classes) {
    // Filter points for this class
    const classPoints = points.value.filter(p => p.classId === cls.id)
    
    // Calculate centroid if needed
    let centroid = { x: width / 2, y: height / 2 }
    if (lvqInitMode.value === 'class_center' && classPoints.length > 0) {
      const sumX = classPoints.reduce((sum, p) => sum + p.x, 0)
      const sumY = classPoints.reduce((sum, p) => sum + p.y, 0)
      centroid = { x: sumX / classPoints.length, y: sumY / classPoints.length }
    }

    for (let i = 0; i < prototypesPerClass.value; i++) {
      let x, y
      
      if (lvqInitMode.value === 'class_sample' && classPoints.length > 0) {
        // Pick random point from classPoints
        const randomPoint = classPoints[Math.floor(Math.random() * classPoints.length)]
        x = randomPoint.x
        y = randomPoint.y
        // Add small jitter
        x += (Math.random() - 0.5) * 10
        y += (Math.random() - 0.5) * 10
      } else if (lvqInitMode.value === 'class_center' && classPoints.length > 0) {
        // Start at centroid with jitter
        x = centroid.x + (Math.random() - 0.5) * 20
        y = centroid.y + (Math.random() - 0.5) * 20
      } else {
        // Random position (fallback for 'random' or empty classes)
        x = Math.random() * width
        y = Math.random() * height
      }

      prototypes.value.push({
        x,
        y,
        classId: cls.id,
        id: Date.now() + Math.random()
      })
    }
  }
}

function trainLvq() {
  if (points.value.length === 0 || prototypes.value.length === 0) return
  
  // Run for specified number of epochs
  for (let epoch = 0; epoch < lvqEpochs.value; epoch++) {
    // Iterate through all data points
    for (const point of points.value) {
      // Find all prototypes with their distances
      const protoDistances = prototypes.value.map((proto, index) => ({
        index,
        proto,
        dist: Math.sqrt((point.x - proto.x) ** 2 + (point.y - proto.y) ** 2)
      }))

      // Sort by distance
      protoDistances.sort((a, b) => a.dist - b.dist)

      // Update the K nearest prototypes
      // We limit by prototypes.length just in case lvqK > num prototypes
      const kToUpdate = Math.min(lvqK.value, protoDistances.length)

      for (let i = 0; i < kToUpdate; i++) {
        const { proto } = protoDistances[i]
        
        // Update position
        if (proto.classId === point.classId) {
          // Move closer
          proto.x += lvqLearningRate.value * (point.x - proto.x)
          proto.y += lvqLearningRate.value * (point.y - proto.y)
        } else {
          // Move away
          proto.x -= lvqLearningRate.value * (point.x - proto.x)
          proto.y -= lvqLearningRate.value * (point.y - proto.y)
        }
      }
    }
  }
  // Force reactivity update
  prototypes.value = [...prototypes.value]
}
</script>

<template>
  <div class="relative w-full h-full overflow-hidden bg-background">
    <div class="absolute inset-0 top-[40vh] md:top-0 z-0">
      <KnnCanvas
        :points="points"
        :prototypes="prototypes"
        :show-lvq="showLvq"
        :resolve-ties="resolveTies"
        :k="k"
        :classes="classes"
        :distance-metric="distanceMetric"
        :distance-weighting="distanceWeighting"
        @add-point="addPoint"
      />
    </div>
    
    <!-- Controls Container -->
    <div class="absolute top-0 left-0 w-full h-[40vh] md:h-auto md:w-80 md:top-4 md:left-4 md:bottom-4 z-20 pointer-events-none p-4 pb-0 md:p-0 flex flex-col">
      <div class="pointer-events-auto w-full h-full">
  <Controls
          v-model:k="k"
          v-model:selectedClass="selectedClass"
          v-model:showLvq="showLvq"
          v-model:resolveTies="resolveTies"
          v-model:prototypesPerClass="prototypesPerClass"
          v-model:lvqInitMode="lvqInitMode"
          v-model:distanceMetric="distanceMetric"
          v-model:distanceWeighting="distanceWeighting"
          
          v-model:learningRate="lvqLearningRate"
          v-model:trainEpochs="lvqEpochs"
          v-model:lvqK="lvqK"

          :prototypes="prototypes"
          :classes="classes"
          @clear="clearPoints"
          @init-lvq="initLvq"
          @train-lvq="trainLvq"
          @explain="showExplanation = true"
        />
      </div>
    </div>

    <!-- Explanation Overlay -->
    <ExplanationOverlay
      :is-visible="showExplanation"
      title="How it works"
      :slides="explanationSlides"
      @close="showExplanation = false"
    />
  </div>
</template>
