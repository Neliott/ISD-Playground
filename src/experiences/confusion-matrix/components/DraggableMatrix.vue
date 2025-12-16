<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const emit = defineEmits(['stats-update'])

const dots = ref([])
const containerRef = ref(null)
const lastDimensions = ref({ w: 0, h: 0 })

// Initial population
function initDots() {
  const newDots = []
  if (!containerRef.value) return 
  const w = containerRef.value.clientWidth
  const h = containerRef.value.clientHeight
  
  lastDimensions.value = { w, h }
  
  
  // 10 Positives, 10 Negatives
  for (let i = 0; i < 10; i++) {
    newDots.push({ 
        id: `p-${i}`, 
        type: 'positive', 
        x: Math.random() * (w * 0.4) + (w * 0.05), // Start leftish
        y: Math.random() * (h * 0.8) + (h * 0.1) 
    })
  }
  for (let i = 0; i < 10; i++) {
    newDots.push({ 
        id: `n-${i}`, 
        type: 'negative', 
        x: Math.random() * (w * 0.4) + (w * 0.55), // Start rightish 
        y: Math.random() * (h * 0.8) + (h * 0.1) 
    })
  }
  dots.value = newDots
  calculateStats()
}

// Drag logic
const draggingId = ref(null)

function startDrag(dot, event) {
  draggingId.value = dot.id
  window.addEventListener('mousemove', handleDrag)
  window.addEventListener('mouseup', stopDrag)
}

function handleDrag(event) {
  if (!draggingId.value) return
  
  const dot = dots.value.find(d => d.id === draggingId.value)
  if (dot && containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // Clamp
    dot.x = Math.max(10, Math.min(rect.width - 10, x))
    dot.y = Math.max(10, Math.min(rect.height - 10, y))
  }
}

function stopDrag() {
  draggingId.value = null
  window.removeEventListener('mousemove', handleDrag)
  window.removeEventListener('mouseup', stopDrag)
  calculateStats()
}

function calculateStats() {
  if (!containerRef.value) return
  const containerRect = containerRef.value.getBoundingClientRect()
  const splitX = containerRect.width / 2
  
  let tp = 0, fp = 0, fn = 0, tn = 0
  
  dots.value.forEach(dot => {
    const isPredictedPositive = dot.x < splitX
    
    if (dot.type === 'positive') {
      if (isPredictedPositive) tp++ 
      else fn++ 
    } else {
      if (isPredictedPositive) fp++ 
      else tn++ 
    }
  })
  
  emit('stats-update', { tp, fp, fn, tn })
}

function handleResize() {
    if (!containerRef.value) return
    
    const w = containerRef.value.clientWidth
    const h = containerRef.value.clientHeight
    
    // Avoid division by zero
    if (lastDimensions.value.w === 0 || lastDimensions.value.h === 0) {
        lastDimensions.value = { w, h }
        return
    }

    const scaleX = w / lastDimensions.value.w
    const scaleY = h / lastDimensions.value.h

    dots.value.forEach(dot => {
        dot.x = dot.x * scaleX
        dot.y = dot.y * scaleY
        
        // Clamp to be safe
        dot.x = Math.max(10, Math.min(w - 10, dot.x))
        dot.y = Math.max(10, Math.min(h - 10, dot.y))
    })

    lastDimensions.value = { w, h }
    calculateStats()
}

onMounted(() => {
    window.addEventListener('resize', handleResize)
    initDots()
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div ref="containerRef" class="w-full h-full relative overflow-hidden bg-background" :class="{ 'cursor-grabbing select-none': draggingId }">
      
     <!-- Zone Split Visuals -->
     <div class="absolute inset-0 flex pointer-events-none">
        <!-- Predicted Positive (Left) -->
        <div class="flex-1 bg-success/5 border-r border-white/10 flex flex-col items-center pt-20">
            <h3 class="text-4xl font-bold text-success/20 uppercase tracking-widest mb-4">Predicted Positive</h3>
            <div class="text-9xl text-success/5 font-black">+</div>
        </div>
        <!-- Predicted Negative (Right) -->
        <div class="flex-1 bg-accent/5 flex flex-col items-center pt-20">
            <h3 class="text-4xl font-bold text-accent/20 uppercase tracking-widest mb-4">Predicted Negative</h3>
             <div class="text-9xl text-accent/5 font-black">-</div>
        </div>
     </div>

      <!-- Dots -->
      <div 
        v-for="dot in dots" 
        :key="dot.id"
        class="absolute w-8 h-8 rounded-full shadow-lg border-2 cursor-grab active:cursor-grabbing hover:scale-110 flex items-center justify-center z-10 transition-transform duration-75 ease-out"
        :class="dot.type === 'positive' ? 'bg-blue-600 border-blue-700 shadow-blue-900/40 text-white' : 'bg-white border-slate-200 shadow-slate-200/50 text-blue-900'"
        :style="{ left: `${dot.x}px`, top: `${dot.y}px`, transform: 'translate(-50%, -50%)' }"
        @mousedown.stop="startDrag(dot, $event)"
      >
        <span class="text-sm font-black pointer-events-none select-none">
          {{ dot.type === 'positive' ? '+' : '-' }}
        </span>
      </div>
      
      <div class="hidden md:block absolute bottom-8 w-full text-center text-white/20 select-none pointer-events-none">
          Left Side: Model predicts "YES" • Right Side: Model predicts "NO"
      </div>
  </div>
</template>
