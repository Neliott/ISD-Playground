<script setup>
import { ref, onMounted, watch } from 'vue'

const canvasOriginal = ref(null)
const canvasQuantized = ref(null)
const k = ref(4)
const isProcessing = ref(false)

// Generate a colorful "Parrot-like" image on canvas
const drawTestImage = (ctx, w, h) => {
    // Background (Green leaves)
    ctx.fillStyle = '#166534'
    ctx.fillRect(0, 0, w, h)
    
    // Random Leaves
    for(let i=0; i<50; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#15803d' : '#22c55e'
        ctx.beginPath()
        ctx.arc(Math.random()*w, Math.random()*h, Math.random()*20+10, 0, Math.PI*2)
        ctx.fill()
    }
    
    // Parrot Body (Red)
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.ellipse(w/2, h/2, 60, 100, -0.2, 0, Math.PI*2)
    ctx.fill()
    
    // Wing (Blue/Yellow)
    ctx.fillStyle = '#3b82f6'
    ctx.beginPath()
    ctx.ellipse(w/2+10, h/2+20, 30, 60, 0.5, 0, Math.PI*2)
    ctx.fill()
    
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.ellipse(w/2+20, h/2+40, 20, 50, 0.6, 0, Math.PI*2)
    ctx.fill()
    
    // Head
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(w/2-20, h/2-60, 40, 0, Math.PI*2)
    ctx.fill()
    
    // Beak
    ctx.fillStyle = '#1f2937'
    ctx.beginPath()
    ctx.moveTo(w/2-50, h/2-50)
    ctx.lineTo(w/2-20, h/2-70)
    ctx.lineTo(w/2-20, h/2-40)
    ctx.fill()
    
    // Eye
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(w/2-35, h/2-65, 8, 0, Math.PI*2)
    ctx.fill()
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(w/2-37, h/2-65, 3, 0, Math.PI*2)
    ctx.fill()
}

const processImage = async () => {
    if (!canvasOriginal.value || !canvasQuantized.value) return
    isProcessing.value = true
    
    // Allow UI to update
    await new Promise(r => setTimeout(r, 50))
    
    const ctxOr = canvasOriginal.value.getContext('2d')
    const ctxQu = canvasQuantized.value.getContext('2d')
    const w = canvasOriginal.value.width
    const h = canvasOriginal.value.height
    
    // 1. Extract Pixels
    const imageData = ctxOr.getImageData(0, 0, w, h)
    const pixels = imageData.data // [r, g, b, a, r, g, b, a ...]
    
    // 2. Prepare Training Data (Subsample for speed)
    // Take 1000 random pixels
    const uniqueColors = new Set()
    const trainingData = []
    const pixelCount = w * h
    
    for(let i=0; i<1000; i++) {
        const idx = Math.floor(Math.random() * pixelCount) * 4
        // ignore alpha for now
        trainingData.push({
            r: pixels[idx],
            g: pixels[idx+1],
            b: pixels[idx+2]
        })
    }
    
    // 3. K-Means
    let centroids = []
    // Random init
    for(let i=0; i<k.value; i++) {
        const p = trainingData[Math.floor(Math.random() * trainingData.length)]
        centroids.push({ ...p })
    }
    
    for(let iter=0; iter<10; iter++) { // 10 iterations usually enough for color
        const assignments = trainingData.map(p => {
             let minD = Infinity
             let idx = -1
             centroids.forEach((c, i) => {
                 const d = (p.r-c.r)**2 + (p.g-c.g)**2 + (p.b-c.b)**2
                 if (d < minD) { minD = d; idx = i }
             })
             return idx
        })
        
        // Update
        const sums = centroids.map(() => ({r:0, g:0, b:0, count:0}))
        assignments.forEach((cIdx, pIdx) => {
            const p = trainingData[pIdx]
            sums[cIdx].r += p.r
            sums[cIdx].g += p.g
            sums[cIdx].b += p.b
            sums[cIdx].count++
        })
        
        centroids = sums.map((s, i) => {
            if (s.count === 0) return centroids[i]
            return { r: s.r/s.count, g: s.g/s.count, b: s.b/s.count }
        })
    }
    
    // 4. Quantize Image
    const newImageData = ctxQu.createImageData(w, h)
    for(let i=0; i<pixels.length; i+=4) {
        const r = pixels[i]
        const g = pixels[i+1]
        const b = pixels[i+2]
        
        // Find nearest centroid
        let minD = Infinity
        let bestC = centroids[0]
        
        for(let c of centroids) {
            const d = (r-c.r)**2 + (g-c.g)**2 + (b-c.b)**2
            if (d < minD) { minD = d; bestC = c }
        }
        
        newImageData.data[i] = bestC.r
        newImageData.data[i+1] = bestC.g
        newImageData.data[i+2] = bestC.b
        newImageData.data[i+3] = 255
    }
    
    ctxQu.putImageData(newImageData, 0, 0)
    isProcessing.value = false
}

onMounted(() => {
    // Init Canvas
    const w = 300, h = 300
    canvasOriginal.value.width = w
    canvasOriginal.value.height = h
    canvasQuantized.value.width = w
    canvasQuantized.value.height = h
    
    const ctx = canvasOriginal.value.getContext('2d')
    drawTestImage(ctx, w, h)
    
    // Initial Process
    processImage()
})

watch(k, () => {
    processImage()
})

</script>

<template>
    <div class="flex flex-col h-full bg-white/5 border border-white/10 rounded-xl p-4 gap-4">
        <div class="flex justify-between items-center">
            <h3 class="font-bold">Image Compression</h3>
            <div class="flex items-center gap-4">
                <span class="text-sm">K = {{ k }} Colors</span>
                <input type="range" v-model.number="k" min="2" max="16" step="1" class="w-32" :disabled="isProcessing">
            </div>
        </div>
        
        <div class="flex flex-col md:flex-row gap-4 items-center justify-center flex-1">
            
            <div class="relative group">
                <canvas ref="canvasOriginal" class="rounded-lg shadow-lg border border-white/20 bg-black"></canvas>
                <div class="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs">Original (Thousands of Colors)</div>
            </div>
            
            <div class="text-2xl text-white/50">→</div>
            
            <div class="relative group">
                 <canvas ref="canvasQuantized" class="rounded-lg shadow-lg border border-white/20 bg-black"></canvas>
                 <div class="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs" :class="isProcessing ? 'animate-pulse text-yellow-400' : ''">
                    {{ isProcessing ? 'Compressing...' : `Quantized (${k} Colors)` }}
                 </div>
                 
                 <!-- Centroid Palette Visualization -->
                 <div class="absolute -right-4 top-4 flex flex-col gap-1">
                     <!-- This would need access to centroids again, skipping for simplicity unless requested -->
                 </div>
            </div>
        </div>
        
        <p class="text-center text-xs text-white/40">
            We find {{ k }} 'prototype' colors using K-Means, then replace every pixel with its nearest prototype.
        </p>
    </div>
</template>
