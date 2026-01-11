<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const canvas = ref(null)
const noiseLevel = ref(10) // 0 to 100
const outlierCount = ref(0) // 0 to 20
const sampleSize = ref(50) // 10 to 100

// Generate Data
const generateData = () => {
    const points = []
    const w = canvas.value ? canvas.value.width : 500
    const h = canvas.value ? canvas.value.height : 300
    
    // Base Trend: y = 0.5x + 0.2*h
    // We work in normalized coords 0..1 then map to screen
    
    const count = sampleSize.value
    
    for (let i = 0; i < count; i++) {
        const x = Math.random() // 0..1
        const cleanY = x * 0.6 + 0.2
        
        // Add Noise
        const noise = (Math.random() - 0.5) * (noiseLevel.value / 100) * 0.8
        let y = cleanY + noise
        
        points.push({ x, y, isOutlier: false })
    }
    
    // Add Outliers
    for (let i = 0; i < outlierCount.value; i++) {
        const x = Math.random()
        // Outlier is far from trend. 
        // Trend is roughly diagonal. So (0,1) or (1,0) are far.
        const y = Math.random() > 0.5 ? 0.9 : 0.1
        points.push({ x, y, isOutlier: true })
    }
    
    return points
}

// Calculate Regression
const solveLR = (points) => {
    if (points.length < 2) return { m: 0, b: 0, err: 0 }
    
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0
    const n = points.length
    
    for (let p of points) {
        sumX += p.x
        sumY += p.y
        sumXY += p.x * p.y
        sumXX += p.x * p.x
    }
    
    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const b = (sumY - m * sumX) / n
    
    // Calculate MSE
    let totalSqErr = 0
    for (let p of points) {
        const pred = m * p.x + b
        totalSqErr += (p.y - pred) ** 2
    }
    const mse = totalSqErr / n
    
    return { m, b, mse }
}

// Draw Loop
const draw = () => {
    if (!canvas.value) return
    const ctx = canvas.value.getContext('2d')
    const w = canvas.value.width = canvas.value.offsetWidth
    const h = canvas.value.height = canvas.value.offsetHeight
    
    const points = generateData()
    const model = solveLR(points)
    
    ctx.clearRect(0,0,w,h)
    
    // Config
    const margin = 40
    const drawW = w - margin*2
    const drawH = h - margin*2
    
    const toScreen = (p) => ({
        x: margin + p.x * drawW,
        y: h - margin - p.y * drawH
    })
    
    // Draw Axis
    ctx.strokeStyle = '#333'
    ctx.beginPath()
    ctx.moveTo(margin, h-margin); ctx.lineTo(margin, margin)
    ctx.moveTo(margin, h-margin); ctx.lineTo(w-margin, h-margin)
    ctx.stroke()
    
    // Draw Points
    points.forEach(p => {
        const pos = toScreen(p)
        ctx.fillStyle = p.isOutlier ? '#f87171' : '#60a5fa'
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, p.isOutlier ? 6 : 4, 0, Math.PI*2)
        ctx.fill()
    })
    
    // Draw Regression Line
    ctx.strokeStyle = '#34d399' // Emerald 400
    ctx.lineWidth = 4
    ctx.beginPath()
    const p1 = toScreen({ x: 0, y: model.b })
    const p2 = toScreen({ x: 1, y: model.m * 1 + model.b })
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()
    
    // Draw Ideal Line (Ground Truth)
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 2
    ctx.setLineDash([5,5])
    ctx.beginPath()
    const t1 = toScreen({ x: 0, y: 0.2 })
    const t2 = toScreen({ x: 1, y: 0.8 })
    ctx.moveTo(t1.x, t1.y)
    ctx.lineTo(t2.x, t2.y)
    ctx.stroke()
    
    // Update Stats
    return model
}

const stats = ref({ mse: 0 })

// Since we generate random data every frame, it might jitter too much.
// Better to generate data on change, and just animate/draw.
// Let's refactor to separate State from Draw
const currentPoints = ref([])
const currentModel = ref({m:0, b:0, mse:0})

const updateData = () => {
    currentPoints.value = generateData()
    currentModel.value = solveLR(currentPoints.value)
}

const render = () => {
     if (!canvas.value) return
    const ctx = canvas.value.getContext('2d')
    const w = canvas.value.width = canvas.value.offsetWidth
    const h = canvas.value.height = canvas.value.offsetHeight
    
    ctx.clearRect(0,0,w,h)
    
     // Config
    const margin = 40
    const drawW = w - margin*2
    const drawH = h - margin*2
    
     const toScreen = (p) => ({
        x: margin + p.x * drawW,
        y: h - margin - p.y * drawH
    })
    
    // Reference Line (Ideal)
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 2
    ctx.setLineDash([5,5])
    ctx.beginPath()
    const t1 = toScreen({ x: 0, y: 0.2 })
    const t2 = toScreen({ x: 1, y: 0.8 })
    ctx.moveTo(t1.x, t1.y)
    ctx.lineTo(t2.x, t2.y)
    ctx.stroke()
    ctx.setLineDash([])

    // Points
    currentPoints.value.forEach(p => {
        const pos = toScreen(p)
        ctx.fillStyle = p.isOutlier ? '#ef4444' : '#60a5fa'
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, p.isOutlier ? 6 : 4, 0, Math.PI*2)
        ctx.fill()
    })
    
    // Model Line
    ctx.strokeStyle = '#34d399' // Emerald 400
    ctx.lineWidth = 3
    ctx.beginPath()
    const p1 = toScreen({ x: 0, y: currentModel.value.b })
    const p2 = toScreen({ x: 1, y: currentModel.value.m * 1 + currentModel.value.b })
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()
}

watch([noiseLevel, outlierCount, sampleSize], () => {
    updateData()
    render()
})

onMounted(() => {
    updateData()
    // Need to wait for canvas layout/size?
    setTimeout(render, 100)
    window.addEventListener('resize', render)
})

</script>

<template>
    <div class="flex flex-col md:flex-row h-full gap-4">
        <div class="flex-1 bg-black/20 rounded-xl overflow-hidden relative min-h-[300px]">
            <canvas ref="canvas" class="w-full h-full"></canvas>
            <div class="absolute top-4 left-4 text-xs text-white/50">
                Dotted Line: Ideal Truth<br>
                Green Line: Your Model
            </div>
        </div>
        
        <div class="w-full md:w-64 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-6">
            <div>
                <h3 class="font-bold text-lg mb-4">Data Quality</h3>
                <div class="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div class="text-white/50">Model Error (MSE)</div>
                    <div class="font-mono text-right" :class="currentModel.mse > 0.05 ? 'text-red-400' : 'text-green-400'">
                        {{ currentModel.mse.toFixed(4) }}
                    </div>
                </div>
            </div>
            
            <div class="space-y-4">
                <div class="space-y-2">
                    <div class="flex justify-between text-xs">
                        <span>Noise Level</span>
                        <span class="text-white/50">{{ noiseLevel }}%</span>
                    </div>
                    <input type="range" v-model.number="noiseLevel" min="0" max="100" class="w-full">
                </div>
                
                <div class="space-y-2">
                    <div class="flex justify-between text-xs">
                        <span>Outliers</span>
                        <span class="text-white/50">{{ outlierCount }}</span>
                    </div>
                    <input type="range" v-model.number="outlierCount" min="0" max="20" class="w-full">
                </div>
                
                <div class="space-y-2">
                    <div class="flex justify-between text-xs">
                        <span>Sample Size</span>
                        <span class="text-white/50">{{ sampleSize }}</span>
                    </div>
                    <input type="range" v-model.number="sampleSize" min="10" max="200" class="w-full">
                </div>
            </div>
            
            <div class="mt-auto p-3 bg-white/5 rounded text-xs text-text-muted italic">
                "Garbage In, Garbage Out": <br>
                Even the best algorithm (Linear Regression) fails if the data is full of noise or outliers.
            </div>
        </div>
    </div>
</template>
