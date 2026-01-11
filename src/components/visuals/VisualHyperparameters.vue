<script setup>
import { onMounted, ref, computed } from 'vue'

// Concepts:
// "Bias-Variance Tradeoff" / "Overfitting vs Underfitting"
// We simulate a Model Complexity slider (e.g., k in k-NN, or degree in Polynomial)
// Low Complexity = High Bias (Underfit)
// High Complexity = High Variance (Overfit)
// Optimal is in the middle.

const complexity = ref(50) // 0 to 100

// Generate fake error curves
// Train Error: Goes down as complexity goes up (Memorization)
// Val Error: Goes down then up (U-shape)

const trainError = computed(() => {
    // exponential decay
    // 0 -> 1.0
    // 100 -> 0.1
    const x = complexity.value / 100
    return 0.8 * Math.exp(-3 * x) + 0.1
})

const valError = computed(() => {
    // Parabola (U shape)
    // Min at x=0.5
    const x = complexity.value / 100
    return 2.5 * (x - 0.5)**2 + 0.2
})

const canvas = ref(null)

const draw = () => {
    if (!canvas.value) return
    const ctx = canvas.value.getContext('2d')
    const w = canvas.value.width = canvas.value.offsetWidth
    const h = canvas.value.height = canvas.value.offsetHeight
    
    ctx.clearRect(0, 0, w, h)
    
    const margin = 40
    const graphW = w - margin*2
    const graphH = h - margin*2
    
    // Axes
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(margin, h-margin); ctx.lineTo(w-margin, h-margin) // X axis (Complexity)
    ctx.moveTo(margin, h-margin); ctx.lineTo(margin, margin) // Y axis (Error)
    ctx.stroke()
    
    // Labels
    ctx.fillStyle = '#94a3b8'
    ctx.font = '12px Inter'
    ctx.textAlign = 'center'
    ctx.fillText('Model Complexity (Hyperparameters)', w/2, h-10)
    
    ctx.save()
    ctx.translate(15, h/2)
    ctx.rotate(-Math.PI/2)
    ctx.fillText('Error (Loss)', 0, 0)
    ctx.restore()
    
    // Draw Curves
    // Train (Blue)
    ctx.strokeStyle = '#60a5fa'
    ctx.lineWidth = 3
    ctx.beginPath()
    for(let i=0; i<=100; i+=2) {
        const xVal = i / 100
        const yVal = 0.8 * Math.exp(-3 * xVal) + 0.1
        const px = margin + (i/100)*graphW
        const py = (h-margin) - (yVal * graphH)
        i===0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
    }
    ctx.stroke()
    
    // Val (Red)
    ctx.strokeStyle = '#f87171'
    ctx.lineWidth = 3
    ctx.beginPath()
    for(let i=0; i<=100; i+=2) {
        const xVal = i / 100
        const yVal = 2.5 * (xVal - 0.5)**2 + 0.2
        const px = margin + (i/100)*graphW
        const py = (h-margin) - (yVal * graphH)
        i===0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
    }
    ctx.stroke()
    
    // Logic Labels
    ctx.fillStyle = '#60a5fa'; ctx.fillText('Training Error', w - 60, h/2 + 20)
    ctx.fillStyle = '#f87171'; ctx.fillText('Validation Error', w - 60, h/2 - 20)
    
    // Current Position Marker
    const currentX = (complexity.value / 100) * graphW + margin
    ctx.strokeStyle = '#fff'
    ctx.setLineDash([5, 5])
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(currentX, margin)
    ctx.lineTo(currentX, h-margin)
    ctx.stroke()
    ctx.setLineDash([])
    
    // Zone Label
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px Inter'
    if (complexity.value < 30) ctx.fillText('Underfitting', w/2, 30)
    else if (complexity.value > 70) ctx.fillText('Overfitting', w/2, 30)
    else ctx.fillText('Optimal Model', w/2, 30)
}

onMounted(() => {
    draw()
    // window.addEventListener('resize', draw) // Simplified for now
})

import { watch } from 'vue'
watch(complexity, draw)

</script>

<template>
  <div class="w-full h-full flex flex-col bg-slate-900 rounded-lg overflow-hidden border border-slate-700 relative p-4">
      <div class="flex-grow relative">
          <canvas ref="canvas" class="w-full h-full block"></canvas>
      </div>
      
      <div class="mt-4 flex items-center space-x-4">
          <span class="text-xs text-slate-400">Simple</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            v-model="complexity" 
            class="flex-grow h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          >
          <span class="text-xs text-slate-400">Complex</span>
      </div>
      
      <div class="mt-2 text-center text-xs text-slate-500">
          Iterations / Prototypes / Epochs
      </div>
  </div>
</template>
