<script setup>
import { ref } from 'vue'
import BoxPlot from './components/BoxPlot.vue'
import Histogram from './components/Histogram.vue'
import DataControl from './components/DataControl.vue'
import ExperiencePanel from '../../components/ExperiencePanel.vue'
import BackToMenu from '../../components/BackToMenu.vue'

// Initial data
const dataPoints = ref([10, 20, 25, 30, 40, 45, 45, 50, 50, 50, 55, 60, 65, 70, 80, 90])

function updateData(newData) {
  dataPoints.value = [...newData].sort((a, b) => a - b)
}

</script>

<template>
  <div class="w-full h-screen overflow-hidden bg-background font-sans flex flex-col">
    
    <!-- Header / Nav (Minimal) -->
    <div class="absolute top-4 left-4 z-50">
        <BackToMenu />
    </div>

    <!-- Section 1: Histogram (Top) -->
    <div class="flex-1 relative border-b border-white/10 p-6 flex flex-col min-h-0">
         <div class="absolute top-4 right-8 text-xl font-bold flex items-center gap-3 opacity-50 pointer-events-none">
            <span class="text-accent-300">Histogram</span>
        </div>
        <div class="flex-1 w-full h-full">
             <Histogram :data="dataPoints" />
        </div>
    </div>

    <!-- Section 2: Box Plot (Middle) -->
    <div class="flex-1 relative border-b border-white/10 p-6 flex flex-col min-h-0">
         <div class="absolute top-4 right-8 text-xl font-bold flex items-center gap-3 opacity-50 pointer-events-none">
            <span class="text-primary-300">Box Plot</span>
        </div>
        <div class="flex-1 w-full h-full flex items-center">
             <BoxPlot :data="dataPoints" />
        </div>
    </div>

    <!-- Section 3: Data Control (Bottom) -->
    <div class="flex-1 relative p-6 flex flex-col min-h-0 bg-surface/30">
        <div class="absolute top-4 right-8 text-xl font-bold flex items-center gap-3 opacity-50 pointer-events-none">
            <span class="text-white">Data Control</span>
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
