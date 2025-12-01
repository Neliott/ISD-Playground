<script setup>
import { ref } from 'vue'
import Controls from './components/Controls.vue'
import KnnCanvas from './components/KnnCanvas.vue'

const k = ref(3)
const selectedClass = ref(1)
const points = ref([])
const prototypes = ref([])
const showLvq = ref(false)

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
  <div class="app-container">
    <div class="main">
      <KnnCanvas
        :points="points"
        :prototypes="prototypes"
        :show-lvq="showLvq"
        :k="k"
        :classes="classes"
        @add-point="addPoint"
      />
    </div>
    
    <div class="sidebar-overlay">
      <Controls
        v-model:k="k"
        v-model:selectedClass="selectedClass"
        v-model:showLvq="showLvq"
        :prototypes="prototypes"
        :classes="classes"
        @clear="clearPoints"
        @init-lvq="initLvq"
        @train-lvq="trainLvq"
      />
    </div>

    <div class="info-overlay">
      <h1>kNN Visualization</h1>
      <p>Double-click to add points</p>
    </div>
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  background-color: #000;
  color: white;
}

#app {
  width: 100%;
  height: 100%;
}
</style>

<style scoped>
.app-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.main {
  width: 100%;
  height: 100%;
}

.sidebar-overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  bottom: 20px;
  width: 300px;
  z-index: 10;
}

.info-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  text-align: right;
  pointer-events: none;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.info-overlay h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.info-overlay p {
  margin: 5px 0 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}
</style>
