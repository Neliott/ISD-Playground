<script setup>
import { ref, computed } from 'vue'
import DraggableMatrix from './components/DraggableMatrix.vue'
import MetricsPanel from './components/MetricsPanel.vue'
import ExperiencePanel from '../../components/ExperiencePanel.vue'
import BackToMenu from '../../components/BackToMenu.vue'

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
    <div class="absolute inset-0 pt-0">
        <DraggableMatrix @stats-update="updateStats" />
    </div>

    <!-- Floating Panel -->
    <div class="absolute bottom-0 left-0 w-full md:top-4 md:left-4 md:bottom-auto md:w-80 z-20 pointer-events-none p-4 md:p-0">
        <div class="pointer-events-auto max-h-[50vh] md:max-h-none overflow-y-auto">
            <ExperiencePanel title="Confusion Matrix">
                <template #header>
                    <div class="flex items-center gap-2">
                        <BackToMenu />
                        <div class="flex-1"></div>
                    </div>
                </template>

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
