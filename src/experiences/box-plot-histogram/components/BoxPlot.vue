<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

// Calculate Box Plot Statistics
const stats = computed(() => {
  const sorted = [...props.data].sort((a, b) => a - b)
  const n = sorted.length
  
  const min = sorted[0]
  const max = sorted[n - 1]
  
  const getQuantile = (q) => {
    const pos = (n - 1) * q
    const base = Math.floor(pos)
    const rest = pos - base
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base])
    } else {
      return sorted[base]
    }
  }
  
  const q1 = getQuantile(0.25)
  const median = getQuantile(0.5)
  const q3 = getQuantile(0.75)
  const iqr = q3 - q1
  
  // Identifying outliers (simple Tukey fences)
  const lowerFence = q1 - 1.5 * iqr
  const upperFence = q3 + 1.5 * iqr
  
  const outliers = sorted.filter(v => v < lowerFence || v > upperFence)
  
  // Whiskers extend to the furthest point within fences
  const notOutliers = sorted.filter(v => v >= lowerFence && v <= upperFence)
  const whiskerMin = notOutliers.length > 0 ? notOutliers[0] : q1
  const whiskerMax = notOutliers.length > 0 ? notOutliers[notOutliers.length - 1] : q3

  return { min, max, q1, median, q3, whiskerMin, whiskerMax, outliers }
})

const scale = (val) => `${val}%` // Simple 0-100 scale

</script>

<template>
  <div class="w-full h-40 relative my-10">
    <!-- Main Axis Line -->
    <div class="absolute top-1/2 left-0 right-0 h-px bg-white/20"></div>

    <!-- Whiskers Line -->
    <div class="absolute top-1/2 h-px bg-primary/50"
         :style="{ left: scale(stats.whiskerMin), right: `${100 - stats.whiskerMax}%` }">
    </div>

    <!-- Left Whisker Cap -->
    <div class="absolute top-1/2 h-4 w-px bg-primary transform -translate-y-1/2"
         :style="{ left: scale(stats.whiskerMin) }">
    </div>

    <!-- Right Whisker Cap -->
    <div class="absolute top-1/2 h-4 w-px bg-primary transform -translate-y-1/2"
         :style="{ left: scale(stats.whiskerMax) }">
    </div>

    <!-- The Box (IQR) -->
    <div class="absolute top-1/2 h-16 bg-primary/20 border border-primary transform -translate-y-1/2 rounded-sm backdrop-blur-sm transition-all duration-300"
         :style="{ left: scale(stats.q1), width: `${stats.q3 - stats.q1}%` }">
    </div>

    <!-- Median Line -->
    <div class="absolute top-1/2 h-16 w-0.5 bg-white transform -translate-y-1/2 z-10 shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-300"
         :style="{ left: scale(stats.median) }">
    </div>

    <!-- Outliers -->
    <div v-for="(outlier, i) in stats.outliers" :key="i"
         class="absolute top-1/2 w-3 h-3 border-2 border-accent rounded-full transform -translate-y-1/2 -translate-x-1/2 bg-surface z-20 tooltip-trigger"
         :style="{ left: scale(outlier) }">
    </div>

    <!-- Labels (Floating below) -->
    <div class="absolute top-[70%] text-xs font-mono text-primary-200 transform -translate-x-1/2 transition-all duration-300" :style="{ left: scale(stats.q1) }">Q1</div>
    <div class="absolute top-[70%] text-xs font-mono text-white transform -translate-x-1/2 transition-all duration-300 font-bold" :style="{ left: scale(stats.median) }">Med</div>
    <div class="absolute top-[70%] text-xs font-mono text-primary-200 transform -translate-x-1/2 transition-all duration-300" :style="{ left: scale(stats.q3) }">Q3</div>

    <!-- X-Axis Labels -->
    <div class="absolute bottom-0 -mb-10 w-full flex justify-between text-[10px] text-white/30 font-mono">
      <span>0</span>
      <span>100</span>
    </div>
  </div>
</template>
