<script setup>
import { ref, onMounted, computed, watch } from 'vue'

const canvas = ref(null)
const kResults = ref([])
const isComputing = ref(false)
const selectedK = ref(null)

// Generate Dataset (Clusters)
const generatePoints = () => {
    const points = []
    const blobs = [
        { x: 0.2, y: 0.3, r: 0.1 },
        { x: 0.8, y: 0.2, r: 0.1 },
        { x: 0.5, y: 0.8, r: 0.15 }, // 3 clear clusters
        // Maybe a smaller 4th one?
        { x: 0.5, y: 0.5, r: 0.05}
    ]
    
    for (let i = 0; i < 200; i++) {
        const blob = blobs[Math.floor(Math.random() * blobs.length)]
        const angle = Math.random() * Math.PI * 2
        const dist = Math.sqrt(Math.random()) * blob.r
        points.push({
            x: blob.x + Math.cos(angle) * dist,
            y: blob.y + Math.sin(angle) * dist
        })
    }
    return points
}

const points = ref(generatePoints())

// fast K-Means implementation
const runKMeans = (data, k) => {
    // Init centroids random
    let centroids = []
    for(let i=0; i<k; i++) {
        centroids.push({...data[Math.floor(Math.random()*data.length)]})
    }
    
    let assignments = new Array(data.length).fill(-1)
    let iterations = 0
    let converged = false
    
    while(!converged && iterations < 20) {
        let changed = false
        // Assign
        assignments = data.map((p, idx) => {
            let minD = Infinity
            let cIdx = -1
            centroids.forEach((c, i) => {
                const d = (p.x-c.x)**2 + (p.y-c.y)**2
                if(d < minD) { minD = d; cIdx = i }
            })
            if (assignments[idx] !== cIdx) changed = true
            return cIdx
        })
        
        if (!changed) converged = true
        
        // Update
        centroids = centroids.map((c, i) => {
            const assigned = data.filter((_, idx) => assignments[idx] === i)
            if (assigned.length === 0) return c
            const sx = assigned.reduce((acc, p) => acc + p.x, 0)
            const sy = assigned.reduce((acc, p) => acc + p.y, 0)
            return { x: sx/assigned.length, y: sy/assigned.length }
        })
        
        iterations++
    }
    
    // Calc WSS
    let wss = 0
    assignments.forEach((cIdx, pIdx) => {
         const p = data[pIdx]
         const c = centroids[cIdx]
         wss += (p.x-c.x)**2 + (p.y-c.y)**2
    })
    
    return { k, wss, centroids, assignments }
}

const computeElbow = async () => {
    isComputing.value = true
    kResults.value = []
    selectedK.value = null
    
    // Artificial delay for animation effect
    for (let k = 1; k <= 9; k++) {
        const res = runKMeans(points.value, k)
        kResults.value.push(res)
        selectedK.value = k // visualizing step by step
        await new Promise(r => setTimeout(r, 200))
    }
    isComputing.value = false
    selectedK.value = 3 // select 3 by default as it matches our generation
}

// Render Logic
const render = () => {
    if (!canvas.value) return
    const ctx = canvas.value.getContext('2d')
    const w = canvas.value.width = canvas.value.offsetWidth
    const h = canvas.value.height = canvas.value.offsetHeight
    
    ctx.clearRect(0,0,w,h)
    
    const margin = 20
    const drawW = w - margin*2
    const drawH = h - margin*2
    
     // Draw Points
     const currentResult = kResults.value.find(r => r.k === selectedK.value)
     
     points.value.forEach((p, idx) => {
         const screenX = margin + p.x * drawW
         const screenY = h - margin - p.y * drawH
         
         ctx.fillStyle = '#555'
         if (currentResult) {
             const cIdx = currentResult.assignments[idx]
             const colors = ['#f87171', '#34d399', '#60a5fa', '#fbbf24', '#a78bfa', '#ec4899', '#9ca3af', '#fcd34d', '#4ade80']
             ctx.fillStyle = colors[cIdx % colors.length]
         }
         
         ctx.beginPath()
         ctx.arc(screenX, screenY, 3, 0, Math.PI*2)
         ctx.fill()
     })
     
     // Draw Centroids
     if (currentResult) {
         currentResult.centroids.forEach(c => {
             const screenX = margin + c.x * drawW
             const screenY = h - margin - c.y * drawH
             
             ctx.strokeStyle = '#fff'
             ctx.lineWidth = 2
             ctx.beginPath()
             ctx.moveTo(screenX-5, screenY-5); ctx.lineTo(screenX+5, screenY+5)
             ctx.moveTo(screenX+5, screenY-5); ctx.lineTo(screenX-5, screenY+5)
             ctx.stroke()
         })
     }
}

watch(selectedK, render)
watch(points, render)

onMounted(() => {
    computeElbow()
    setTimeout(render, 100)
    window.addEventListener('resize', render)
})

</script>

<template>
    <div class="flex flex-col md:flex-row h-full gap-4">
        <!-- Visualization -->
        <div class="flex-1 bg-black/20 rounded-xl overflow-hidden relative min-h-[300px]">
            <canvas ref="canvas" class="w-full h-full"></canvas>
            <div class="absolute top-4 left-4 font-bold text-white/50" v-if="selectedK">
                Visualizing K = {{ selectedK }}
            </div>
        </div>
        
        <!-- Plot -->
        <div class="w-full md:w-96 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col">
            <h3 class="font-bold mb-4">Elbow Curve (WSS vs K)</h3>
            
            <div class="flex-1 relative flex items-end gap-2 p-4 border-l border-b border-white/20 min-h-[200px]">
                <div v-if="kResults.length === 0" class="absolute inset-0 flex items-center justify-center text-xs text-white/30">
                    Running K-Means 1..9...
                </div>
                
                <div v-for="res in kResults" :key="res.k"
                     class="flex-1 bg-blue-500/50 hover:bg-blue-400 cursor-pointer relative group rounded-t transition-all duration-300"
                     :class="selectedK === res.k ? '!bg-blue-400 ring-2 ring-white/50' : ''"
                     :style="{ height: (res.wss / kResults[0].wss * 100) + '%' }"
                     @mouseenter="selectedK = res.k"
                >
                    <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/50">{{ res.k }}</div>
                    <!-- Tooltip -->
                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                        WSS: {{ res.wss.toFixed(2) }}
                    </div>
                </div>
                
                <!-- Axis Labels -->
                <div class="absolute -left-8 top-0 text-xs text-white/30 -rotate-90 origin-right">Error (WSS)</div>
                <div class="absolute bottom-2 right-2 text-xs text-white/30">K Clusters</div>
            </div>
            
            <div class="mt-4 text-sm text-text-muted">
                <p class="mb-2"><strong>WSS:</strong> Within-Cluster Sum of Squares (Total Error).</p>
                <p>Look for the <strong>"Elbow"</strong> where adding more clusters doesn't significantly reduce error anymore.</p>
            </div>
            
            <button @click="points = generatePoints(); computeElbow()" 
                    class="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded text-sm transition"
                    :disabled="isComputing">
                {{ isComputing ? 'Computing...' : 'New Random Data' }}
            </button>
        </div>
    </div>
</template>
