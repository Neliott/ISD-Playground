<script setup>
import { ref, computed } from 'vue'
import DraggableMatrix from './components/DraggableMatrix.vue'
import MetricsPanel from './components/MetricsPanel.vue'

const matrixStats = ref({
  tp: 0,
  fp: 0,
  fn: 0,
  tn: 0
})

function updateStats(newStats) {
  matrixStats.value = newStats
}
</script>

<template>
  <div class="min-h-screen bg-background text-white p-8 pt-24 font-sans">
    <div class="max-w-6xl mx-auto">
      <header class="mb-12">
        <h1 class="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-success-300 to-white">
          Confusion Matrix Manipulator
        </h1>
        <p class="text-lg text-white/60 max-w-2xl">
          Drag the sample points into the matrix to see how <strong>Precision</strong>, <strong>Recall</strong>, and <strong>F1-Score</strong> change.
          Understand the trade-off between avoiding false alarms and missing real detections.
        </p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Interactive Matrix -->
        <div class="col-span-1 lg:col-span-2 bg-surface/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative min-h-[500px]">
           <h2 class="text-xl font-bold mb-6 flex items-center gap-3">
            <span class="bg-success/20 p-2 rounded-lg text-success-300">1</span>
            Drag & Drop Zone
          </h2>
          <DraggableMatrix @stats-update="updateStats" />
        </div>

        <!-- Metrics Panel -->
        <div class="col-span-1 bg-surface/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm h-fit sticky top-24">
          <h2 class="text-xl font-bold mb-6 flex items-center gap-3">
            <span class="bg-primary/20 p-2 rounded-lg text-primary-300">2</span>
            Live Metrics
          </h2>
          <MetricsPanel :stats="matrixStats" />
          
          <!-- Explanation -->
           <div class="mt-8 pt-8 border-t border-white/10 text-sm text-white/60 leading-relaxed space-y-4">
             <p>
               <strong class="text-white">Precision:</strong> How many selected items are relevant? (Don't spam me).
             </p>
             <p>
               <strong class="text-white">Recall:</strong> How many relevant items are selected? (Don't miss anything).
             </p>
             <p class="italic opacity-70">
               Move all Green dots to "Predicted Negative" to see Recall drop to 0!
             </p>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>
