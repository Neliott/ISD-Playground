<script setup>
import { onMounted, ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  step: {
    type: String, // 'init' | 'pick' | 'find' | 'update' | 'loop'
    default: 'init'
  }
})

const canvas = ref(null)
let animationId = null

// --- Data & State ---
// Fixed random seed effect by hardcoding values for consistency across slides
const dataPoints = [
  { x: 0.2, y: 0.3, class: 'red' },
  { x: 0.25, y: 0.2, class: 'red' },
  { x: 0.15, y: 0.4, class: 'red' },
  { x: 0.3, y: 0.35, class: 'red' }, // The "Teacher" point
  { x: 0.22, y: 0.45, class: 'red' },
  
  { x: 0.7, y: 0.7, class: 'blue' },
  { x: 0.75, y: 0.6, class: 'blue' },
  { x: 0.8, y: 0.75, class: 'blue' },
  { x: 0.65, y: 0.65, class: 'blue' },
  { x: 0.72, y: 0.55, class: 'blue' },
]

// Prominent "Teacher" point index
const teacherIndex = 3 

// Initial Prototypes
const proto1 = { x: 0.5, y: 0.4, class: 'red', label: 'P1' }
const proto2 = { x: 0.6, y: 0.3, class: 'blue', label: 'P2' }

const draw = (ctx, width, height, time) => {
  ctx.clearRect(0, 0, width, height)
  
  // Scales
  const sx = (v) => v * width
  const sy = (v) => v * height

  // --- 1. Draw Data Points ---
  dataPoints.forEach((p, i) => {
    let alpha = 1
    let radius = 4
    
    if (props.step === 'pick' || props.step === 'find' || props.step === 'update') {
       if (i !== teacherIndex) alpha = 0.2 // Fade others
    }
    
    if (i === teacherIndex && props.step !== 'init') {
        radius = 8 // Highlight teacher
    }

    ctx.fillStyle = p.class === 'red' ? `rgba(239, 68, 68, ${alpha})` : `rgba(59, 130, 246, ${alpha})`
    ctx.beginPath()
    ctx.arc(sx(p.x), sy(p.y), radius, 0, Math.PI * 2)
    ctx.fill()
    
    // Label Teacher
    if (i === teacherIndex && (props.step === 'pick' || props.step === 'find')) {
        ctx.fillStyle = '#fff'
        ctx.font = '12px Inter'
        ctx.fillText('Teacher', sx(p.x) + 12, sy(p.y) + 4)
    }
  })

  // --- 2. Draw Prototypes ---
  const drawProto = (p, isWinner = false) => {
    ctx.fillStyle = p.class === 'red' ? '#ef4444' : '#3b82f6'
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    
    let x = sx(p.x)
    let y = sy(p.y)

    // Animation for update step
    if (props.step === 'update' && isWinner) {
        // Teacher is RED. 
        // Proto1 is RED. So P1 (Winner) should move TOWARDS teacher.
        const teacher = dataPoints[teacherIndex]
        const progress = (Math.sin(time * 0.003) + 1) / 2 // 0 to 1 loop
        
        const tx = sx(teacher.x)
        const ty = sy(teacher.y)
        
        // Lerp
        x = x + (tx - x) * 0.3 * progress
        y = y + (ty - y) * 0.3 * progress
        
        // Draw dashed line to target
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'
        ctx.setLineDash([5,5])
        ctx.beginPath(); ctx.moveTo(sx(p.x), sy(p.y)); ctx.lineTo(tx, ty); ctx.stroke(); ctx.setLineDash([])
    }

    ctx.strokeStyle = '#fff'
    
    if (isWinner && props.step === 'find') {
        ctx.lineWidth = 4
        ctx.shadowColor = '#fff'
        ctx.shadowBlur = 10
    } else {
         ctx.shadowBlur = 0
    }

    ctx.beginPath()
    ctx.arc(x, y, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.shadowBlur = 0 // Reset
    
    // Label
    if (props.step === 'init') {
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 12px Inter'
        ctx.textAlign = 'center'
        ctx.fillText(p.label, x, y - 15)
    }
  }

  // Logic to find winner (Teacher is Red)
  // Teacher (0.3, 0.35)
  // P1 (0.5, 0.4) -> Dist ~0.2
  // P2 (0.6, 0.3) -> Dist ~0.3
  // P1 is closer. P1 is Red. Teacher is Red. -> Attraction.
  
  drawProto(proto1, true) // P1 is the winner for this specific setup
  drawProto(proto2, false)

  // --- 3. Step Specifics ---
  
  // LOOP Step: Converge to centers
  if (props.step === 'loop') {
      const redCenter = { x: 0.22, y: 0.35 }
      const blueCenter = { x: 0.72, y: 0.64 }
      
      const t = Math.min((time % 5000) / 3000, 1) // 3s animation, loops every 5s
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // Ease in out
      
      // Override Proto positions for this step
      const lerp = (start, end, amt) => start + (end - start) * amt
      
      // P1 (Red) moves to Red Center
      proto1.x = lerp(0.5, redCenter.x, ease)
      proto1.y = lerp(0.4, redCenter.y, ease)
      
      // P2 (Blue) moves to Blue Center
      proto2.x = lerp(0.6, blueCenter.x, ease)
      proto2.y = lerp(0.3, blueCenter.y, ease)
      
      // Draw "Epoch" text
      ctx.fillStyle = '#fff'
      ctx.font = '14px Inter'
      ctx.textAlign = 'center'
      const epoch = Math.floor(t * 100)
      ctx.fillText(`Epochs: ${epoch}`, width / 2, 30)
  }

  // FIND Step: Draw lines
  if (props.step === 'find') {
     const t = dataPoints[teacherIndex]
     const p1 = proto1
     const p2 = proto2
     
     // Line to P1
     ctx.strokeStyle = '#4ade80' // Green (Winner)
     ctx.lineWidth = 2
     ctx.beginPath()
     ctx.moveTo(sx(t.x), sy(t.y))
     ctx.lineTo(sx(p1.x), sy(p1.y))
     ctx.stroke()
     
     // Text Dist
     ctx.fillStyle = '#4ade80'
     ctx.fillText('d1 (Winner)', (sx(t.x)+sx(p1.x))/2, (sy(t.y)+sy(p1.y))/2 - 10)

     // Line to P2
     ctx.strokeStyle = 'rgba(255,255,255,0.2)'
     ctx.lineWidth = 1
     ctx.beginPath()
     ctx.moveTo(sx(t.x), sy(t.y))
     ctx.lineTo(sx(p2.x), sy(p2.y))
     ctx.stroke()
  }
}

onMounted(() => {
  const ctx = canvas.value.getContext('2d')
  let start = Date.now()
  
  const tick = () => {
    if (!canvas.value) return
    const w = canvas.value.width = canvas.value.offsetWidth
    const h = canvas.value.height = canvas.value.offsetHeight
    draw(ctx, w, h, Date.now() - start)
    animationId = requestAnimationFrame(tick)
  }
  tick()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})
</script>

<template>
  <canvas ref="canvas" class="w-full h-full block"></canvas>
</template>
