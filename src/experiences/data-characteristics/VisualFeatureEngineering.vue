<script setup>
import { ref, onMounted, watch } from 'vue'

const canvas = ref(null)
const mode = ref('cartesian') // 'cartesian' or 'polar'
const progress = ref(0) // 0 to 1

// Data generation
const points = []
const COUNT = 300

// Generate Concentric Circles
for (let i = 0; i < COUNT; i++) {
    // 50% Inner class (Blue), 50% Outer class (Red)
    const isInner = Math.random() > 0.5
    
    let r, theta
    if (isInner) {
        // Inner circle: radius 0 to 0.3
        r = Math.sqrt(Math.random()) * 0.3
    } else {
        // Outer ring: radius 0.6 to 0.9
        r = 0.6 + Math.sqrt(Math.random()) * 0.3
    }
    theta = Math.random() * Math.PI * 2
    
    // Cartesian limits: -1 to 1
    const x = r * Math.cos(theta)
    const y = r * Math.sin(theta)
    
    points.push({
        x, y, r, theta,
        isInner
    })
}

// Animation
let animationId
const animate = () => {
    const ctx = canvas.value?.getContext('2d')
    if (!ctx) return

    const w = canvas.value.width = canvas.value.offsetWidth
    const h = canvas.value.height = canvas.value.offsetHeight
    
    // Target progress
    const target = mode.value === 'polar' ? 1 : 0
    // Smooth LERP
    progress.value += (target - progress.value) * 0.05
    
    if (Math.abs(target - progress.value) < 0.001) progress.value = target

    ctx.clearRect(0, 0, w, h)
    
    // Margins
    const pad = 40
    const drawW = w - pad * 2
    const drawH = h - pad * 2
    
    // Draw Axis
    ctx.strokeStyle = '#333'
    ctx.beginPath()
    
    // Axis lines transform too? Maybe just static frames for reference
    if (progress.value < 0.5) {
        // Cartesian Frame
        ctx.moveTo(w/2, pad); ctx.lineTo(w/2, h-pad); // Y
        ctx.moveTo(pad, h/2); ctx.lineTo(w-pad, h/2); // X
        ctx.stroke()
        
        ctx.fillStyle = '#666'
        ctx.fillText("X", w-pad+5, h/2)
        ctx.fillText("Y", w/2, pad-5)
    } else {
        // Polar Frame
        ctx.moveTo(pad, h-pad); ctx.lineTo(pad, pad); // Y (Theta) vs X (R) depends on mapping
        ctx.moveTo(pad, h-pad); ctx.lineTo(w-pad, h-pad); // X (R)
        ctx.stroke()
        
        ctx.fillStyle = '#666'
        ctx.fillText("Radius (r)", w-pad/2, h-pad+15)
        ctx.fillText("Angle (θ)", pad, pad-5)
    }

    points.forEach(p => {
        // Cartesian Screen Coords
        // Map -1..1 to screen
        const cx = w/2 + p.x * (drawW/2.2)
        const cy = h/2 - p.y * (drawW/2.2) // Flip Y
        
        // Polar Screen Coords
        // r is 0..1. Map to X axis
        const px = pad + p.r * drawW
        // theta is 0..2PI. Map to Y axis
        const py = h - pad - (p.theta / (Math.PI*2)) * drawH
        
        // Interpolate
        const lx = cx + (px - cx) * progress.value
        const ly = cy + (py - cy) * progress.value
        
        ctx.fillStyle = p.isInner ? '#60a5fa' : '#f87171'
        ctx.beginPath()
        ctx.arc(lx, ly, 4, 0, Math.PI * 2)
        ctx.fill()
    })
    
    // Draw separator line
    const sepAlpha = progress.value
    if (sepAlpha > 0.01) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${sepAlpha})`
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        // Cut at radius 0.45
        const cutX = pad + 0.45 * drawW
        ctx.moveTo(cutX, pad)
        ctx.lineTo(cutX, h-pad)
        ctx.stroke()
        ctx.setLineDash([])
    }

    animationId = requestAnimationFrame(animate)
}

onMounted(() => {
    animate()
})

</script>

<template>
    <div class="flex flex-col h-full bg-black/20 rounded-xl overflow-hidden relative">
        <canvas ref="canvas" class="flex-1 w-full"></canvas>
        
        <div class="absolute bottom-4 left-4 p-4 bg-black/60 backdrop-blur rounded-lg border border-white/10 max-w-sm">
            <div class="flex items-center justify-between mb-2">
                <h3 class="font-bold text-sm">Coordinate Transform</h3>
                <button 
                    @click="mode = mode === 'cartesian' ? 'polar' : 'cartesian'"
                    class="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold transition-colors"
                >
                    Switch to {{ mode === 'cartesian' ? 'Polar' : 'Cartesian' }}
                </button>
            </div>
            <p class="text-xs text-white/70 leading-relaxed" v-if="mode === 'cartesian'">
                In <strong>Cartesian (x, y)</strong>, the blue and red points are in concentric circles. 
                You cannot draw a single straight line to separate them.
            </p>
            <p class="text-xs text-white/70 leading-relaxed" v-else>
                In <strong>Polar (r, θ)</strong>, we map Radius to X and Angle to Y.
                Suddenly, the classes are easily separated by a vertical line!
                This is the power of Feature Engineering.
            </p>
        </div>
    </div>
</template>
