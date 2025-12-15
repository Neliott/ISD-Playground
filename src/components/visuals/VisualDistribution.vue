<script setup>
import { onMounted, ref, onUnmounted } from 'vue'

const canvas = ref(null)
let animationId = null

onMounted(() => {
  const ctx = canvas.value.getContext('2d')
  let w = canvas.value.width = canvas.value.offsetWidth
  let h = canvas.value.height = canvas.value.offsetHeight
  
  // Standard Normal Distribution Function
  const normal = (x, mean, stdDev) => {
    return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * 
           Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2))
  }

  let frame = 0
  
  const animate = () => {
    frame++
    ctx.clearRect(0, 0, w, h)
    
    // Config
    const margin = 40
    const plotW = w - margin * 2
    const mean = w / 2
    const stdDev = plotW / 6 // 3 sigma fits in plotW
    const curveHeight = h * 0.5
    const boxY = h * 0.75
    
    // Animation Progress (0 to 1) cyclic
    const duration = 300
    const t = (frame % duration) / duration
    const reveal = Math.min(1, t * 1.5) // Reveal curve first
    
    // 1. Draw Normal Curve
    ctx.beginPath()
    ctx.strokeStyle = '#60a5fa' // blue-400
    ctx.lineWidth = 3
    
    let started = false
    for (let x = 0; x <= w; x += 2) {
      const nVal = normal(x, mean, stdDev)
      // Normalize height based on peak
      const peak = normal(mean, mean, stdDev)
      const y = (h * 0.6) - (nVal / peak) * curveHeight
      
      if (x > w * reveal) break 
      
      if (!started) {
        ctx.moveTo(x, y)
        started = true
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
    
    // If curve finished, animate connection lines dropping down
    if (t > 0.4) {
      const dropT = Math.min(1, (t - 0.4) * 3)
      
      // Key Points: Q1 (-0.675 SD), Median (0 SD), Q3 (+0.675 SD)
      const q1X = mean - 0.675 * stdDev
      const q3X = mean + 0.675 * stdDev
      const medX = mean
      
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = `rgba(255, 255, 255, ${dropT * 0.5})`
      
      const drawDrop = (x) => {
        const nVal = normal(x, mean, stdDev)
        const peak = normal(mean, mean, stdDev)
        const startY = (h * 0.6) - (nVal / peak) * curveHeight
        
        ctx.beginPath()
        ctx.moveTo(x, startY)
        ctx.lineTo(x, startY + (boxY - startY) * dropT)
        ctx.stroke()
      }
      
      drawDrop(q1X)
      drawDrop(q3X)
      drawDrop(medX)
      ctx.setLineDash([])
    }
    
    // 2. Draw Box Plot
    if (t > 0.6) {
      const boxT = Math.min(1, (t - 0.6) * 3)
      const q1X = mean - 0.675 * stdDev
      const q3X = mean + 0.675 * stdDev
      const medX = mean
      const minX = mean - 2.698 * stdDev // 99.3% coverage approximate for whiskers visually
      const maxX = mean + 2.698 * stdDev
      
      ctx.globalAlpha = boxT
      
      // Box
      ctx.fillStyle = 'rgba(96, 165, 250, 0.2)'
      ctx.strokeStyle = '#60a5fa'
      ctx.lineWidth = 2
      ctx.fillRect(q1X, boxY - 15, q3X - q1X, 30)
      ctx.strokeRect(q1X, boxY - 15, q3X - q1X, 30)
      
      // Median
      ctx.beginPath()
      ctx.moveTo(medX, boxY - 15)
      ctx.lineTo(medX, boxY + 15)
      ctx.strokeStyle = '#fff'
      ctx.stroke()
      
      // Whiskers
      ctx.strokeStyle = '#60a5fa'
      ctx.beginPath()
      // Left
      ctx.moveTo(q1X, boxY)
      ctx.lineTo(minX, boxY)
      ctx.moveTo(minX, boxY - 10)
      ctx.lineTo(minX, boxY + 10)
      // Right
      ctx.moveTo(q3X, boxY)
      ctx.lineTo(maxX, boxY)
      ctx.moveTo(maxX, boxY - 10)
      ctx.lineTo(maxX, boxY + 10)
      ctx.stroke()
      
      // Labels
      ctx.fillStyle = '#fff'
      ctx.font = '12px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('Median', medX, boxY + 30)
      ctx.fillText('Q1', q1X, boxY + 30)
      ctx.fillText('Q3', q3X, boxY + 30)
      
      ctx.globalAlpha = 1
    }

    animationId = requestAnimationFrame(animate)
  }
  
  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})
</script>

<template>
  <div class="w-full h-full relative bg-black/20 rounded-lg overflow-hidden border border-white/5">
    <canvas ref="canvas" class="w-full h-full"></canvas>
    
    <div class="absolute top-4 left-4 text-xs font-mono text-white/50">
       Normal Distribution vs Box Plot
    </div>
  </div>
</template>
