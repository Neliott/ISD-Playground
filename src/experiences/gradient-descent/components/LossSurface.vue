<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'

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
// We use a resize observer to handle full screen resizing
const width = ref(800)
const height = ref(600)
const range = 4 // -4 to 4

// Coordinate transforms
const toScreenX = (x) => (x / range + 0.5) * width.value
const toScreenY = (y) => (-y / range + 0.5) * height.value // Invert Y
const toMathX = (sx) => (sx / width.value - 0.5) * range
const toMathY = (sy) => -(sy / height.value - 0.5) * range // Invert Y

let ctx = null

function draw() {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')
  if (!ctx) return
  
  // Clear
  ctx.clearRect(0, 0, width.value, height.value)
  
  // 1. Draw Heatmap 
  // Optimization: For a large full screen canvas, evaluating f(x,y) per pixel is slow (HD = 2M pixels).
  // We should render at lower resolution and scale up, or use a shader (WebGL).
  // For now, let's render at partial resolution (e.g., 200x200) and scale up via CSS or drawImage.
  // Actually, let's just use a reasonable fixed resolution for the heatmap backing store.
  
  const mapWidth = 200
  const mapHeight = 200
  const imgData = ctx.createImageData(mapWidth, mapHeight)
  const data = imgData.data
  
  for (let py = 0; py < mapHeight; py++) {
    for (let px = 0; px < mapWidth; px++) {
      // Map pixel to math space directly
      const x = (px / mapWidth - 0.5) * range
      const y = -(py / mapHeight - 0.5) * range // Invert Y
      const val = props.f(x, y)
      
      const t = Math.max(0, Math.min(1, (val + 1) / 5))
      
      let r, g, b
      if (t < 0.5) {
         const localT = t * 2
         r = 0
         g = Math.floor(255 * localT)
         b = Math.floor(255 * (1 - localT))
      } else {
         const localT = (t - 0.5) * 2
         r = Math.floor(255 * localT)
         g = Math.floor(255 * (1 - localT))
         b = 0
      }
      
      if (Math.floor(val * 4) % 2 === 0) {
        r *= 0.9; g *= 0.9; b *= 0.9;
      }
      
      const index = (py * mapWidth + px) * 4
      data[index] = r
      data[index + 1] = g
      data[index + 2] = b
      data[index + 3] = 255
    }
  }
  
  // Create a temp canvas to hold the heatmap
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = mapWidth
  tempCanvas.height = mapHeight
  tempCanvas.getContext('2d').putImageData(imgData, 0, 0)
  
  // Draw scaled up to full screen
  ctx.imageSmoothingEnabled = true // Smooth it out
  ctx.drawImage(tempCanvas, 0, 0, width.value, height.value)
  
  // 2. Draw axes/grid just for reference
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1
  
  // X Axis
  ctx.beginPath()
  ctx.moveTo(0, height.value/2); ctx.lineTo(width.value, height.value/2)
  ctx.stroke()
  
  // Y Axis
  ctx.beginPath()
  ctx.moveTo(width.value/2, 0); ctx.lineTo(width.value/2, height.value)
  ctx.stroke()

  // 3. Draw Path
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
    ctx.fillStyle = '#44ff44' 
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

function resize() {
  if (canvasRef.value) {
    const parent = canvasRef.value.parentElement
    width.value = parent.clientWidth
    height.value = parent.clientHeight
    draw()
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
  window.addEventListener('resize', resize)
  resize() // Initial sizing
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
})

watch(() => props.path, () => {
  requestAnimationFrame(draw) 
}, { deep: true })

</script>

<template>
  <canvas 
    ref="canvasRef" 
    :width="width" 
    :height="height" 
    class="w-full h-full cursor-crosshair block"
    @click="handleClick"
  ></canvas>
</template>
