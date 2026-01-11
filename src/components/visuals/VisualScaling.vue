<script setup>
import { onMounted, ref, watch } from 'vue'

const canvas = ref(null)
const standardized = ref(false)

// Data: Socks (Small range 0-20), Computers (Large range 0-1000)
// To visualize on 2D, we will scale them to screen.
const data = []
for(let i=0; i<30; i++) {
    const socks = 5 + Math.random() * 10 // 5 to 15
    const computers = 200 + Math.random() * 800 // 200 to 1000
    // Correlation? Maybe rich people have more socks and computers?
    data.push({ s: socks, c: computers })
}

// Stats
const sMean = 10, sStd = 5 // approx
const cMean = 600, cStd = 230 // approx

const draw = () => {
    if (!canvas.value) return
    const ctx = canvas.value.getContext('2d')
    const w = canvas.value.width = canvas.value.offsetWidth
    const h = canvas.value.height = canvas.value.offsetHeight
    
    ctx.clearRect(0, 0, w, h)
    
    // Axes
    const margin = 50
    const graphW = w - margin*2
    const graphH = h - margin*2
    
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(margin, h-margin); ctx.lineTo(w-margin, h-margin) // X
    ctx.moveTo(margin, h-margin); ctx.lineTo(margin, margin) // Y
    ctx.stroke()
    
    // Labels
    ctx.fillStyle = '#94a3b8'
    ctx.font = '12px Inter'
    ctx.textAlign = 'center'
    ctx.fillText(standardized.value ? 'Socks (Z-Score)' : 'Socks (Pairs)', w/2, h-10)
    
    ctx.save()
    ctx.translate(15, h/2)
    ctx.rotate(-Math.PI/2)
    ctx.fillText(standardized.value ? 'Computers (Z-Score)' : 'Computers ($)', 0, 0)
    ctx.restore()

    // Draw Points
    data.forEach(p => {
        let x, y
        
        if (!standardized.value) {
            // Raw
            // X (Socks): 0 to 20 mapped to width
            // Y (Computers): 0 to 1000 mapped to height
            
            // Visual Trap: If we map them "correctly" to actual pixels 1:1, X is tiny.
            // But usually plots auto-scale axes.
            // The problem is DISTANCE.
            // Let's visualize the "Trap" by using a Square aspect ratio logic?
            // No, let's just plot them on the axes range.
            
            // Wait, to show the "Scaling Problem" visually, we should show that 
            // a small change in Y is HUGE compared to X.
            // If we plot X (0-20) and Y (0-1000) on a square canvas 0-1000 space:
            // X would be a thin line on the left.
            
            const maxVal = 1200 // To accommodate Y
            x = margin + (p.s / maxVal) * graphW // Tiny spread
            y = (h - margin) - (p.c / maxVal) * graphH
        
        } else {
            // Standardized
            // Map -3 to 3 to full width/height
            const zS = (p.s - sMean) / sStd
            const zC = (p.c - cMean) / cStd
            
            // Map -3..3 to 0..1
            const normX = (zS + 3) / 6
            const normY = (zC + 3) / 6
            
            x = margin + normX * graphW
            y = (h - margin) - normY * graphH
        }
        
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI*2)
        ctx.fill()
    })
    
    // Draw "Distance" hint
    if (!standardized.value) {
        ctx.fillStyle = '#ef4444'
        ctx.fillText('Variable Y dominates distance!', w/2, margin)
        ctx.strokeStyle = '#ef4444'
        ctx.strokeRect(margin, margin, 20, graphH) // Highlight that all data is squeezed in X
    } else {
        ctx.fillStyle = '#4ade80'
        ctx.fillText('Balanced!', w/2, margin)
        ctx.strokeStyle = '#4ade80'
        ctx.strokeRect(margin, margin, graphW, graphH) // Utilizing full space
    }
}

onMounted(() => {
    draw()
    window.addEventListener('resize', draw)
})

watch(standardized, draw)
</script>

<template>
  <div class="w-full h-full flex flex-col bg-slate-900 rounded-lg overflow-hidden border border-slate-700 relative">
      <canvas ref="canvas" class="w-full h-full block"></canvas>
      
      <div class="absolute bottom-4 right-4">
          <button 
            @click="standardized = !standardized"
            class="px-4 py-2 bg-indigo-600 text-white rounded font-bold text-sm shadow hover:bg-indigo-500 transition"
          >
            {{ standardized ? 'Show Raw Data' : 'Standardize (Z-Score)' }}
          </button>
      </div>
  </div>
</template>
