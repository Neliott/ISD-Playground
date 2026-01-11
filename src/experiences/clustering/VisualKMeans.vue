<script setup>
import { ref, onMounted, computed, watch } from 'vue'

const props = defineProps({
    isEmbedded: { type: Boolean, default: false }
})

const canvas = ref(null)
const k = ref(3)
const initMethod = ref('random') // 'random' | 'kmeans++'
const stepState = ref('init') // 'init' | 'assign' | 'update' | 'converged'
const points = ref([])
const centroids = ref([])
const iteration = ref(0)
const history = ref([]) // To detect convergence
const isAutoRunning = ref(false)

// Colors for clusters
const colors = [
    '#f87171', // Red
    '#34d399', // Emerald
    '#60a5fa', // Blue
    '#fbbf24', // Amber
    '#a78bfa', // Violet
    '#ec4899', // Pink
]

// Generate Dataset
const generateData = () => {
    points.value = []
    centroids.value = []
    stepState.value = 'init'
    iteration.value = 0
    history.value = []
    isAutoRunning.value = false
    
    // Create blobs
    const blobs = [
        { x: 0.3, y: 0.3, r: 0.15 },
        { x: 0.7, y: 0.3, r: 0.15 },
        { x: 0.5, y: 0.7, r: 0.2 },
        { x: 0.2, y: 0.8, r: 0.1 }
    ]
    
    for (let i = 0; i < 300; i++) {
        const blob = blobs[Math.floor(Math.random() * blobs.length)]
        const angle = Math.random() * Math.PI * 2
        const dist = Math.sqrt(Math.random()) * blob.r
        
        points.value.push({
            x: blob.x + Math.cos(angle) * dist,
            y: blob.y + Math.sin(angle) * dist,
            cluster: -1 // Unassigned
        })
    }
    render()
}

// Distance Metric
const distSq = (p1, p2) => (p1.x - p2.x)**2 + (p1.y - p2.y)**2

// Initialize Centroids
const initializeCentroids = () => {
    centroids.value = []
    const availablePoints = [...points.value]
    
    if (initMethod.value === 'random') {
        for (let i = 0; i < k.value; i++) {
            const idx = Math.floor(Math.random() * availablePoints.length)
            const p = availablePoints.splice(idx, 1)[0]
            centroids.value.push({ x: p.x, y: p.y, color: colors[i % colors.length] })
        }
    } else {
        // K-Means++
        // 1. Choose first center uniformly at random
        let idx = Math.floor(Math.random() * availablePoints.length)
        let p = availablePoints[idx] // Don't remove for calculation, just pick
        centroids.value.push({ x: p.x, y: p.y, color: colors[0] })
        
        // 2. Choose others
        for (let i = 1; i < k.value; i++) {
            // Calculate dist^2 to nearest existing center for all points
            let sumDistSq = 0
            const dists = points.value.map(pt => {
                let minD = Infinity
                for (let c of centroids.value) {
                    const d = distSq(pt, c)
                    if (d < minD) minD = d
                }
                sumDistSq += minD
                return minD
            })
            
            // Weighted random selection
            let r = Math.random() * sumDistSq
            let nextCenterIdx = -1
            for (let j = 0; j < dists.length; j++) {
                r -= dists[j]
                if (r <= 0) {
                    nextCenterIdx = j
                    break
                }
            }
            // Fallback (rounding errors)
            if (nextCenterIdx === -1) nextCenterIdx = dists.length - 1
            
            p = points.value[nextCenterIdx]
            centroids.value.push({ x: p.x, y: p.y, color: colors[i % colors.length] })
        }
    }
    
    stepState.value = 'assign'
    render()
}

// Step 1: Assign Points
const assignPoints = () => {
    let changed = false
    points.value.forEach(p => {
        let minD = Infinity
        let cluster = -1
        
        centroids.value.forEach((c, idx) => {
            const d = distSq(p, c)
            if (d < minD) {
                minD = d
                cluster = idx
            }
        })
        
        if (p.cluster !== cluster) changed = true
        p.cluster = cluster
    })
    
    stepState.value = 'update'
    render()
    return changed
}

// Step 2: Update Centroids
const updateCentroids = () => {
    // Record history for convergence check (simple heuristic: position change)
    const oldCentroids = JSON.stringify(centroids.value)
    
    centroids.value.forEach((c, idx) => {
        const clusterPoints = points.value.filter(p => p.cluster === idx)
        if (clusterPoints.length > 0) {
            let sx = 0, sy = 0
            clusterPoints.forEach(p => { sx += p.x; sy += p.y })
            c.x = sx / clusterPoints.length
            c.y = sy / clusterPoints.length
        } 
        // If empty cluster, keep centroid there (or re-init?) - Standard K-means often leaves it or re-inits. We'll leave it.
    })
    
    stepState.value = 'assign'
    iteration.value++
    
    const newCentroids = JSON.stringify(centroids.value)
    if (oldCentroids === newCentroids) {
        stepState.value = 'converged'
        isAutoRunning.value = false
    }
    
    render()
}

// Auto Run
const toggleAutoObj = ref(null)
const toggleAuto = () => {
    if (isAutoRunning.value) {
        isAutoRunning.value = false
        clearTimeout(toggleAutoObj.value)
    } else {
        isAutoRunning.value = true
        runAutoStep()
    }
}

const runAutoStep = () => {
    if (!isAutoRunning.value) return
    
    if (stepState.value === 'init') {
        initializeCentroids()
        toggleAutoObj.value = setTimeout(runAutoStep, 500)
    } else if (stepState.value === 'assign') {
        assignPoints()
        toggleAutoObj.value = setTimeout(runAutoStep, 500)
    } else if (stepState.value === 'update') {
        updateCentroids()
        toggleAutoObj.value = setTimeout(runAutoStep, 500)
    } else if (stepState.value === 'converged') {
        isAutoRunning.value = false
    }
}

// Render
const render = () => {
    if (!canvas.value) return
    const ctx = canvas.value.getContext('2d')
    const w = canvas.value.width = canvas.value.offsetWidth
    const h = canvas.value.height = canvas.value.offsetHeight
    
    ctx.clearRect(0,0,w,h)
    
    // Config
    const margin = 20
    const drawW = w - margin*2
    const drawH = h - margin*2
    
    const toScreen = (p) => ({
        x: margin + p.x * drawW,
        y: h - margin - p.y * drawH
    })
    
     // Draw Voronoi / Background hints (Optional simple version: color nearest pixels? Too slow. Skip for now.)
     
     // Draw Points
     points.value.forEach(p => {
         const pos = toScreen(p)
         ctx.fillStyle = p.cluster === -1 ? '#555' : centroids.value[p.cluster].color
         ctx.beginPath()
         ctx.arc(pos.x, pos.y, 4, 0, Math.PI*2)
         ctx.fill()
     })
     
     // Draw Centroids
     centroids.value.forEach((c, idx) => {
         const pos = toScreen(c)
         
         // Glow
         ctx.fillStyle = c.color + '44' // Transparent
         ctx.beginPath()
         ctx.arc(pos.x, pos.y, 15, 0, Math.PI*2)
         ctx.fill()
         
         // Cross
         ctx.strokeStyle = '#fff'
         ctx.lineWidth = 3
         ctx.beginPath()
         ctx.moveTo(pos.x - 8, pos.y - 8); ctx.lineTo(pos.x + 8, pos.y + 8)
         ctx.moveTo(pos.x + 8, pos.y - 8); ctx.lineTo(pos.x - 8, pos.y + 8)
         ctx.stroke()
         
         // Label
         ctx.fillStyle = '#fff'
         ctx.font = '10px sans-serif'
         ctx.fillText(`C${idx+1}`, pos.x + 10, pos.y - 10)
     })
}

onMounted(() => {
    generateData()
    // Handle resize
    window.addEventListener('resize', render)
    setTimeout(render, 100)
})

watch(k, generateData) // Reset if K changes

</script>

<template>
    <div class="flex flex-col h-full gap-4">
        <!-- Canvas Area -->
        <div class="flex-1 bg-black/20 rounded-xl overflow-hidden relative min-h-[300px]">
            <canvas ref="canvas" class="w-full h-full cursor-crosshair"></canvas>
            
            <!-- Floating Stats -->
            <div class="absolute top-4 left-4 flex gap-2">
                <div class="px-3 py-1 bg-black/50 backdrop-blur rounded text-xs border border-white/10">
                    Iteration: {{ iteration }}
                </div>
                <div class="px-3 py-1 bg-black/50 backdrop-blur rounded text-xs border border-white/10" 
                     :class="stepState === 'converged' ? 'text-green-400 border-green-500/50' : 'text-yellow-400'">
                    State: {{ stepState.toUpperCase() }}
                </div>
            </div>
        </div>
        
        <!-- Controls -->
        <div class="bg-white/5 border border-white/10 rounded-xl p-4">
            <div class="flex flex-wrap items-center justify-between gap-4">
                
                <!-- config -->
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-bold">K:</span>
                        <select v-model.number="k" class="bg-black/30 border border-white/20 rounded px-2 py-1 text-sm">
                            <option v-for="i in 5" :key="i" :value="i+1">{{ i+1 }}</option>
                        </select>
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-bold">Init:</span>
                        <select v-model="initMethod" class="bg-black/30 border border-white/20 rounded px-2 py-1 text-sm">
                            <option value="random">Random</option>
                            <option value="kmeans++">K-Means++</option>
                        </select>
                    </div>
                    
                    <button @click="generateData" class="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm transition">
                        Reset Data
                    </button>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex items-center gap-2">
                    <template v-if="stepState === 'init'">
                        <button @click="initializeCentroids" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold shadow-lg shadow-blue-900/50 transition">
                            Initialize Centroids
                        </button>
                    </template>
                    
                    <template v-else-if="stepState !== 'converged'">
                        <button @click="stepState === 'assign' ? assignPoints() : updateCentroids()" 
                                class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold shadow-lg shadow-blue-900/50 transition flex items-center gap-2"
                                :disabled="isAutoRunning">
                            <span>Step: {{ stepState === 'assign' ? 'Assign Points' : 'Update Centroids' }}</span>
                            <span class="text-xs text-white/50">(Manual)</span>
                        </button>
                    </template>
                    
                    <button @click="toggleAuto" 
                            class="px-4 py-2 rounded font-bold border border-white/20 hover:bg-white/10 transition"
                            :class="isAutoRunning ? 'bg-red-500/20 text-red-200 border-red-500/50' : ''">
                        {{ isAutoRunning ? 'Stop Auto' : (stepState === 'converged' ? 'Restart' : 'Auto Run') }}
                    </button>
                    
                     <div v-if="stepState === 'converged'" class="text-green-400 font-bold ml-2 animate-pulse">
                        Converged!
                    </div>
                </div>
            </div>
            
            <div class="mt-3 text-xs text-white/40">
                K-Means Algorithm: 1. Place K Centroids. 2. Assign points to nearest centroid. 3. Move centroid to average of its points. 4. Repeat.
            </div>
        </div>
    </div>
</template>
