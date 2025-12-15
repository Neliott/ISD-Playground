<script setup>
import { onMounted, ref, onUnmounted } from 'vue'

const canvas = ref(null)
let animationId = null

onMounted(() => {
  const ctx = canvas.value.getContext('2d')
  let w = canvas.value.width = canvas.value.offsetWidth
  let h = canvas.value.height = canvas.value.offsetHeight
  
  // Handle resize
  const resizeObserver = new ResizeObserver(() => {
    if (!canvas.value) return
    w = canvas.value.width = canvas.value.offsetWidth
    h = canvas.value.height = canvas.value.offsetHeight
  })
  resizeObserver.observe(canvas.value)


  let frame = 0
  const points = []
  const n = 50
  
  // Initialize random points
  for (let i = 0; i < n; i++) {
    points.push({
      x: Math.random(), 
      y: Math.random(),
      targetX: 0,
      targetY: 0
    })
  }
  
  const animate = () => {
    frame++
    const cycle = frame % 900 // 15 seconds cycle at 60fps
    
    let r = 0
    let label = ''
    
    // 0-300: r goes from 0 to 1
    // 300-600: r goes from 1 to -1
    // 600-900: r goes from -1 to 0
    
    if (cycle < 300) {
      // 0 -> 1
      const t = cycle / 300
      r = t
      label = `Correlation: ${r.toFixed(1)} (Positive)`
    } else if (cycle < 600) {
      // 1 -> -1
      const t = (cycle - 300) / 300
      r = 1 - 2 * t
      label = `Correlation: ${r.toFixed(1)} ${r > 0 ? '(Positive)' : '(Negative)'}`
    } else {
      // -1 -> 0
      const t = (cycle - 600) / 300
      r = -1 + t
      label = `Correlation: ${r.toFixed(1)} (Negative)`
    }
    
    // Update target positions based on r
    // We want a cloud with correlation r.
    // Simple way: 
    // y = r*x + noise * sqrt(1-r^2)
    
    // Let's generate fresh targets occasionally or interpolate?
    // Interpolation is smoother.
    // For each point, we keep its "underlying" randomness fixed (u, v)
    // x = u
    // y = r*u + v * sqrt(1 - r*r) ? No that's for standardized variables
    // Let's assume standard normal for clear visualization centered at 0.5, 0.5
    
    // Re-seed the randomness effectively by using the index
    for (let i = 0; i < n; i++) {
        // Pseudo-random fixed values for this point
        const u = (Math.sin(i * 12.9898) + 1) / 2 // 0..1
        const v = (Math.cos(i * 78.233) + 1) / 2 // 0..1
        
        // Map u to centered x (spread out)
        // We want x to be roughly 0.2 to 0.8
        let cx = 0.2 + u * 0.6
        
        // We want y to correlate with x
        // Perfect line: cy = cx (if r=1) or cy = 1-cx (if r=-1)
        
        // Let's mix signal and noise
        // signal = r > 0 ? cx : (1 - cx)
        // weight of signal = abs(r) (roughly)
        // weight of noise = 1 - abs(r)
        
        // Actually, let's just slide them.
        // Target Y:
        // if r = 1: y = x
        // if r = 0: y = random
        // if r = -1: y = 1-x
        
        // Smooth interpolation
        // noise component
        let noiseY = 0.2 + v * 0.6
        let lineY_pos = cx // y = x
        let lineY_neg = 1 - cx // y = -x + 1
        
        let cy = 0
        if (r >= 0) {
            cy = lineY_pos * r + noiseY * (1 - r)
        } else {
            cy = lineY_neg * Math.abs(r) + noiseY * (1 - Math.abs(r))
        }
        
        points[i].targetX = cx
        points[i].targetY = cy
        
        // Lerp current to target
        points[i].x += (points[i].targetX - points[i].x) * 0.1
        points[i].y += (points[i].targetY - points[i].y) * 0.1
    }

    ctx.clearRect(0, 0, w, h)
    
    // Draw Grid
    ctx.strokeStyle = '#222'
    ctx.lineWidth = 1
    ctx.beginPath()
    for(let x=0; x<w; x+=40) { ctx.moveTo(x,0); ctx.lineTo(x,h) }
    for(let y=0; y<h; y+=40) { ctx.moveTo(0,y); ctx.lineTo(w,y) }
    ctx.stroke()
    
    // Draw Axis
    ctx.strokeStyle = '#444'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(40, h-40); ctx.lineTo(w-40, h-40) // X
    ctx.moveTo(40, h-40); ctx.lineTo(40, 40) // Y
    ctx.stroke()
    
    // Draw Points
    ctx.fillStyle = '#facc15'
    for (let p of points) {
        // Map 0..1 to canvas coords
        // Margin 40
        const drawX = 40 + p.x * (w - 80)
        const drawY = (h - 40) - p.y * (h - 80) // Flip Y
        
        ctx.beginPath()
        ctx.arc(drawX, drawY, 4, 0, Math.PI*2)
        ctx.fill()
    }
    
    // Label
    ctx.font = '24px Inter'
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.fillText(label, w/2, 50)
    
    animationId = requestAnimationFrame(animate)
  }
  
  animate()
  
  onUnmounted(() => {
    cancelAnimationFrame(animationId)
    resizeObserver.disconnect()
  })
})
</script>

<template>
  <canvas ref="canvas" class="w-full h-full"></canvas>
</template>
