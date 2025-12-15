<script setup>
import { ref, onMounted, watch, computed } from 'vue'

const props = defineProps({
  path: {
    type: Array,
    required: true
  },
  f: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['set-start'])

const canvasRef = ref(null)
const width = 600
const height = 400

const range = 4 // -4 to 4

// Coordinate transforms
const toScreenX = (x) => (x / range + 0.5) * width
const toScreenY = (y) => (-y / range + 0.5) * height // Invert Y
const toMathX = (sx) => (sx / width - 0.5) * range
const toMathY = (sy) => -(sy / height - 0.5) * range // Invert Y

function draw() {
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return
  
  // 1. Draw Heatmap (Only once ideally, but we'll redraw for simplicity or cache)
  // For better perf, we could cache this in an offscreen canvas.
  const imgData = ctx.createImageData(width, height)
  const data = imgData.data
  
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const x = toMathX(px)
      const y = toMathY(py)
      const val = props.f(x, y)
      
      // Color map: Dark Blue (low) -> Green -> Yellow -> Red (high)
      // Normalize val roughly -1 to 5 for coloring
      const t = Math.max(0, Math.min(1, (val + 1) / 5))
      
      // Simple gradient logic
      let r, g, b
      if (t < 0.5) {
         // Blue to Green
         const localT = t * 2
         r = 0
         g = Math.floor(255 * localT)
         b = Math.floor(255 * (1 - localT))
      } else {
         // Green to Red
         const localT = (t - 0.5) * 2
         r = Math.floor(255 * localT)
         g = Math.floor(255 * (1 - localT))
         b = 0
      }
      
      // Add visual "contours" by darkening bands
      if (Math.floor(val * 4) % 2 === 0) {
        r *= 0.9; g *= 0.9; b *= 0.9;
      }
      
      const index = (py * width + px) * 4
      data[index] = r
      data[index + 1] = g
      data[index + 2] = b
      data[index + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)
  
  // 2. Draw Path
  if (props.path.length > 0) {
    ctx.beginPath()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    
    // Move to start
    const start = props.path[0]
    ctx.moveTo(toScreenX(start.x), toScreenY(start.y))
    
    for (let i = 1; i < props.path.length; i++) {
      const p = props.path[i]
      ctx.lineTo(toScreenX(p.x), toScreenY(p.y))
    }
    ctx.stroke()
    
    // Draw Start Point
    const pStart = props.path[0]
    ctx.beginPath()
    ctx.fillStyle = '#44ff44' // Green
    ctx.arc(toScreenX(pStart.x), toScreenY(pStart.y), 6, 0, Math.PI * 2)
    ctx.fill()
    
    // Draw Current Head
    const pEnd = props.path[props.path.length - 1]
    ctx.beginPath()
    ctx.fillStyle = 'white' 
    ctx.arc(toScreenX(pEnd.x), toScreenY(pEnd.y), 8, 0, Math.PI * 2)
    ctx.fill()
    // Ring
    ctx.beginPath()
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1
    ctx.arc(toScreenX(pEnd.x), toScreenY(pEnd.y), 8, 0, Math.PI * 2)
    ctx.stroke()
  }
}

function handleClick(event) {
  const rect = canvasRef.value.getBoundingClientRect()
  const sx = event.clientX - rect.left
  const sy = event.clientY - rect.top
  
  const x = toMathX(sx)
  const y = toMathY(sy)
  
  emit('set-start', { x, y })
}

onMounted(() => {
  draw()
})

watch(() => props.path, () => {
  requestAnimationFrame(draw) // Sync with animation frame
}, { deep: true })

</script>

<template>
  <canvas 
    ref="canvasRef" 
    :width="width" 
    :height="height" 
    class="w-full h-auto bg-black cursor-crosshair rounded-xl shadow-2xl"
    @click="handleClick"
  ></canvas>
</template>
