<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'

const props = defineProps({
  points: {
    type: Array,
    required: true
  },
  line: {
    type: Object, // { m: number, b: number } or null
    default: null
  }
})

const emit = defineEmits(['add-point'])

const canvasRef = ref(null)

function resize() {
  if (!canvasRef.value) return
  canvasRef.value.width = window.innerWidth
  canvasRef.value.height = window.innerHeight
  draw()
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  ctx.clearRect(0, 0, width, height)

  // Draw grid (optional)
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 1
  const gridSize = 50
  
  for(let x = 0; x < width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  
  for(let y = 0; y < height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // Draw points
  ctx.fillStyle = '#4444ff'
  for (const p of props.points) {
    ctx.beginPath()
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // Draw line
  if (props.line) {
    const { m, b } = props.line
    // y = mx + b
    
    ctx.strokeStyle = '#ff4444'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, b)
    ctx.lineTo(width, m * width + b)
    ctx.stroke()
  }
}

function onClick(event) {
  const rect = canvasRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  emit('add-point', { x, y })
}

watch(() => props.points, draw, { deep: true })
watch(() => props.line, draw, { deep: true })

onMounted(() => {
  window.addEventListener('resize', resize)
  resize()
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <canvas 
    ref="canvasRef" 
    class="absolute inset-0 w-full h-full cursor-crosshair"
    @click="onClick"
  ></canvas>
</template>
