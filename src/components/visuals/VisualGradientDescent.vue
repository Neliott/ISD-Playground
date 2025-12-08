<script setup>
import { onMounted, ref } from 'vue'

const canvas = ref(null)

onMounted(() => {
  const ctx = canvas.value.getContext('2d')
  const w = canvas.value.width = canvas.value.offsetWidth
  const h = canvas.value.height = canvas.value.offsetHeight
  
  // Parabola: y = a(x-h)^2 + k
  // We want a valley in the middle-ish
  const centerX = w * 0.5
  const centerY = h * 0.8 // bottom of valley
  const scale = 0.005 // Steepness
  
  const getCurveY = (x) => {
    return scale * Math.pow(x - centerX, 2) + h * 0.2
  }
  
  // Ball state
  let ballX = w * 0.1
  let ballY = getCurveY(ballX)
  let velocity = 0
  
  const animate = () => {
    ctx.clearRect(0, 0, w, h)
    
    // Draw Curve
    ctx.strokeStyle = '#60a5fa' // Blue-400
    ctx.lineWidth = 4
    ctx.beginPath()
    for(let x = 0; x <= w; x+=5) {
        x === 0 ? ctx.moveTo(x, getCurveY(x)) : ctx.lineTo(x, getCurveY(x))
    }
    ctx.stroke()
    
    // Labels
    ctx.fillStyle = '#9ca3af'
    ctx.font = '12px Inter'
    ctx.fillText('Cost / Error', 10, 20)
    ctx.fillText('Model Parameters (m, b)', w - 140, h - 10)

    // Update Ball Physics (Gradient Descent Analogy)
    // Gradient is approximate derivative: 2*a*(x-h)
    const gradient = 2 * scale * (ballX - centerX)
    
    // Descent step (learning rate)
    // We dampen it to simulate "rolling" without momentumovershoot for this learning viz
    ballX -= gradient * 15 
    ballY = getCurveY(ballX)
    
    // Reset if it converges closely or goes out (loop)
    if (Math.abs(ballX - centerX) < 2) {
       setTimeout(() => {
           ballX = w * 0.1
           // Flash effect?
       }, 2000)
    }
    
    // Draw Ball
    ctx.fillStyle = '#facc15' // Yellow-400
    ctx.shadowColor = '#facc15'
    ctx.shadowBlur = 15
    ctx.beginPath()
    ctx.arc(ballX, ballY, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0 // Reset
    
    // Tangent Line (Gradient Visual)
    const slope = gradient
    // Draw distinct tangent
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(ballX - 30, ballY - slope*30)
    ctx.lineTo(ballX + 30, ballY + slope*30)
    ctx.stroke()
    
    requestAnimationFrame(animate)
  }
  
  animate()
})
</script>

<template>
  <canvas ref="canvas" class="w-full h-full"></canvas>
</template>
