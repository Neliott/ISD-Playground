<script setup>
import { ref, onMounted, watch, computed } from 'vue'

const props = defineProps({
  points: {
    type: Array,
    required: true
  },
  k: {
    type: Number,
    required: true
  },
  classes: {
    type: Array,
    required: true
  },
  showLvq: {
    type: Boolean,
    default: false
  },
  prototypes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['add-point'])

const canvasRef = ref(null)
const containerRef = ref(null)
const width = ref(800)
const height = ref(600)

// Resize observer to handle window resizing
onMounted(() => {
  if (containerRef.value) {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        width.value = entry.contentRect.width
        height.value = entry.contentRect.height
        requestAnimationFrame(draw)
      }
    })
    resizeObserver.observe(containerRef.value)
  }
  draw()
})

watch(() => [props.points, props.k, width.value, height.value, props.showLvq, props.prototypes], () => {
  requestAnimationFrame(draw)
}, { deep: true })

function handleDoubleClick(event) {
  const rect = canvasRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  emit('add-point', { x, y })
}

function getDistance(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

function getMajorityClass(x, y) {
  const dataPoints = props.showLvq ? props.prototypes : props.points
  const kValue = props.showLvq ? 1 : props.k
  
  if (dataPoints.length === 0) return null

  // Calculate distances to all points
  const distances = dataPoints.map(p => ({
    point: p,
    dist: getDistance({ x, y }, p)
  }))

  // Sort by distance
  distances.sort((a, b) => a.dist - b.dist)

  // Take top k
  const neighbors = distances.slice(0, kValue)

  // Count classes
  const counts = {}
  for (const n of neighbors) {
    const clsId = n.point.classId
    counts[clsId] = (counts[clsId] || 0) + 1
  }

  // Find winner
  let maxCount = -1
  let winnerId = null
  let isTie = false

  for (const clsId in counts) {
    if (counts[clsId] > maxCount) {
      maxCount = counts[clsId]
      winnerId = Number(clsId)
      isTie = false
    } else if (counts[clsId] === maxCount) {
      isTie = true
    }
  }

  return isTie ? null : winnerId
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  
  // Clear canvas
  ctx.fillStyle = '#121212'
  ctx.fillRect(0, 0, width.value, height.value)

  const hasData = props.showLvq ? props.prototypes.length > 0 : props.points.length > 0

  if (hasData) {
    // Naive pixel rendering
    // Optimization: Render at lower resolution and scale up?
    // For now, let's try 1/4 resolution for performance
    const scale = 4
    const w = Math.ceil(width.value / scale)
    const h = Math.ceil(height.value / scale)
    
    const imageData = ctx.createImageData(w, h)
    const data = imageData.data

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const realX = x * scale
        const realY = y * scale
        
        const classId = getMajorityClass(realX, realY)
        
        if (classId !== null) {
          const cls = props.classes.find(c => c.id === classId)
          if (cls) {
            const index = (y * w + x) * 4
            // Parse hex color to RGB
            const r = parseInt(cls.color.slice(1, 3), 16)
            const g = parseInt(cls.color.slice(3, 5), 16)
            const b = parseInt(cls.color.slice(5, 7), 16)
            
            data[index] = r
            data[index + 1] = g
            data[index + 2] = b
            data[index + 3] = 100 // Alpha for background
          }
        }
      }
    }
    
    // Draw the background
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = w
    tempCanvas.height = h
    tempCanvas.getContext('2d').putImageData(imageData, 0, 0)
    
    ctx.imageSmoothingEnabled = false // Keep it pixelated or true for blur
    ctx.drawImage(tempCanvas, 0, 0, width.value, height.value)
  }

  // Draw points
  for (const p of props.points) {
    const cls = props.classes.find(c => c.id === p.classId)
    if (cls) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
      ctx.fillStyle = cls.color
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }

  // Draw prototypes
  if (props.showLvq) {
    for (const p of props.prototypes) {
      const cls = props.classes.find(c => c.id === p.classId)
      if (cls) {
        ctx.beginPath()
        // Draw diamond shape
        ctx.moveTo(p.x, p.y - 10)
        ctx.lineTo(p.x + 10, p.y)
        ctx.lineTo(p.x, p.y + 10)
        ctx.lineTo(p.x - 10, p.y)
        ctx.closePath()
        
        ctx.fillStyle = cls.color
        ctx.fill()
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 3
        ctx.stroke()
        
        // Inner black stroke for contrast
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
  }
}
</script>

<template>
  <div ref="containerRef" class="canvas-container">
    <canvas 
      ref="canvasRef"
      :width="width"
      :height="height"
      @dblclick="handleDoubleClick"
    ></canvas>
    <div v-if="points.length === 0" class="hint">
      Double-click to add points
    </div>
  </div>
</template>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #000;
}

canvas {
  display: block;
  cursor: crosshair;
}

.hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
  font-size: 1.2rem;
}
</style>
