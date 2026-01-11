<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { courses } from '../data/courses'
import Button from '../components/controls/Button.vue'
import LearningLayout from '../layouts/LearningLayout.vue'

const route = useRoute()
const router = useRouter()

const courseId = computed(() => route.params.courseId)
const lessonId = computed(() => route.params.lessonId)

const course = computed(() => courses.find(c => c.id === courseId.value))
const currentStepIndex = computed(() => course.value?.steps.findIndex(s => s.id === lessonId.value) ?? -1)
const currentStep = computed(() => course.value?.steps[currentStepIndex.value])

const nextStep = computed(() => {
  if (!course.value || currentStepIndex.value === -1) return null
  return course.value.steps[currentStepIndex.value + 1]
})

const prevStep = computed(() => {
  if (!course.value || currentStepIndex.value === -1) return null
  return course.value.steps[currentStepIndex.value - 1]
})

const goToStep = (step) => {
  if (step) {
    router.push(`/learn/${courseId.value}/${step.id}`)
  }
}
</script>

<template>
  <LearningLayout>
    <div v-if="currentStep" class="h-full flex flex-col relative">
      
      <!-- Experiment Full Screen Mode -->
      <div v-if="currentStep.type === 'experiment'" class="absolute inset-0 z-10 bg-background">
         <component :is="currentStep.component" v-bind="currentStep.props || {}" />
         <div class="absolute bottom-6 right-6 flex gap-4 pointer-events-none">
            <Button 
                v-if="nextStep"
                variant="primary" 
                class="pointer-events-auto shadow-2xl shadow-primary-500/50"
                @click="goToStep(nextStep)"
            >
                Next Lesson &rarr;
            </Button>
         </div>
      </div>

      <!-- Quiz Mode -->
      <div v-else-if="currentStep.type === 'quiz'" class="h-full flex flex-col items-center justify-center bg-background overflow-y-auto">
         <component 
            :is="currentStep.component" 
            v-bind="currentStep.props || {}"
            @complete="(score) => {} /* Handle score if needed */"
         >
            <template #finish>
                <Button 
                    v-if="nextStep"
                    variant="primary" 
                    @click="goToStep(nextStep)"
                >
                    Continue Journey
                </Button>
                <router-link v-else to="/" class="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 text-white transition-colors">
                    Back to Dashboard
                </router-link>
            </template>
         </component>
      </div>

      <!-- Conceptual / Text Lesson Mode -->
      <div v-else class="flex flex-col lg:grid lg:grid-cols-12 h-full overflow-hidden">
        
        <!-- Left: Content -->
        <div class="lg:col-span-5 h-full overflow-y-auto bg-surface border-r border-white/5 flex flex-col">
          <div class="p-8 lg:p-12 flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
            <div class="mb-6 flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-white/5 border border-white/10 text-text-muted">
                    {{ currentStep.type }}
                </span>
                <span class="text-xs text-text-muted">
                    {{ currentStepIndex + 1 }} / {{ course.steps.length }}
                </span>
            </div>
            
            <h1 class="text-3xl lg:text-4xl font-bold text-white mb-8 leading-tight">
              {{ currentStep.title }}
            </h1>
            
            <div class="prose prose-invert prose-lg text-text-muted leading-relaxed" v-html="currentStep.content"></div>
          </div>
          
          <!-- Mobile Visuals (Embedded) -->
          <div class="lg:hidden w-full aspect-square bg-black/20 mb-6 rounded-lg overflow-hidden border border-white/5 relative mx-4 max-w-[calc(100%-2rem)] shrink-0 self-center">
             <div v-if="currentStep.component" 
                  class="w-full h-full overflow-hidden relative">
                  <!-- Note: We re-mount the component here. For complex state, we might need a keep-alive or store state, 
                       but for these educational visuals, re-mounting on resize/view switch is usually acceptable. -->
                 <component :is="currentStep.component" v-bind="currentStep.props || {}" />
             </div>
             <div v-else class="w-full h-full flex items-center justify-center text-white/20">
                 <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
             </div>
          </div>

          <!-- Bottom Navigation -->
          <div class="p-6 border-t border-white/5 bg-black/20 flex justify-between items-center sticky bottom-0 backdrop-blur-sm">
            <Button 
                variant="secondary"
                :disabled="!prevStep"
                @click="goToStep(prevStep)"
            >
                Back
            </Button>
            
            <Button 
                variant="primary"
                :disabled="!nextStep"
                @click="goToStep(nextStep)"
            >
                {{ nextStep ? 'Continue' : 'Finish' }}
            </Button>
          </div>
        </div>

        <!-- Right: Visuals (Desktop Only) -->
        <div class="hidden lg:col-span-7 h-full bg-black/40 relative overflow-hidden lg:flex items-center justify-center border-l border-white/5">
            <!-- Background Decorations -->
            <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik00MCAwTDAsMHY0MGg0MFowIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] opacity-30"></div>
            <div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent"></div>

            <!-- Visual Component -->
            <transition name="scale-fade" mode="out-in">
                <div :key="currentStep.id" 
                     class="relative z-10 w-full flex items-center justify-center transition-all duration-500"
                     :class="currentStep.layout === 'fullscreen' ? 'h-full p-0' : 'max-w-2xl aspect-square p-8'">
                     
                    <div v-if="currentStep.component" 
                         class="w-full h-full overflow-hidden transition-all duration-500"
                         :class="currentStep.layout === 'fullscreen' ? '' : 'rounded-xl border border-white/10 shadow-2xl bg-surface/50 backdrop-blur-sm'">
                        <component :is="currentStep.component" v-bind="currentStep.props || {}" />
                    </div>
                    <div v-else class="text-white/20">
                        <!-- Placeholder -->
                        <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                </div>
            </transition>
        </div>
      </div>
    </div>
    <div v-else class="flex items-center justify-center h-full text-text-muted">
        Lesson not found.
    </div>
  </LearningLayout>
</template>

<style scoped>
.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.scale-fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
  filter: blur(10px);
}
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(1.05);
  filter: blur(10px);
}
</style>
