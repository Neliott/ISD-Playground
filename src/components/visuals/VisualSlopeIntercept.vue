<script setup>
import { onMounted, ref } from 'vue'

const canvas = ref(null)

onMounted(() => {
  const ctx = canvas.value.getContext('2d')
  const w = canvas.value.width = canvas.value.offsetWidth
  const h = canvas.value.height = canvas.value.offsetHeight
  
  let frame = 0
  
  const animate = () => {
    frame++
    // Cycle modes: default -> modifying slope -> modifying intercept
    const cycle = (frame % 600)
    
    // Base params
    let m = -0.5 // negative because y is flipped in canvas
    let b = h * 0.8
    
    let label = ''
    
    if (cycle < 200) {
        label = 'y = mx + b'
    } else if (cycle < 400) {
        // Modifying b (Intercept)
        const shift = Math.sin((cycle-200) * 0.05) * 50
        b += shift
        label = 'Intercept (b): Shifting Up/Down'
    } else {
        // Modifying m (Slope)
        const tilt = Math.sin((cycle-400) * 0.05) * 0.5
        m += tilt
        label = 'Slope (m): Rotating/Tilting'
    }
    
    ctx.clearRect(0, 0, w, h)
    
    // Grid
    ctx.strokeStyle = '#222'
    ctx.lineWidth = 1
    ctx.beginPath()
    for(let x=0; x<w; x+=40) { ctx.moveTo(x,0); ctx.lineTo(x,h) }
    for(let y=0; y<h; y+=40) { ctx.moveTo(0,y); ctx.lineTo(w,y) }
    ctx.stroke()
    
    // Axis
    ctx.strokeStyle = '#444'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h)
    ctx.moveTo(0, h/2); ctx.lineTo(w, h/2)
    ctx.stroke()
    
    // Draw Line
    // y = m(x - w/2) + b_adjusted_for_center
    // To make it simpler, lets generate two points
    // Center of rotation for slope should be center screen for visual clarity?
    // or y-intercept at x=0 (which is w/2 visually)
    
    const x1 = 0
    const y1 = (x1 - w/2) * m + (b - (h*0.8 - h/2)) // Adjust logic to keep it centered-ish
    const x2 = w
    const y2 = (x2 - w/2) * m + (b - (h*0.8 - h/2))
    
    ctx.strokeStyle = '#facc15' // Yellow
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    
    // Draw Intercept Point
    const interceptX = w/2
    const interceptY = (interceptX - w/2) * m + (b - (h*0.8 - h/2))
    ctx.fillStyle = '#ef4444' // Red
    ctx.beginPath(); ctx.arc(interceptX, interceptY, 8, 0, Math.PI*2); ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = '12px Inter'
    ctx.fillText('b', interceptX + 15, interceptY)

    // Label
    ctx.font = '24px Inter'
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.fillText(label, w/2, 50)
    
    requestAnimationFrame(animate)
  }
  
  animate()
})
</script>

<template>
  <canvas ref="canvas" class="w-full h-full"></canvas>
</template>
