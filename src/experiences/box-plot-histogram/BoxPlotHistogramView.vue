<script setup>
import { ref, computed } from 'vue'
import BoxPlot from './components/BoxPlot.vue'
import Histogram from './components/Histogram.vue'
import DataControl from './components/DataControl.vue'

// Initial data: A somewhat normal distribution
const dataPoints = ref([10, 20, 25, 30, 40, 45, 45, 50, 50, 50, 55, 60, 65, 70, 80, 90])

function updateData(newData) {
  dataPoints.value = [...newData].sort((a, b) => a - b)
}

</script>

<template>
  <div class="min-h-screen bg-background text-white p-8 pt-24 font-sans">
    <div class="max-w-6xl mx-auto">
      <header class="mb-12">
        <h1 class="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-300 to-white">
          Box Plot vs. Histogram
        </h1>
        <p class="text-lg text-white/60 max-w-2xl">
          Explore the relationship between data distribution, histograms, and box plots. 
          Manipulate the data points below to see how the visualizations respond in real-time.
        </p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Interactive Data Control -->
        <div class="col-span-1 lg:col-span-2 bg-surface/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
           <h2 class="text-xl font-bold mb-6 flex items-center gap-3">
            <span class="bg-primary/20 p-2 rounded-lg text-primary-300">1</span>
            Data Control
          </h2>
          <DataControl :data="dataPoints" @update="updateData" />
        </div>

        <!-- Histogram -->
        <div class="bg-surface/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group">
          <h2 class="text-xl font-bold mb-6 flex items-center gap-3">
            <span class="bg-accent/20 p-2 rounded-lg text-accent-300">2</span>
            Histogram
          </h2>
          <div class="relative z-10">
             <Histogram :data="dataPoints" />
          </div>
          <!-- Background Decoration -->
          <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none"></div>
        </div>

        <!-- Box Plot -->
        <div class="bg-surface/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group">
           <h2 class="text-xl font-bold mb-6 flex items-center gap-3">
            <span class="bg-primary/20 p-2 rounded-lg text-primary-300">3</span>
            Box Plot
          </h2>
          <div class="relative z-10 h-full flex flex-col justify-center">
            <BoxPlot :data="dataPoints" />
          </div>
          <!-- Background Decoration -->
          <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
        </div>
      </div>
      
      <!-- Educational Notes -->
      <div class="bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/70 leading-relaxed">
        <h3 class="font-bold text-white mb-2">Did you know?</h3>
        <p>
          While the <strong>Histogram</strong> shows the full shape of the distribution (peaks, valleys, skewness), 
          the <strong>Box Plot</strong> summarizes it into five key statistics: Minimum, Q1 (25%), Median, Q3 (75%), and Maximum.
          Notice how "outliers" (points far from the box) are handled!
        </p>
      </div>

    </div>
  </div>
</template>
