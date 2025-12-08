<script setup>
import { onMounted, ref } from 'vue'

const canvas = ref(null)

onMounted(() => {
  const ctx = canvas.value.getContext('2d')
  const w = canvas.value.width = canvas.value.offsetWidth
  const h = canvas.value.height = canvas.value.offsetHeight
  
  // Generating some dummy data points
  const points = []
  // Cluster 1 (Red)
  for(let i=0; i<8; i++) points.push({ x: w*0.3 + (Math.random()-0.5)*100, y: h*0.5 + (Math.random()-0.5)*100, class: 'red' })
  // Cluster 2 (Blue)
  for(let i=0; i<8; i++) points.push({ x: w*0.7 + (Math.random()-0.5)*100, y: h*0.5 + (Math.random()-0.5)*100, class: 'blue' })
  // Noise points
  points.push({ x: w*0.5, y: h*0.5, class: 'red' }) // Red in the middle
  points.push({ x: w*0.6, y: h*0.4, class: 'blue' }) 

  let frame = 0
  
  const animate = () => {
    frame++
    // Cycle k: 1 (complex) -> 10 (smooth)
    const cycle = (Math.sin(frame * 0.02) + 1) / 2 // 0 to 1
    const k = Math.floor(1 + cycle * 10)
    
    ctx.clearRect(0, 0, w, h)
    
    // Draw Title
    ctx.font = '24px Inter'
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.fillText(`k = ${k}`, w/2, 40)
    
    ctx.font = '14px Inter'
    ctx.fillStyle = '#9ca3af'
    if (k < 3) ctx.fillText('Low K: High Variance, Noisy, Overfitting', w/2, 70)
    else if (k > 7) ctx.fillText('High K: High Bias, Smooth, Underfitting', w/2, 70)
    else ctx.fillText('Medium K: Balanced Boundary', w/2, 70)
    
    // Visualize Boundary (Voronoi-ish approximation)
    // We scan a coarse grid
    const gridSize = 10
    ctx.globalAlpha = 0.3
    for(let x=0; x<w; x+=gridSize) {
        for(let y=0; y<h; y+=gridSize) {
            // Find k nearest for this pixel
            const dists = points.map(p => ({ d: (p.x-x)**2 + (p.y-y)**2, c: p.class }))
            dists.sort((a,b) => a.d - b.d)
            
            let redVotes = 0
            for(let i=0; i<k; i++) if(dists[i].c === 'red') redVotes++
            
            if (redVotes > k/2) {
                ctx.fillStyle = '#ef4444'
                ctx.fillRect(x,y,gridSize,gridSize)
            } else {
                ctx.fillStyle = '#3b82f6'
                ctx.fillRect(x,y,gridSize,gridSize)
            }
        }
    }
    ctx.globalAlpha = 1
    
    // Draw Points
    points.forEach(p => {
        ctx.fillStyle = p.class === 'red' ? '#ef4444' : '#3b82f6'
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI*2); ctx.fill(); ctx.stroke()
    })

    requestAnimationFrame(animate)
  }
  
  animate()
})
</script>

<template>
  <canvas ref="canvas" class="w-full h-full"></canvas>
</template>
