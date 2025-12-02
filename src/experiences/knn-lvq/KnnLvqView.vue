<script setup>
import { ref } from 'vue'
import Controls from './Controls.vue'
import KnnCanvas from './KnnCanvas.vue'

const k = ref(3)
const selectedClass = ref(1)
const points = ref([])
const prototypes = ref([])
const showLvq = ref(false)
const resolveTies = ref(true)

const prototypesPerClass = ref(3)
const initFromSameClass = ref(false)
const distanceMetric = ref('euclidean')
const distanceWeighting = ref(false)

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
    // Filter points for this class if we are initializing from same class
    const classPoints = initFromSameClass.value 
      ? points.value.filter(p => p.classId === cls.id)
      : []

    for (let i = 0; i < prototypesPerClass.value; i++) {
      let x, y
      
      if (initFromSameClass.value && classPoints.length > 0) {
        // Pick random point from classPoints
        const randomPoint = classPoints[Math.floor(Math.random() * classPoints.length)]
        x = randomPoint.x
        y = randomPoint.y
        // Add small jitter to avoid perfect overlap
        x += (Math.random() - 0.5) * 5
        y += (Math.random() - 0.5) * 5
      } else {
        // Random position
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
  
  const learningRate = 0.05
  
  // One epoch: iterate through all data points
  for (const point of points.value) {
    // Find nearest prototype
    let minDist = Infinity
    let nearestProtoIndex = -1
    
    for (let i = 0; i < prototypes.value.length; i++) {
      const proto = prototypes.value[i]
      const dist = Math.sqrt((point.x - proto.x) ** 2 + (point.y - proto.y) ** 2)
      if (dist < minDist) {
        minDist = dist
        nearestProtoIndex = i
      }
    }
    
    if (nearestProtoIndex !== -1) {
      const proto = prototypes.value[nearestProtoIndex]
      
      // Update position
      if (proto.classId === point.classId) {
        // Move closer
        proto.x += learningRate * (point.x - proto.x)
        proto.y += learningRate * (point.y - proto.y)
      } else {
        // Move away
        proto.x -= learningRate * (point.x - proto.x)
        proto.y -= learningRate * (point.y - proto.y)
      }
    }
  }
  // Force reactivity update
  prototypes.value = [...prototypes.value]
}
</script>

<template>
  <div class="relative w-full h-full overflow-hidden bg-background">
    <div class="absolute inset-0 z-0">
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
    <div class="absolute top-4 left-4 bottom-4 w-80 z-10 flex flex-col pointer-events-none">
      <div class="pointer-events-auto h-full">
  <Controls
          v-model:k="k"
          v-model:selectedClass="selectedClass"
          v-model:showLvq="showLvq"
          v-model:resolveTies="resolveTies"
          v-model:prototypesPerClass="prototypesPerClass"
          v-model:initFromSameClass="initFromSameClass"
          v-model:distanceMetric="distanceMetric"
          v-model:distanceWeighting="distanceWeighting"
          :prototypes="prototypes"
          :classes="classes"
          @clear="clearPoints"
          @init-lvq="initLvq"
          @train-lvq="trainLvq"
        />
      </div>
    </div>
  </div>
</template>
