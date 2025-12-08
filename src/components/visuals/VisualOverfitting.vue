<script setup>
import { onMounted, ref } from 'vue'

const canvas = ref(null)

onMounted(() => {
  const ctx = canvas.value.getContext('2d')
  const w = canvas.value.width = canvas.value.offsetWidth
  const h = canvas.value.height = canvas.value.offsetHeight
  
  // Data: Quadratic trend with noise
  const points = []
  for(let x=w*0.2; x<=w*0.8; x+=30) {
      const normalizedX = (x - w/2) / 100
      const y = h*0.8 - (normalizedX**2 * 100) + (Math.random()-0.5)*40
      points.push({x, y})
  }
  
  let frame = 0
  
  const animate = () => {
    frame++
    // Cycle modes every 200 frames
    const cycle = Math.floor(frame / 200) % 3
    const progress = (frame % 200) / 200
    
    ctx.clearRect(0, 0, w, h)
    
    // Draw Points
    points.forEach(p => {
        ctx.fillStyle = '#fff'
        ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI*2); ctx.fill()
    })
    
    ctx.font = '24px Inter'
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    
    if (cycle === 0) {
        ctx.fillText('Underfitting (High Bias)', w/2, 40)
        ctx.font = '14px Inter'; ctx.fillStyle = '#9ca3af'; ctx.fillText('Model is too simple (Line)', w/2, 65)
        
        ctx.strokeStyle = '#ef4444' // Red (Bad)
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(w*0.2, h*0.6)
        ctx.lineTo(w*0.8, h*0.6) // Flat line roughly
        ctx.stroke()
        
    } else if (cycle === 1) {
        ctx.fillText('Good Fit (Robust)', w/2, 40)
        ctx.font = '14px Inter'; ctx.fillStyle = '#9ca3af'; ctx.fillText('Captures the trend (Quadratic)', w/2, 65)

        ctx.strokeStyle = '#4ade80' // Green (Good)
        ctx.lineWidth = 4
        ctx.beginPath()
        // Draw Quadratic curve
        for (let x=w*0.2; x<=w*0.8; x+=5) {
             const normalizedX = (x - w/2) / 100
             const y = h*0.8 - (normalizedX**2 * 100)
             x === w*0.2 ? ctx.moveTo(x,y) : ctx.lineTo(x,y)
        }
        ctx.stroke()
        
    } else {
        ctx.fillText('Overfitting (High Variance)', w/2, 40)
        ctx.font = '14px Inter'; ctx.fillStyle = '#9ca3af'; ctx.fillText('Memorizing noise (Polynomial n=high)', w/2, 65)

        ctx.strokeStyle = '#facc15' // Yellow/Orange
        ctx.lineWidth = 2
        ctx.beginPath()
        // Draw line connecting exact dots
        ctx.moveTo(points[0].x, points[0].y)
        for(let i=1; i<points.length; i++) {
             // Bezier for smoothness but wiggly
             const p = points[i]
             const prev = points[i-1]
             const cp1x = prev.x + (p.x-prev.x)/2
             const cp1y = prev.y
             const cp2x = p.x - (p.x-prev.x)/2
             const cp2y = p.y
             ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p.x, p.y)
        }
        ctx.stroke()
    }

    requestAnimationFrame(animate)
  }
  
  animate()
})
</script>

<template>
  <canvas ref="canvas" class="w-full h-full"></canvas>
</template>
