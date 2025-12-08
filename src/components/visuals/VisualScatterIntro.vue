<script setup>
import { onMounted, ref } from 'vue'

const canvas = ref(null)

onMounted(() => {
  const ctx = canvas.value.getContext('2d')
  const w = canvas.value.width = canvas.value.offsetWidth
  const h = canvas.value.height = canvas.value.offsetHeight
  
  const points = []
  
  const animate = () => {
    // Add points slowly
    if (points.length < 50 && Math.random() > 0.9) {
        const x = Math.random() * w
        // Create a loose linear trend y = x + noise
        const trendY = h - (x/w) * h * 0.8 - h * 0.1
        const y = trendY + (Math.random() - 0.5) * 100
        points.push({x, y, scale: 0})
    }
    
    ctx.clearRect(0, 0, w, h)
    
    // Draw Axis
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(30, h-30)
    ctx.lineTo(w-30, h-30)
    ctx.moveTo(30, h-30)
    ctx.lineTo(30, 30)
    ctx.stroke()
    
    // Draw Points with "pop in" animation
    points.forEach(p => {
        if (p.scale < 1) p.scale += 0.05
        
        ctx.fillStyle = '#60a5fa' // Blue
        ctx.beginPath()
        ctx.arc(p.x, p.y, 6 * p.scale, 0, Math.PI*2)
        ctx.fill()
    })
    
    // Decoration: Question marks floating?
    
    requestAnimationFrame(animate)
  }
  
  animate()
})
</script>

<template>
  <canvas ref="canvas" class="w-full h-full"></canvas>
</template>
