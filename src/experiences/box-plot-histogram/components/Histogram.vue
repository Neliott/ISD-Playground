<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const bins = computed(() => {
  const min = 0
  const max = 100
  const binCount = 10
  const binWidth = (max - min) / binCount
  
  const result = new Array(binCount).fill(0)
  
  props.data.forEach(val => {
    // Clamp value to ensure it falls within range
    const clampedVal = Math.max(min, Math.min(max - 0.001, val))
    const binIndex = Math.floor((clampedVal - min) / binWidth)
    result[binIndex]++
  })

  return result
})

const maxCount = computed(() => Math.max(...bins.value, 1))

</script>

<template>
  <div class="w-full h-64 flex items-end gap-1 relative pt-10">
    <!-- Y-axis scale lines (simple) -->
    <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
      <div class="border-t border-dashed border-white w-full"></div>
      <div class="border-t border-dashed border-white w-full"></div>
      <div class="border-t border-dashed border-white w-full"></div>
    </div>

    <!-- Bars -->
    <div v-for="(count, index) in bins" :key="index" 
         class="flex-1 bg-accent/30 hover:bg-accent/50 transition-all duration-300 relative group rounded-t-sm"
         :style="{ height: `${(count / maxCount) * 100}%` }"
    >
      <!-- Count Label -->
      <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono text-accent-100 opacity-0 group-hover:opacity-100 transition-opacity">
        {{ count }}
      </div>
    </div>

    <!-- X-Axis Labels -->
    <div class="absolute bottom-0 w-full flex justify-between text-[10px] text-white/30 translate-y-full pt-2 font-mono">
      <span>0</span>
      <span>20</span>
      <span>40</span>
      <span>60</span>
      <span>80</span>
      <span>100</span>
    </div>
  </div>
</template>
