<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Controls from './Controls.vue'
import KnnCanvas from './KnnCanvas.vue'

const props = defineProps({
  isEmbedded: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

function goToCourse() {
    router.push('/learn/knn-lvq/intro')
}

function goToFullScreen() {
    router.push('/knn-lvq')
}

function goBack() {
    router.back()
}


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
          :is-embedded="isEmbedded"
          @clear="clearPoints"
          @init-lvq="initLvq"
          @train-lvq="trainLvq"
          @go-back="goBack"
          @start-course="goToCourse"
          @full-screen="goToFullScreen"
        />
      </div>
    </div>

  </div>
</template>
