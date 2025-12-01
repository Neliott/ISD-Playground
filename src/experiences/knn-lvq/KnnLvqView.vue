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
  // Create 3 prototypes per class
  const prototypesPerClass = 3
  
  // Find bounds or use canvas size (approx 800x600)
  // Ideally we should base this on data distribution, but random is fine for MVP
  const width = window.innerWidth
  const height = window.innerHeight
  
  for (const cls of classes) {
    for (let i = 0; i < prototypesPerClass; i++) {
      prototypes.value.push({
        x: Math.random() * width,
        y: Math.random() * height,
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
          :prototypes="prototypes"
          :classes="classes"
          @clear="clearPoints"
          @init-lvq="initLvq"
          @train-lvq="trainLvq"
        />
      </div>
    </div>

    <!-- Info Overlay -->
    <div class="absolute top-6 right-6 z-20 text-right pointer-events-none select-none">
      <h1 class="text-2xl font-bold text-white/90 tracking-tight">kNN Visualization</h1>
      <p class="mt-1 text-sm text-white/60 font-light">Double-click to add points</p>
      <router-link 
        to="/" 
        class="inline-block mt-3 text-sm text-white/70 hover:text-white transition-colors pointer-events-auto"
      >
        ← Back to Home
      </router-link>
    </div>
  </div>
</template>
