<script setup>
import { onMounted, ref } from 'vue'

const canvas = ref(null)

onMounted(() => {
  const ctx = canvas.value.getContext('2d')
  const w = canvas.value.width = canvas.value.offsetWidth
  const h = canvas.value.height = canvas.value.offsetHeight
  
  const p1 = { x: w * 0.2, y: h * 0.7 }
  const p2 = { x: w * 0.8, y: h * 0.3 }
  
  let frame = 0
  
  const animate = () => {
    frame++
    ctx.clearRect(0, 0, w, h)
    
    // Grid background
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    ctx.beginPath()
    for(let x=0; x<w; x+=30) { ctx.moveTo(x,0); ctx.lineTo(x,h) }
    for(let y=0; y<h; y+=30) { ctx.moveTo(0,y); ctx.lineTo(w,y) }
    ctx.stroke()
    
    // Draw Points
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(p1.x, p1.y, 6, 0, Math.PI*2); ctx.fill()
    ctx.beginPath(); ctx.arc(p2.x, p2.y, 6, 0, Math.PI*2); ctx.fill()
    
    // Mode switcher animation (approx 5s cycle)
    const mode = (frame % 300) < 150 ? 'euclidean' : 'manhattan'
    const progress = (frame % 150) / 150
    
    ctx.font = '20px Inter'
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    
    if (mode === 'euclidean') {
         ctx.fillText('Euclidean (L2)', w/2, 40)
         ctx.font = '14px Inter'
         ctx.fillStyle = '#9ca3af'
         ctx.fillText('Direct "crow-flies" path', w/2, 65)
         
         // Animate Line drawing
         ctx.strokeStyle = '#4ade80' // Green
         ctx.lineWidth = 4
         ctx.setLineDash([10, 10])
         ctx.lineDashOffset = -frame * 2
         ctx.beginPath()
         ctx.moveTo(p1.x, p1.y)
         ctx.lineTo(p2.x, p2.y)
         ctx.stroke()
         ctx.setLineDash([])
         
         // Hypotenuse calc
         const dist = Math.sqrt((p2.x-p1.x)**2 + (p2.y-p1.y)**2)
         ctx.fillStyle = '#4ade80'
         ctx.fillText(`c² = a² + b²`, (p1.x+p2.x)/2 + 20, (p1.y+p2.y)/2 - 20)
    } else {
         ctx.fillText('Manhattan (L1)', w/2, 40)
         ctx.font = '14px Inter'
         ctx.fillStyle = '#9ca3af'
         ctx.fillText('Grid / Taxi steps', w/2, 65)

         // Animate Steps
         ctx.strokeStyle = '#f472b6' // Pink
         ctx.lineWidth = 4
         ctx.beginPath()
         ctx.moveTo(p1.x, p1.y)
         // Horizontal then Vertical
         const cornerX = p2.x
         const cornerY = p1.y
         
         // Animate drawing path
         if (progress < 0.5) {
             const cx = p1.x + (cornerX - p1.x) * (progress * 2)
             ctx.lineTo(cx, cornerY)
         } else {
             ctx.lineTo(cornerX, cornerY)
             const cy = cornerY + (p2.y - cornerY) * ((progress - 0.5) * 2)
             ctx.lineTo(cornerX, cy)
         }
         ctx.stroke()
         
         // Step labels
         if (progress > 0.5) {
             ctx.fillStyle = '#f472b6'
             ctx.fillText('| x₁ - x₂ |', (p1.x+p2.x)/2, p1.y + 20)
             ctx.fillText('| y₁ - y₂ |', p2.x + 40, (p1.y+p2.y)/2)
         }
    }

    requestAnimationFrame(animate)
  }
  
  animate()
})
</script>

<template>
  <canvas ref="canvas" class="w-full h-full"></canvas>
</template>
