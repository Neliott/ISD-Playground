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
  <div class="relative w-full h-32 select-none flex items-center justify-center">
    <!-- Axis Line -->
    <div class="absolute w-full h-1 bg-white/20 rounded-full"></div>
    
    <!-- Ticks -->
    <div v-for="i in 11" :key="i" 
         class="absolute h-4 w-0.5 bg-white/10 -translate-y-1/2 transition-colors duration-300 hover:bg-white/30"
         :style="{ left: `${(i-1) * 10}%` }">
         <span class="absolute top-6 left-1/2 -translate-x-1/2 text-xs text-white/30 font-mono">{{ (i-1) * 10 }}</span>
    </div>

    <!-- Interaction Area (Full Width/height of parent container effectively) -->
    <div ref="containerRef" 
         class="absolute inset-0 -my-8 cursor-crosshair z-0"
         @click="addPoint">
    </div>

    <!-- Data Points -->
    <div v-for="(val, index) in data" 
         :key="index"
         class="data-point absolute w-8 h-8 -ml-4 -mt-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10 flex items-center justify-center group border-2 border-primary/20"
         :style="{ left: `${valueToPercent(val)}%` }"
         @mousedown.stop="startDrag(index, $event)"
         @contextmenu.prevent="removePoint(index)"
    >
      <div class="w-3 h-3 bg-primary rounded-full shadow-inner"></div>
      
      <!-- Tooltip -->
      <div class="absolute -top-12 left-1/2 -translate-x-1/2 bg-surface text-white font-bold text-sm py-1 px-3 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-white/10 shadow-xl whitespace-nowrap z-50">
        {{ Math.round(val) }}
      </div>
    </div>
  </div>
</template>
