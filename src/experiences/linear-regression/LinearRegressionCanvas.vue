<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'

const props = defineProps({
  points: {
    type: Array,
    required: true
  },
  model: {
    type: Object, // { type: 'linear'|'logarithmic', ...params } or null
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

  // Draw regression model
  if (props.model) {
    ctx.strokeStyle = '#ff4444'
    ctx.lineWidth = 3
    ctx.beginPath()

    if (props.model.type === 'linear') {
      const { m, b } = props.model
      // y = mx + b
      ctx.moveTo(0, b)
      ctx.lineTo(width, m * width + b)
    } else if (props.model.type === 'logarithmic') {
      const { a, b } = props.model
      // y = a + b * ln(x)
      // We start from x=1 because ln(0) is undefined/-Infinity
      for (let x = 1; x <= width; x += 2) {
        const y = a + b * Math.log(x)
        if (x === 1) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
    } else if (props.model.type === 'exponential') {
      const { a, b } = props.model
      // y = a * e^(bx)
      for (let x = 0; x <= width; x += 2) {
        const y = a * Math.exp(b * x)
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
    } else if (props.model.type === 'power') {
      const { a, b } = props.model
      // y = a * x^b
      // Start from x=1 to avoid 0^negative issues if b < 0
      for (let x = 1; x <= width; x += 2) {
        const y = a * Math.pow(x, b)
        if (x === 1) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
    } else if (props.model.type === 'quadratic') {
      const { a, b, c } = props.model
      // y = ax^2 + bx + c
      for (let x = 0; x <= width; x += 2) {
        const y = a * x * x + b * x + c
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
    } else if (props.model.type === 'cubic') {
      const { a, b, c, d } = props.model
      // y = ax^3 + bx^2 + cx + d
      for (let x = 0; x <= width; x += 2) {
        const y = a * x * x * x + b * x * x + c * x + d
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
    }
    
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
watch(() => props.model, draw, { deep: true })

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
