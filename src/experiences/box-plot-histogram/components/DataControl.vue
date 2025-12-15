<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update'])

const containerRef = ref(null)
const draggingIndex = ref(null)

const minValue = 0
const maxValue = 100

// Convert data value to percentage for positioning
function valueToPercent(val) {
  return ((val - minValue) / (maxValue - minValue)) * 100
}

// Convert click position to data value
function eventToValue(event) {
  const rect = containerRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const width = rect.width
  let val = (x / width) * (maxValue - minValue) + minValue
  return Math.max(minValue, Math.min(maxValue, Math.round(val)))
}

function startDrag(index, event) {
  draggingIndex.value = index
  window.addEventListener('mousemove', handleDrag)
  window.addEventListener('mouseup', stopDrag)
}

function handleDrag(event) {
  if (draggingIndex.value === null) return
  
  const newValue = eventToValue(event)
  const newData = [...props.data]
  newData[draggingIndex.value] = newValue
  emit('update', newData)
}

function stopDrag() {
  draggingIndex.value = null
  window.removeEventListener('mousemove', handleDrag)
  window.removeEventListener('mouseup', stopDrag)
}

function addPoint(event) {
  // Only add if not clicking on an existing point (simple heuristic)
  if (event.target.closest('.data-point')) return
  
  const newValue = eventToValue(event)
  const newData = [...props.data, newValue]
  emit('update', newData)
}

function removePoint(index) {
  if (props.data.length <= 2) return // Keep at least 2 points
  const newData = [...props.data]
  newData.splice(index, 1)
  emit('update', newData)
}

</script>

<template>
  <div class="relative h-32 select-none">
    <!-- Axis Line -->
    <div class="absolute top-1/2 left-0 right-0 h-1 bg-white/20 rounded-full"></div>
    
    <!-- Ticks -->
    <div v-for="i in 11" :key="i" 
         class="absolute top-1/2 w-0.5 h-4 bg-white/10 -translate-y-1/2 transition-colors duration-300 hover:bg-white/30"
         :style="{ left: `${(i-1) * 10}%` }">
         <span class="absolute top-6 left-1/2 -translate-x-1/2 text-xs text-white/30 font-mono">{{ (i-1) * 10 }}</span>
    </div>

    <!-- Interaction Area -->
    <div ref="containerRef" 
         class="absolute inset-0 cursor-crosshair z-0"
         @click="addPoint">
    </div>

    <!-- Data Points -->
    <div v-for="(val, index) in data" 
         :key="index"
         class="data-point absolute top-1/2 w-6 h-6 -ml-3 -mt-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] cursor-grab active:cursor-grabbing hover:scale-125 transition-transform z-10 flex items-center justify-center group"
         :style="{ left: `${valueToPercent(val)}%` }"
         @mousedown.stop="startDrag(index, $event)"
         @contextmenu.prevent="removePoint(index)"
    >
      <div class="w-2 h-2 bg-primary rounded-full"></div>
      
      <!-- Tooltip -->
      <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-white/10">
        {{ Math.round(val) }}
      </div>
    </div>
    
    <div class="absolute bottom-0 right-0 text-xs text-white/30 italic">
      Left-click blank space to add • Drag to move • Right-click (or long press) to remove
    </div>
  </div>
</template>
