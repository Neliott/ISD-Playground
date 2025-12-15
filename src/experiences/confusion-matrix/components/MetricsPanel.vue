<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({ tp: 0, fp: 0, fn: 0, tn: 0 })
  }
})

function format(num) {
  if (isNaN(num)) return '0.00'
  return num.toFixed(2)
}

const accuracy = computed(() => {
  const { tp, fp, fn, tn } = props.stats
  const total = tp + fp + fn + tn
  return total === 0 ? 0 : (tp + tn) / total
})

const precision = computed(() => {
  const { tp, fp } = props.stats
  return (tp + fp) === 0 ? 0 : tp / (tp + fp)
})

const recall = computed(() => {
  const { tp, fn } = props.stats
  return (tp + fn) === 0 ? 0 : tp / (tp + fn)
})

const f1 = computed(() => {
  const p = precision.value
  const r = recall.value
  return (p + r) === 0 ? 0 : 2 * (p * r) / (p + r)
})

</script>

<template>
  <div class="space-y-4">
    <!-- 2x2 Matrix Grid -->
    <div class="grid grid-cols-2 gap-2 mb-6 p-2 bg-white/5 data-[state=open]:animate-in fade-in zoom-in-95 rounded-xl border border-white/5">
        
        <!-- TP -->
        <div class="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex flex-col items-center justify-center">
            <span class="text-xs text-blue-200 uppercase font-bold tracking-wider mb-1">True Pos</span>
            <span class="text-2xl font-black text-blue-400">{{ stats.tp }}</span>
        </div>

        <!-- FN -->
        <div class="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg flex flex-col items-center justify-center">
            <span class="text-xs text-orange-200 uppercase font-bold tracking-wider mb-1">False Neg</span>
            <span class="text-2xl font-black text-orange-400">{{ stats.fn }}</span>
        </div>

        <!-- FP -->
         <div class="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg flex flex-col items-center justify-center">
            <span class="text-xs text-orange-200 uppercase font-bold tracking-wider mb-1">False Pos</span>
            <span class="text-2xl font-black text-orange-400">{{ stats.fp }}</span>
        </div>

        <!-- TN -->
        <div class="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex flex-col items-center justify-center">
             <span class="text-xs text-blue-200 uppercase font-bold tracking-wider mb-1">True Neg</span>
            <span class="text-2xl font-black text-blue-400">{{ stats.tn }}</span>
        </div>
    </div>
    <div class="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
      <div class="flex justify-between items-end mb-1">
        <span class="text-sm font-bold text-white/80">Accuracy</span>
        <span class="text-2xl font-mono font-bold text-white">{{ format(accuracy) }}</span>
      </div>
      <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
        <div class="h-full bg-white transition-all duration-300" :style="{ width: `${accuracy * 100}%` }"></div>
      </div>
    </div>

    <div class="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
      <div class="flex justify-between items-end mb-1">
        <span class="text-sm font-bold text-success/80">Precision</span>
        <span class="text-2xl font-mono font-bold text-success">{{ format(precision) }}</span>
      </div>
      <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
        <div class="h-full bg-success transition-all duration-300" :style="{ width: `${precision * 100}%` }"></div>
      </div>
    </div>

    <div class="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
      <div class="flex justify-between items-end mb-1">
        <span class="text-sm font-bold text-accent/80">Recall</span>
        <span class="text-2xl font-mono font-bold text-accent">{{ format(recall) }}</span>
      </div>
      <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
        <div class="h-full bg-accent transition-all duration-300" :style="{ width: `${recall * 100}%` }"></div>
      </div>
    </div>
    
    <div class="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
      <div class="flex justify-between items-end mb-1">
        <span class="text-sm font-bold text-primary/80">F1 Score</span>
        <span class="text-2xl font-mono font-bold text-primary">{{ format(f1) }}</span>
      </div>
      <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
        <div class="h-full bg-primary transition-all duration-300" :style="{ width: `${f1 * 100}%` }"></div>
      </div>
    </div>
  </div>
</template>
