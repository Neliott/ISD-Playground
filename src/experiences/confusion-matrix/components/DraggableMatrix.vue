<script setup>
import { ref, onMounted, computed, watch } from 'vue'

const emit = defineEmits(['stats-update'])

// Dots: { id, type: 'positive' | 'negative', x, y }
// Positive (Green) = Class 1
// Negative (Red) = Class 0
const dots = ref([])
const containerRef = ref(null)
const matrixRef = ref(null)

// Initial population
function initDots() {
  const newDots = []
  // 10 Positives, 10 Negatives
  for (let i = 0; i < 10; i++) {
    newDots.push({ id: `p-${i}`, type: 'positive', x: Math.random() * 50 + 20, y: Math.random() * 50 + 20 })
  }
  for (let i = 0; i < 10; i++) {
    newDots.push({ id: `n-${i}`, type: 'negative', x: Math.random() * 50 + 20, y: Math.random() * 50 + 200 })
  }
  dots.value = newDots
}

// Drag logic
const draggingId = ref(null)
const dragOffset = ref({ x: 0, y: 0 })

function startDrag(dot, event) {
  draggingId.value = dot.id
  dragOffset.value = {
    x: event.clientX - dot.x,
    y: event.clientY - dot.y
  }
  window.addEventListener('mousemove', handleDrag)
  window.addEventListener('mouseup', stopDrag)
}

function handleDrag(event) {
  if (!draggingId.value) return
  
  const dot = dots.value.find(d => d.id === draggingId.value)
  if (dot && containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    // Relative coordinates within the container
    let newX = event.clientX - rect.left - rect.width * 0.0 // Simplified
    let newY = event.clientY - rect.top
    
    // Clamp to container
    // Actually we store absolute screen coords or relative to container?
    // Let's store relative pixel coords for simplicity in this view
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // Clamp
    dot.x = Math.max(0, Math.min(rect.width, x))
    dot.y = Math.max(0, Math.min(rect.height, y))
  }
}

function stopDrag() {
  draggingId.value = null
  window.removeEventListener('mousemove', handleDrag)
  window.removeEventListener('mouseup', stopDrag)
  calculateStats()
}

function calculateStats() {
  if (!matrixRef.value) return

  const rect = matrixRef.value.getBoundingClientRect()
  const midX = rect.width / 2
  const midY = rect.height / 2
  
  // Matrix Structure:
  //         | Pred + (Left) | Pred - (Right) |
  // Actual +| TP            | FN             |
  // Actual -| FP            | TN             |
  
  // Wait, standard matrix usually:
  // Columns: Predicted
  // Rows: Actual
  // Let's create visual zones.
  
  let tp = 0, fp = 0, fn = 0, tn = 0
  
  // Define zones based on container size
  // Let's assume the component renders a 2x2 grid filling the container
  // Top-Left: Pred +, Actual + (Logic depends on Dot Type)
  
  // SIMPLIFIED LOGIC FOR DRAG AREA:
  // LEFT HALF = PREDICTED POSITIVE
  // RIGHT HALF = PREDICTED NEGATIVE
  
  // WE DO NOT ENFORCE ROWS VISUALLY FOR DRAGGING, DOT COLOR DEFINES ROW (ACTUAL CLASS)
  // VISUAL LAYOUT:
  // Left Box: "PREDICTED YES"
  // Right Box: "PREDICTED NO"
  
  const containerRect = containerRef.value.getBoundingClientRect()
  const splitX = containerRect.width / 2
  
  dots.value.forEach(dot => {
    const isPredictedPositive = dot.x < splitX
    
    if (dot.type === 'positive') {
      // It IS positive (Green)
      if (isPredictedPositive) tp++ // Correctly predicted positive
      else fn++ // Missed it (False Negative)
    } else {
      // It IS negative (Red)
      if (isPredictedPositive) fp++ // Wrongly predicted positive (False Alarm)
      else tn++ // Correctly predicted negative
    }
  })
  
  emit('stats-update', { tp, fp, fn, tn })
}

onMounted(() => {
  // Delay slightly to ensure rects are ready
  setTimeout(() => {
     // Distribute initially to make it interesting
     if (containerRef.value) {
       const w = containerRef.value.clientWidth
       const h = containerRef.value.clientHeight
       
       dots.value.forEach((dot, i) => {
         // Random scatter
         dot.x = Math.random() * (w - 40) + 20
         dot.y = Math.random() * (h - 40) + 20
       })
       calculateStats()
     }
  }, 100)
  
  initDots()
})

</script>

<template>
  <div class="w-full h-full min-h-[400px] flex flex-col">
    <!-- Matrix Headers -->
    <div class="flex w-full mb-2 text-center font-bold text-white/50 uppercase tracking-widest text-xs">
      <div class="flex-1">Predicted Positive (1)</div>
      <div class="flex-1">Predicted Negative (0)</div>
    </div>
    
    <!-- Matrix Container -->
    <div ref="containerRef" class="flex-1 relative bg-white/5 rounded-xl border border-white/10 overflow-hidden flex">
      
      <!-- Zone Visualization -->
      <div class="absolute inset-0 flex pointer-events-none">
        <!-- Predicted Positive Zone -->
        <div class="flex-1 border-r border-white/10 bg-success/5 flex flex-col justify-center items-center">
           <div class="text-9xl text-success/10 font-black select-none">+</div>
        </div>
        <!-- Predicted Negative Zone -->
        <div class="flex-1 bg-accent/5 flex flex-col justify-center items-center">
           <div class="text-9xl text-accent/10 font-black select-none">-</div>
        </div>
      </div>
      
      <!-- Dots -->
      <div 
        v-for="dot in dots" 
        :key="dot.id"
        class="absolute w-6 h-6 rounded-full shadow-lg border-2 cursor-grab active:cursor-grabbing transition-transform hover:scale-110 flex items-center justify-center z-10"
        :class="dot.type === 'positive' ? 'bg-success border-success-200 shadow-success/40' : 'bg-accent border-accent-200 shadow-accent/40'"
        :style="{ left: `${dot.x}px`, top: `${dot.y}px`, transform: 'translate(-50%, -50%)' }"
        @mousedown.stop="startDrag(dot, $event)"
      >
        <span class="text-[10px] font-bold text-black/50 pointer-events-none">
          {{ dot.type === 'positive' ? '+' : '-' }}
        </span>
      </div>

    </div>
    
    <div class="mt-2 text-center text-xs text-white/30 italic">
      Avg Green Dot = Actual Positive • Avg Red Dot = Actual Negative
    </div>
  </div>
</template>
