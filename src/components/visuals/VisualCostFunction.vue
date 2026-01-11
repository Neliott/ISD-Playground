<script setup>
import { onMounted, ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  step: {
    type: String, 
    default: 'surface' // 'surface' | 'gradient' | 'min'
  }
})

const canvas = ref(null)
let animationId = null

onMounted(() => {
  const ctx = canvas.value.getContext('2d')
  let rot = 0

  const draw = () => {
    if (!canvas.value) return
    const w = canvas.value.width = canvas.value.offsetWidth
    const h = canvas.value.height = canvas.value.offsetHeight
    const cx = w / 2
    const cy = h / 2

    // Simple 3D projection
    // Z = Cost, X = m, Y = b
    const project = (x, y, z) => {
      const scale = 200
      // Rotate around Y axis
      const rx = x * Math.cos(rot) - z * Math.sin(rot)
      const rz = x * Math.sin(rot) + z * Math.cos(rot)
      
      // Iso-ish projection
      const px = cx + (rx - y) * Math.cos(30 * Math.PI/180) * 0.7 * scale
      const py = cy + (rx + y) * Math.sin(30 * Math.PI/180) * 0.7 * scale - (z * scale * 0.5)
      return { x: px, y: py, depth: rz }
    }

    // Cost Function Surface J(m, b) = m^2 + b^2 (Paraboloid)
    const cost = (m, b) => (m*m + b*b) * 0.5

    ctx.clearRect(0, 0, w, h)
    
    // Draw Grid (The "Bowl")
    const steps = 15
    const range = 1.2
    
    // Draw lines along X (m)
    ctx.lineWidth = 1
    
    const drawLine = (p1, p2, color) => {
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = color
        ctx.stroke()
    }

    // Grid points
    const points = []
    for(let i = -steps; i <= steps; i++) {
        for(let j = -steps; j <= steps; j++) {
            const m = (i / steps) * range
            const b = (j / steps) * range
            const z = cost(m, b)
            points.push({ m, b, z, proj: project(m, b, z) })
        }
    }

    // Connect them
    // Simple wireframe drawing
    points.forEach((p, index) => {
        // Line to right
        if (index % (2 * steps + 1) !== 2 * steps) {
           const right = points[index + 1]
           // Depth check for simplified opacity (fog)
           const alpha = (p.proj.depth + 2) / 4
           drawLine(p.proj, right.proj, `rgba(255, 255, 255, ${Math.max(0.1, alpha * 0.3)})`)
        }
        // Line to bottom
        if (index + (2 * steps + 1) < points.length) {
            const bottom = points[index + (2 * steps + 1)]
             const alpha = (p.proj.depth + 2) / 4
            drawLine(p.proj, bottom.proj, `rgba(255, 255, 255, ${Math.max(0.1, alpha * 0.3)})`)
        }
    })

    // Draw Minimum
    if (props.step === 'min' || props.step === 'gradient') {
        const center = project(0, 0, 0)
        ctx.fillStyle = '#4ade80'
        ctx.shadowColor = '#4ade80'
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(center.x, center.y, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.fillStyle = '#fff'
        ctx.fillText('Minimum (Global Optima)', center.x + 10, center.y)
    }

    // Animate "Ball" rolling down
    if (props.step === 'gradient') {
       const time = Date.now() / 1000
       const loopT = time % 2
       
       // Starting point (High cost)
       const startM = 1
       const startB = 1
       
       // Lerp to 0,0
       const currM = startM * (1 - loopT/2)
       const currB = startB * (1 - loopT/2)
       const currZ = cost(currM, currB)
       
       const ball = project(currM, currB, currZ)
       
       ctx.fillStyle = '#facc15'
       ctx.shadowColor = '#facc15'
       ctx.shadowBlur = 15
       ctx.beginPath()
       ctx.arc(ball.x, ball.y, 8, 0, Math.PI * 2)
       ctx.fill()
       ctx.shadowBlur = 0
    }

    rot += 0.005
    animationId = requestAnimationFrame(draw)
  }
  
  draw()
})

onUnmounted(() => cancelAnimationFrame(animationId))
</script>

<template>
  <div class="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
    <canvas ref="canvas" class="block w-full h-full"></canvas>
    <div class="absolute bottom-4 left-4 bg-black/50 p-2 rounded text-xs text-white backdrop-blur">
        <p>J(m, b) Cost Surface</p>
        <p class="text-text-muted">Vertical axis = Error Magnitude</p>
    </div>
  </div>
</template>
