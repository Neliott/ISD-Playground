<script setup>
import { onMounted, ref } from 'vue'

const canvas = ref(null)

onMounted(() => {
  const ctx = canvas.value.getContext('2d')
  const w = canvas.value.width = canvas.value.offsetWidth
  const h = canvas.value.height = canvas.value.offsetHeight
  
  // Scenario 1: Same Class (Attraction) - Left Side
  const proto1 = { x: w * 0.2, y: h * 0.5, class: 'red', targetX: w * 0.2, targetY: h * 0.5 }
  const point1 = { x: w * 0.35, y: h * 0.5, class: 'red' }
  
  // Scenario 2: Diff Class (Repulsion) - Right Side
  const proto2 = { x: w * 0.65, y: h * 0.5, class: 'blue', targetX: w * 0.65, targetY: h * 0.5 }
  const point2 = { x: w * 0.8, y: h * 0.5, class: 'red' } // Point is red, proto is blue -> Push away
  
  let frame = 0
  
  const animate = () => {
    frame++
    ctx.clearRect(0, 0, w, h)
    
    // Split screen line
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.beginPath()
    ctx.moveTo(w/2, 20)
    ctx.lineTo(w/2, h-20)
    ctx.setLineDash([5, 5])
    ctx.stroke()
    ctx.setLineDash([])
    
    // Titles
    ctx.fillStyle = '#fff'
    ctx.font = '14px Inter'
    ctx.textAlign = 'center'
    ctx.fillText('Same Class: Attraction', w * 0.25, 30)
    ctx.fillText('Diff Class: Repulsion', w * 0.75, 30)
    
    // Update Positions (Animation Logic)
    // SINE WAVES for cyclic motion
    const shift = Math.sin(frame * 0.05) * 20
    
    // Attraction: Proto moves TOWARDS point
    // Base x is 0.2, moves closer to 0.35
    proto1.targetX = (w * 0.2) + Math.max(0, shift) 
    
    // Repulsion: Proto moves AWAY from point
    // Base x is 0.65, moves away from 0.8 (so moves left)
    proto2.targetX = (w * 0.65) - Math.max(0, shift)
    
    // Draw Arrows
    const drawArrow = (fromX, fromY, toX, toY, color) => {
        const headlen = 10
        const dx = toX - fromX
        const dy = toY - fromY
        const angle = Math.atan2(dy, dx)
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(fromX, fromY)
        ctx.lineTo(toX, toY)
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6))
        ctx.moveTo(toX, toY)
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6))
        ctx.stroke()
    }

    // Draw Scenario 1
    // Point
    ctx.fillStyle = '#ef4444' // Red
    ctx.beginPath(); ctx.arc(point1.x, point1.y, 6, 0, Math.PI*2); ctx.fill()
    // Proto
    ctx.fillStyle = '#ef4444' // Red
    ctx.beginPath(); ctx.arc(proto1.targetX, proto1.targetY, 12, 0, Math.PI*2); ctx.fill()
    ctx.strokeStyle = '#fff'; ctx.lineWidth=2; ctx.stroke()
    // Arrow
    if (shift > 0.1) drawArrow(proto1.targetX + 15, proto1.targetY, point1.x - 10, point1.y, '#4ade80') // Green arrow for "Good" attraction?

    // Draw Scenario 2
    // Point
    ctx.fillStyle = '#ef4444' // Red
    ctx.beginPath(); ctx.arc(point2.x, point2.y, 6, 0, Math.PI*2); ctx.fill()
    // Proto
    ctx.fillStyle = '#3b82f6' // Blue
    ctx.beginPath(); ctx.arc(proto2.targetX, proto2.targetY, 12, 0, Math.PI*2); ctx.fill()
    ctx.strokeStyle = '#fff'; ctx.lineWidth=2; ctx.stroke()
    // Arrow (Pushing way)
    if (shift > 0.1) drawArrow(proto2.targetX + 10, proto2.targetY - 15, proto2.targetX - 20, proto2.targetY - 15, '#fbbf24') // Yellow arrow for push

    requestAnimationFrame(animate)
  }
  
  animate()
})
</script>

<template>
  <canvas ref="canvas" class="w-full h-full"></canvas>
</template>
