<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BoxPlot from './components/BoxPlot.vue'
import Histogram from './components/Histogram.vue'
import DataControl from './components/DataControl.vue'
import ExperiencePanel from '../../components/ExperiencePanel.vue'
import Tooltip from '../../components/Tooltip.vue'
import VisualDistribution from '../../components/visuals/VisualDistribution.vue'

const props = defineProps({
  isEmbedded: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

function goToCourse() {
    router.push('/learn/box-plot-histogram/intro')
}

function goToFullScreen() {
    router.push('/box-plot-histogram')
}

function goBack() {
    router.back()
}


// Initial data
const dataPoints = ref([10, 20, 25, 30, 40, 45, 45, 50, 50, 50, 55, 60, 65, 70, 80, 90])

function updateData(newData) {
  dataPoints.value = [...newData].sort((a, b) => a - b)
}

</script>

<template>
  <div class="w-full h-screen overflow-hidden bg-background font-sans flex flex-col relative">
    



    <!-- Header / Nav (Minimal) -->
    <div class="absolute top-4 left-4 z-50 flex items-center gap-4">
        <button 
            v-if="!isEmbedded"
            @click="goBack"
            class="flex items-center gap-2 px-3 py-1.5 bg-surface/50 hover:bg-surface border border-white/10 rounded-full transition-all text-xs font-bold text-text-muted hover:text-white backdrop-blur-md group"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            <span>Back</span>
        </button>

        <button 
              v-if="!isEmbedded"
              @click="goToCourse"
              class="flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 rounded-full transition-all text-xs font-bold text-primary-400 backdrop-blur-md group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              Start Course
        </button>
            
        <button 
              v-if="isEmbedded"
              @click="goToFullScreen"
              class="flex items-center gap-2 px-3 py-1.5 bg-surface/50 hover:bg-surface border border-white/10 rounded-full transition-all text-xs font-bold text-text-muted hover:text-white backdrop-blur-md group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
              Full Screen
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
