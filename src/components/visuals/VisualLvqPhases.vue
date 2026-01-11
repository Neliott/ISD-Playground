<script setup>
import { onMounted, ref, onUnmounted } from 'vue'

const canvas = ref(null)
const phase = ref('training') // 'training' | 'prediction'
let animationId = null

const prototypes = ref([
    { x: 0.3, y: 0.3, class: 0, color: '#f87171' }, // Red
    { x: 0.7, y: 0.7, class: 1, color: '#60a5fa' }  // Blue
])

const dataPoints = []
// Generate static data
for(let i=0; i<20; i++) {
    dataPoints.push({ x: 0.2 + Math.random()*0.3, y: 0.2 + Math.random()*0.3, class: 0 })
    dataPoints.push({ x: 0.5 + Math.random()*0.3, y: 0.5 + Math.random()*0.3, class: 1 })
}

const draw = (ctx, w, h, time) => {
    ctx.clearRect(0, 0, w, h)
    
    const mapX = v => v * w
    const mapY = v => v * h
    
    // Draw Data Points
    if (phase.value === 'training') {
        dataPoints.forEach(p => {
            ctx.fillStyle = p.class === 0 ? '#f8717140' : '#60a5fa40' // Transparent
            ctx.beginPath()
            ctx.arc(mapX(p.x), mapY(p.y), 3, 0, Math.PI*2)
            ctx.fill()
        })
    }
    
    // Draw Prototypes
    prototypes.value.forEach((p, idx) => {
        let x = p.x
        let y = p.y
        
        // Animate in training phase
        if (phase.value === 'training') {
            const wobbleX = Math.sin(time * 2 + idx) * 0.05
            const wobbleY = Math.cos(time * 3 + idx) * 0.05
            x += wobbleX
            y += wobbleY
            
            // Draw arrows to data? No, just wobble to show "learning/moving"
        }
        
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(mapX(x), mapY(y), 8, 0, Math.PI*2)
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
        
        // Voronoi / Territory in Prediction Phase
        if (phase.value === 'prediction') {
            // Visualize territory? Or just show a new point being classified.
        }
    })
    
    if (phase.value === 'prediction') {
        // Draw a "New" point probing
        const t = (time % 3) / 3 // 0 to 1 every 3 sec
        const newX = 0.5 + Math.sin(time)*0.2
        const newY = 0.5 + Math.cos(time)*0.2
        
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(mapX(newX), mapY(newY), 6, 0, Math.PI*2)
        ctx.fill()
        ctx.fillText('?', mapX(newX)-4, mapY(newY)-10)
        
        // Line to nearest prototype
        let nearest = null
        let minD = Infinity
        prototypes.value.forEach(p => {
            const d = Math.sqrt((p.x - newX)**2 + (p.y - newY)**2)
            if (d < minD) { minD = d; nearest = p }
        })
        
        if (nearest) {
            ctx.strokeStyle = nearest.color
            ctx.setLineDash([5, 5])
            ctx.beginPath()
            ctx.moveTo(mapX(newX), mapY(newY))
            ctx.lineTo(mapX(nearest.x), mapY(nearest.y))
            ctx.stroke()
            ctx.setLineDash([])
            
            ctx.fillStyle = nearest.color
            ctx.font = 'bold 14px Inter'
            ctx.fillText(nearest.class === 0 ? 'Class A' : 'Class B', mapX(newX)+10, mapY(newY))
        }
    }
}

onMounted(() => {
    const ctx = canvas.value.getContext('2d')
    let startTime = Date.now()
    
    const loop = () => {
        if (!canvas.value) return
        const w = canvas.value.width = canvas.value.offsetWidth
        const h = canvas.value.height = canvas.value.offsetHeight
        const time = (Date.now() - startTime) / 1000
        
        draw(ctx, w, h, time)
        animationId = requestAnimationFrame(loop)
    }
    loop()
})

onUnmounted(() => cancelAnimationFrame(animationId))
</script>

<template>
  <div class="w-full h-full flex flex-col bg-slate-900 rounded-lg overflow-hidden border border-slate-700 relative">
      <canvas ref="canvas" class="w-full h-full block"></canvas>
      
      <!-- Controls -->
      <div class="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
          <button 
            @click="phase = 'training'"
            :class="['px-4 py-2 rounded text-sm font-bold', phase==='training' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300']"
          >
            1. Training Phase
          </button>
          <button 
            @click="phase = 'prediction'"
            :class="['px-4 py-2 rounded text-sm font-bold', phase==='prediction' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300']"
          >
            2. Prediction Phase
          </button>
      </div>
      
      <div class="absolute top-4 left-4 p-2 bg-black/40 rounded text-white text-xs">
          <div v-if="phase==='training'">
              Prototypes (Big Circles) move to match Data (Small Dots).
          </div>
          <div v-else>
              Prototypes are FIXED. New points are classified by nearest prototype (1-NN).
          </div>
      </div>
  </div>
</template>
