<script setup>
import { onMounted, ref } from 'vue'

const canvas = ref(null)

onMounted(() => {
  const ctx = canvas.value.getContext('2d')
  const w = canvas.value.width = canvas.value.offsetWidth
  const h = canvas.value.height = canvas.value.offsetHeight
  
  const center = { x: w/2, y: h/2 }
  
  // Static neighbors
  const neighbors = []
  for(let i=0; i<15; i++) {
      neighbors.push({
          x: w/2 + (Math.random()-0.5) * w * 0.6,
          y: h/2 + (Math.random()-0.5) * h * 0.6,
          class: Math.random() > 0.4 ? 'red' : 'blue' // More red to show majority?
      })
  }
  neighbors[0].x = w/2 + 20; neighbors[0].y = h/2 - 20; // Ensure close ones
  neighbors[1].x = w/2 - 30; neighbors[1].y = h/2 + 10;
  neighbors[2].x = w/2 + 10; neighbors[2].y = h/2 + 40;

  let radius = 0
  let expanding = true
  const maxRadius = 100 // Covers k=3 for sure
  let k = 3
  
  const animate = () => {
    ctx.clearRect(0, 0, w, h)
    
    // Draw Neighbors
    neighbors.forEach(n => {
        ctx.fillStyle = n.class === 'red' ? '#ef4444' : '#3b82f6'
        ctx.beginPath()
        ctx.arc(n.x, n.y, 6, 0, Math.PI * 2)
        ctx.fill()
    })
    
    // Draw Unknown Point
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(center.x, center.y, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.stroke()
    ctx.fillStyle = '#000'
    ctx.textAlign = 'center'
    ctx.font = 'bold 12px Inter'
    ctx.fillText('?', center.x, center.y + 4)
    
    // Animate Search Radius
    if (expanding) {
        radius += 0.5
        if (radius > maxRadius) expanding = false
    } else {
        // Pause and reset
        if (Math.random() < 0.01) {
            radius = 0
            expanding = true
        }
    }
    
    // Draw Radius Circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.setLineDash([5, 5])
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    
    // Highlight neighbors inside radius
    neighbors.forEach(n => {
        const d = Math.sqrt((n.x - center.x)**2 + (n.y - center.y)**2)
        if (d < radius) {
            ctx.beginPath()
            ctx.moveTo(center.x, center.y)
            ctx.lineTo(n.x, n.y)
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - d/maxRadius})`
            ctx.lineWidth = 1
            ctx.stroke()
            
            // Halo
            ctx.beginPath()
            ctx.arc(n.x, n.y, 10, 0, Math.PI * 2)
            ctx.strokeStyle = 'white'
            ctx.stroke()
        }
    })

    requestAnimationFrame(animate)
  }
  
  animate()
})
</script>

<template>
  <canvas ref="canvas" class="w-full h-full"></canvas>
</template>
