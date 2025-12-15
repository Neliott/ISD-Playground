<script setup>
import { ref } from 'vue'
import BoxPlot from './components/BoxPlot.vue'
import Histogram from './components/Histogram.vue'
import DataControl from './components/DataControl.vue'
import ExperiencePanel from '../../components/ExperiencePanel.vue'
import BackToMenu from '../../components/BackToMenu.vue'
import Tooltip from '../../components/Tooltip.vue'
import VisualDistribution from '../../components/visuals/VisualDistribution.vue'

// Initial data
const dataPoints = ref([10, 20, 25, 30, 40, 45, 45, 50, 50, 50, 55, 60, 65, 70, 80, 90])
const showInfo = ref(false)

function updateData(newData) {
  dataPoints.value = [...newData].sort((a, b) => a - b)
}

</script>

<template>
  <div class="w-full h-screen overflow-hidden bg-background font-sans flex flex-col relative">
    
    <!-- Info Modal -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
        <div v-if="showInfo" class="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm" @click.self="showInfo = false">
            <div class="w-full max-w-4xl bg-surface border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div class="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 class="text-xl font-bold text-white">Understanding Distributions</h2>
                    <button @click="showInfo = false" class="text-white/50 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div class="flex-1 overflow-y-auto p-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
                        <div class="h-80 md:h-96">
                            <VisualDistribution />
                        </div>
                        <div class="space-y-4 text-sm text-text-muted leading-relaxed">
                            <p>
                                A <strong>Histogram</strong> (top) and a <strong>Box Plot</strong> (bottom) are two ways to look at the same data distribution.
                            </p>
                            <p>
                                <strong class="text-white">The Normal Curve</strong> (Bell Curve) is often used as a reference. In a perfectly normal distribution:
                            </p>
                            <ul class="list-disc pl-5 space-y-2">
                                <li>The <strong>Median</strong> (middle line of the box) is at the peak.</li>
                                <li>The <strong>Box</strong> (Interquartile Range) covers the middle 50% of data.</li>
                                <li>The <strong>Whiskers</strong> extend to cover 99.3% of the data (approx 3 standard deviations).</li>
                            </ul>
                            <div class="p-4 bg-primary/10 border border-primary/20 rounded-lg mt-4">
                                <span class="text-primary-200 font-bold block mb-1">Interactive Tip</span>
                                Try creating a bell-shape with the sliders in the main view and see how the Box Plot aligns!
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Transition>


    <!-- Header / Nav (Minimal) -->
    <div class="absolute top-4 left-4 z-50 flex items-center gap-4">
        <BackToMenu />
        
        <!-- Info Button -->
        <button @click="showInfo = true" class="flex items-center gap-2 px-3 py-1.5 bg-surface/50 hover:bg-surface border border-white/10 rounded-full transition-all text-xs font-bold text-accent-100 backdrop-blur-md group">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>More Info</span>
        </button>
    </div>

    <!-- Section 1: Histogram (Top) -->
    <div class="flex-1 relative border-b border-white/10 p-6 flex flex-col min-h-0">
         <div class="absolute top-4 right-8 z-10">
            <Tooltip text="Shows the frequency distribution of data points." position="left">
                <div class="text-xl font-bold flex items-center gap-3 opacity-50 cursor-help hover:opacity-100 transition-opacity">
                    <span class="text-accent-300">Histogram</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            </Tooltip>
        </div>
        <div class="flex-1 w-full h-full">
             <Histogram :data="dataPoints" />
        </div>
    </div>

    <!-- Section 2: Box Plot (Middle) -->
    <div class="flex-1 relative border-b border-white/10 p-6 flex flex-col min-h-0">
         <div class="absolute top-4 right-8 z-10">
            <Tooltip text="Displays the five-number summary: Min, Q1, Median, Q3, Max." position="left">
                 <div class="text-xl font-bold flex items-center gap-3 opacity-50 cursor-help hover:opacity-100 transition-opacity">
                    <span class="text-primary-300">Box Plot</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            </Tooltip>
        </div>
        <div class="flex-1 w-full h-full flex items-center">
             <BoxPlot :data="dataPoints" />
        </div>
    </div>

    <!-- Section 3: Data Control (Bottom) -->
    <div class="flex-1 relative p-6 flex flex-col min-h-0 bg-surface/30">
        <div class="absolute top-4 right-8 z-10">
            <Tooltip text="Add, move, or remove data points to change the distribution." position="left">
                <div class="text-xl font-bold flex items-center gap-3 opacity-50 cursor-help hover:opacity-100 transition-opacity">
                    <span class="text-white">Data Control</span>
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            </Tooltip>
        </div>
        
        <div class="w-full max-w-4xl mx-auto flex flex-col h-full justify-center">
             <div class="mb-2 text-sm text-text-muted text-center">
                Click to add points • Drag to move • Right-click to remove
            </div>
            <DataControl :data="dataPoints" @update="updateData" />
        </div>
    </div>

  </div>
</template>
