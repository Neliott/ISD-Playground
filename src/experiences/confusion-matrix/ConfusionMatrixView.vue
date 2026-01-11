<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DraggableMatrix from './components/DraggableMatrix.vue'
import MetricsPanel from './components/MetricsPanel.vue'
import ExperiencePanel from '../../components/ExperiencePanel.vue'

const props = defineProps({
  isEmbedded: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

function goToCourse() {
    router.push('/learn/confusion-matrix/intro')
}

function goToFullScreen() {
    router.push('/confusion-matrix')
}

function goBack() {
    router.back()
}

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
  <div class="relative w-full h-screen overflow-hidden bg-background font-sans">
      
    <!-- Full Screen Interaction Area -->
    <div class="absolute inset-0 top-[40vh] md:top-0 pt-0">
        <DraggableMatrix @stats-update="updateStats" />
    </div>

    <!-- Floating Panel -->
    <div class="absolute top-0 left-0 w-full h-[40vh] md:h-auto md:w-80 md:top-4 md:left-4 md:bottom-auto z-20 pointer-events-none p-4 pb-0 md:p-0 flex flex-col">
        <div class="pointer-events-auto w-full h-full md:h-auto overflow-y-auto">
            <ExperiencePanel title="Confusion Matrix" class="h-full md:h-auto">
                <template #header>
                    <div class="flex items-center gap-2">
                        <button 
                            v-if="!isEmbedded"
                            @click="goBack"
                            class="text-sm text-text-muted hover:text-text transition-colors flex items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                            Back
                        </button>
                        <h2 v-else class="text-sm font-bold text-white uppercase tracking-wider">Playground</h2>
                        <div class="flex-1"></div>
                    </div>
                </template>

                <div class="mb-4 flex flex-col gap-2">
                    <button 
                        v-if="!isEmbedded"
                        @click="goToCourse"
                        class="w-full py-2 px-3 rounded bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-wider hover:bg-primary-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                        Start Course
                    </button>
                    
                    <button 
                        v-if="isEmbedded"
                        @click="goToFullScreen"
                        class="w-full py-2 px-3 rounded bg-white/5 border border-white/10 text-text-muted text-xs font-bold uppercase tracking-wider hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
                        Full Screen
                    </button>
                </div>

                 <div class="mb-4 text-sm text-text-muted">
                    Drag the sample points into the matrix to see how <strong>Precision</strong>, <strong>Recall</strong>, and <strong>F1-Score</strong> change.
                </div>

                <MetricsPanel :stats="matrixStats" />

                 <div class="mt-4 pt-4 border-t border-white/10 text-xs text-white/60 space-y-2">
                    <p>
                        <strong class="text-white">Precision:</strong> Relevance (minimize False Positives).
                    </p>
                    <p>
                        <strong class="text-white">Recall:</strong> Completeness (minimize False Negatives).
                    </p>
                </div>
            </ExperiencePanel>
        </div>
    </div>
  </div>
</template>
