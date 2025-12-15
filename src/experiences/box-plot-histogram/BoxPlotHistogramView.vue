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
  <div class="relative w-full h-screen overflow-hidden bg-background font-sans flex flex-col">
    
    <!-- Main Visualization Area: Split Screen -->
    <div class="absolute inset-0 flex flex-col md:flex-row pl-0 md:pl-80">
        
        <!-- Histogram Top/Left -->
        <div class="flex-1 relative border-b md:border-b-0 md:border-r border-white/10 p-8 flex flex-col">
             <div class="absolute top-4 left-8 text-xl font-bold flex items-center gap-3 opacity-50">
                <span class="text-accent-300">Histogram</span>
            </div>
            <div class="flex-1 flex items-center">
                 <Histogram :data="dataPoints" />
            </div>
        </div>

        <!-- Box Plot Bottom/Right -->
        <div class="flex-1 relative p-8 flex flex-col">
             <div class="absolute top-4 left-8 text-xl font-bold flex items-center gap-3 opacity-50">
                <span class="text-primary-300">Box Plot</span>
            </div>
            <div class="flex-1 flex items-center">
                 <BoxPlot :data="dataPoints" />
            </div>
        </div>

    </div>

    <!-- Floating Panel -->
    <div class="absolute top-4 left-4 w-80 z-20 pointer-events-none md:pointer-events-auto">
        <div class="pointer-events-auto">
            <ExperiencePanel title="Distribution">
                <template #header>
                    <div class="flex items-center gap-2">
                        <BackToMenu />
                        <div class="flex-1"></div>
                    </div>
                </template>

                 <div class="mb-6 text-sm text-text-muted">
                    Manipulate the data distribution below and observe how the Histogram and Box Plot respond.
                </div>

                <div class="mb-6">
                    <h3 class="text-xs font-bold text-white mb-2 uppercase tracking-wide">Data Control</h3>
                    <DataControl :data="dataPoints" @update="updateData" />
                </div>

                <div class="pt-4 border-t border-white/10 text-xs text-white/50 leading-relaxed">
                    <strong>Histogram:</strong> Shows frequency shape.<br>
                    <strong>Box Plot:</strong> Shows statistics (Median, Quartiles).
                </div>
            </ExperiencePanel>
        </div>
    </div>

  </div>
</template>
