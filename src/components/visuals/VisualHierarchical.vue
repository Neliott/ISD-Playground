<script setup>
import { onMounted, ref, onUnmounted } from 'vue'

const canvas = ref(null)
let animationId = null

// Initial points
const points = []
for(let i=0; i<10; i++) {
    points.push({
        id: i,
        x: 0.1 + Math.random()*0.8,
        y: 0.1 + Math.random()*0.8,
        cluster: i // Initially each point is its own cluster
    })
}

// History of merges for animation
// A merge: { clusterA, clusterB, newClusterId, time }
const merges = []

const dist = (a, b) => Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2)

// Pre-calculate merges (Dendrogram logic effectively)
// Simple Agglomerative
let currentClusters = points.map(p => ({ id: p.id, points: [p], x: p.x, y: p.y }))
let mergeTime = 0

while (currentClusters.length > 1) {
    let minD = Infinity
    let bestPair = null
    
    // Find closest pair of clusters
    for(let i=0; i<currentClusters.length; i++) {
        for(let j=i+1; j<currentClusters.length; j++) {
            const c1 = currentClusters[i]
            const c2 = currentClusters[j]
            const d = dist(c1, c2) // Centroid distance for simplicity
            if (d < minD) {
                minD = d
                bestPair = [c1, c2]
            }
        }
    }
    
    // Merge
    if (bestPair) {
        const [c1, c2] = bestPair
        mergeTime += 1 // 1 second per merge
        
        // New centroid
        const newX = (c1.x + c2.x) / 2
        const newY = (c1.y + c2.y) / 2
        const newCluster = {
            id: 100 + mergeTime, // unique ID
            points: [...c1.points, ...c2.points],
            x: newX,
            y: newY
        }
        
        merges.push({
            c1: c1,
            c2: c2,
            merged: newCluster,
            time: mergeTime
        })
        
        // Remove old, add new
        currentClusters = currentClusters.filter(c => c !== c1 && c !== c2)
        currentClusters.push(newCluster)
    }
}

const draw = (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const mapX = v => v * w
    const mapY = v => v * h
    
    const now = (Date.now() / 2000) % (merges.length + 2) // Loop animation
    
    // Draw base points
    points.forEach(p => {
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(mapX(p.x), mapY(p.y), 4, 0, Math.PI*2)
        ctx.fill()
    })
    
    // Draw merges
    merges.forEach((m, idx) => {
        if (now > m.time) {
            // Draw connection
            ctx.strokeStyle = `hsl(${idx * 40}, 70%, 50%)`
            ctx.lineWidth = 2
            
            // Draw links from centroid of c1 to centroid of c2 ? 
            // Better: Draw a circle around the group? 
            // Or simple lines connecting the centers of the two merged clusters
            
            ctx.beginPath()
            ctx.moveTo(mapX(m.c1.x), mapY(m.c1.y))
            ctx.lineTo(mapX(m.c2.x), mapY(m.c2.y))
            ctx.stroke()
            
            // Draw circle at merge center indicating "Group"
            ctx.fillStyle = `hsl(${idx * 40}, 70%, 50%, 0.2)`
            ctx.beginPath()
            ctx.arc(mapX(m.merged.x), mapY(m.merged.y), 15 * (idx+1), 0, Math.PI*2) // Growing circle?
            // Actually let's just draw a Hull or Box. Circle is fine for abstract.
            // Radius needs to cover points.
            // Let's approximate radius based on distance
            const r = dist(m.c1, m.c2) * w / 2 * 1.2
            ctx.arc(mapX(m.merged.x), mapY(m.merged.y), Math.max(20, r), 0, Math.PI*2)
            ctx.fill()
        }
    })
    
    // Progress
    ctx.fillStyle = '#fff'
    ctx.font = '14px Inter'
    const step = Math.min(Math.floor(now), merges.length)
    ctx.fillText(`Step: ${step} / ${merges.length}`, 20, 30)
}

onMounted(() => {
    const ctx = canvas.value.getContext('2d')
    const loop = () => {
        if (!canvas.value) return
        const w = canvas.value.width = canvas.value.offsetWidth
        const h = canvas.value.height = canvas.value.offsetHeight
        draw(ctx, w, h)
        animationId = requestAnimationFrame(loop)
    }
    loop()
})

onUnmounted(() => cancelAnimationFrame(animationId))
</script>

<template>
  <div class="w-full h-full bg-slate-900 border border-slate-700 rounded-lg relative">
      <canvas ref="canvas" class="w-full h-full block"></canvas>
      <div class="absolute bottom-4 left-4 text-xs text-slate-400">
          Agglomerative: Recursively merging closest clusters.
      </div>
  </div>
</template>
