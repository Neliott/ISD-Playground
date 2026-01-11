<script setup>
import { onMounted, ref, watch } from 'vue'

const canvas = ref(null)
const hasInteraction = ref(false)

const draw = () => {
    if (!canvas.value) return
    const ctx = canvas.value.getContext('2d')
    const w = canvas.value.width = canvas.value.offsetWidth
    const h = canvas.value.height = canvas.value.offsetHeight
    
    ctx.clearRect(0, 0, w, h)
    
    // Grid
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(w*0.1, h*0.9); ctx.lineTo(w*0.9, h*0.9) // X axis
    ctx.moveTo(w*0.1, h*0.9); ctx.lineTo(w*0.1, h*0.1) // Y axis
    ctx.stroke()
    
    // Labels
    ctx.fillStyle = '#94a3b8'
    ctx.font = '12px Inter'
    ctx.fillText('Education (Years)', w*0.5, h*0.96)
    ctx.save()
    ctx.translate(w*0.05, h*0.5)
    ctx.rotate(-Math.PI/2)
    ctx.fillText('Salary ($)', 0, 0)
    ctx.restore()
    
    // Data Lines
    const startX = w*0.2
    const endX = w*0.8
    
    // Group A (e.g., Men) - Blue
    ctx.strokeStyle = '#60a5fa'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(startX, h*0.7) // Low Education, Low Salary
    ctx.lineTo(endX, h*0.3)   // High Education, High Salary
    ctx.stroke()
    ctx.fillStyle = '#60a5fa'
    ctx.fillText('Group A', endX + 10, h*0.3)
    
    // Group B (e.g., Women) - Pink
    ctx.strokeStyle = '#f472b6'
    ctx.lineWidth = 3
    ctx.beginPath()
    
    if (!hasInteraction.value) {
        // Parallel (No Interaction)
        // Same slope, different intercept
        ctx.moveTo(startX, h*0.8) 
        ctx.lineTo(endX, h*0.4)
    } else {
        // Crossing (Interaction)
        // Different slope
        ctx.moveTo(startX, h*0.8) 
        ctx.lineTo(endX, h*0.2) // Steeper slope (or shallower depending on intent, let's make it cross)
        // Actually let's make it cross to be obvious
        // Start lower, end higher? Or start higher end lower?
        // Let's say interaction means "Education pays off MORE for Group A than B"
        // Group A: steep slope (already drawn)
        // Group B: flatter slope
        ctx.moveTo(startX, h*0.65) // Start closer to A
        ctx.lineTo(endX, h*0.65)   // Flat line
    }
    ctx.stroke()
    ctx.fillStyle = '#f472b6'
    ctx.fillText('Group B', endX + 10, hasInteraction.value ? h*0.65 : h*0.4)
}

onMounted(() => {
    draw()
    window.addEventListener('resize', draw)
})

watch(hasInteraction, draw)
</script>

<template>
  <div class="w-full h-full flex flex-col bg-slate-900 rounded-lg overflow-hidden border border-slate-700 relative">
      <canvas ref="canvas" class="w-full h-full block"></canvas>
      
      <div class="absolute top-4 right-4 flex items-center space-x-2 bg-slate-800 p-2 rounded border border-slate-700">
          <label class="text-sm text-white cursor-pointer select-none">
              <input type="checkbox" v-model="hasInteraction" class="mr-2">
              Enable Interaction Term
          </label>
      </div>
      
      <div class="absolute bottom-4 left-4 p-2 pointer-events-none">
          <p class="text-white text-sm font-bold" v-if="!hasInteraction">Parallel Lines = No Interaction</p>
          <p class="text-white text-sm font-bold" v-else>Crossing/Different Slopes = Interaction!</p>
          <p class="text-xs text-slate-400">Effect of X (Education) on Y (Salary) depends on Group.</p>
      </div>
  </div>
</template>
