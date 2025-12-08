<script setup>
import { onMounted, ref } from 'vue'

const canvas = ref(null)

onMounted(() => {
  const ctx = canvas.value.getContext('2d')
  const w = canvas.value.width = canvas.value.offsetWidth
  const h = canvas.value.height = canvas.value.offsetHeight
  
  // Static data
  const points = [
    { x: w * 0.2, y: h * 0.6 },
    { x: w * 0.4, y: h * 0.5 },
    { x: w * 0.6, y: h * 0.3 },
    { x: w * 0.8, y: h * 0.2 },
  ]
  
  // Line: y = mx + b
  // Let's make it slightly off to show errors
  const lineStart = { x: 0, y: h * 0.7 }
  const lineEnd = { x: w, y: h * 0.1 }
  
  const getY = (x) => {
    const t = x / w
    return lineStart.y + t * (lineEnd.y - lineStart.y)
  }

  let frame = 0
  const animate = () => {
    frame++
    ctx.clearRect(0, 0, w, h)
    
    // Draw Axis (subtle)
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(w * 0.05, h * 0.95)
    ctx.lineTo(w * 0.95, h * 0.95) // X
    ctx.moveTo(w * 0.05, h * 0.95)
    ctx.lineTo(w * 0.05, h * 0.05) // Y
    ctx.stroke()
    
    // Draw Regression Line
    ctx.strokeStyle = '#4ade80' // Green-400
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(lineStart.x, lineStart.y)
    ctx.lineTo(lineEnd.x, lineEnd.y)
    ctx.stroke()
    
    // Draw Residuals and Squares
    points.forEach((p, i) => {
        const lineY = getY(p.x)
        const error = Math.abs(p.y - lineY)
        
        // Animated alpha for fade-in effect
        const alpha = Math.min(1, Math.max(0, (frame - i * 30) / 60))
        
        if (alpha > 0) {
            ctx.fillStyle = `rgba(239, 68, 68, ${alpha * 0.2})` // Red background
            ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})` // Red border
            
            // Draw Square representing error^2
            // We draw it to the left or right of the residual line
            // Size = error
            ctx.fillRect(p.x, Math.min(p.y, lineY), error, error)
            ctx.strokeRect(p.x, Math.min(p.y, lineY), error, error)
            
            // Draw Residual Line (dashed)
            ctx.setLineDash([4, 4])
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p.x, lineY)
            ctx.stroke()
            ctx.setLineDash([])
        }
    })
    
    // Draw Points
    points.forEach(p => {
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
      ctx.fill()
    })

    requestAnimationFrame(animate)
  }
  
  animate()
})
</script>

<template>
  <canvas ref="canvas" class="w-full h-full"></canvas>
</template>
