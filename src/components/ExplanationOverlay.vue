<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import Button from './controls/Button.vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Explanation'
  },
  slides: {
    type: Array,
    default: () => [],
    // Each slide: { title: String, content: String (HTML), image?: String, component?: Object, props?: Object }
  }
})

const emit = defineEmits(['close'])

const currentSlideIndex = ref(0)
const direction = ref('next') // 'next' or 'prev' for transition direction

watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    currentSlideIndex.value = 0
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const nextSlide = () => {
  if (currentSlideIndex.value < props.slides.length - 1) {
    direction.value = 'next'
    currentSlideIndex.value++
  }
}

const prevSlide = () => {
  if (currentSlideIndex.value > 0) {
    direction.value = 'prev'
    currentSlideIndex.value--
  }
}

const close = () => {
  emit('close')
}

// Keyboard navigation
const handleKeydown = (e) => {
  if (!props.isVisible) return
  
  if (e.key === 'ArrowRight') nextSlide()
  if (e.key === 'ArrowLeft') prevSlide()
  if (e.key === 'Escape') close()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Transition name="fade">
    <div 
      v-if="isVisible" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      @click.self="close"
    >
      <!-- Backdrop with blur -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-md" @click="close"></div>

      <!-- Content Container -->
      <div 
        class="relative w-full max-w-4xl h-[600px] bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
          <h2 class="text-xl font-semibold text-white tracking-wide flex items-center gap-3">
             <span class="text-primary-400">#</span> {{ title }}
          </h2>
          <button 
            @click="close"
            class="p-2 rounded-full hover:bg-white/10 text-text-muted hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <!-- Slides Area -->
        <div class="flex-1 relative overflow-hidden bg-[#0A0A0A]">
          <Transition :name="direction === 'next' ? 'slide-left' : 'slide-right'">
            <div 
              :key="currentSlideIndex"
              class="absolute inset-0 p-8 sm:p-12 overflow-y-auto flex flex-col items-center justify-center text-center"
            >
              <div v-if="slides[currentSlideIndex]" class="w-full max-w-2xl mx-auto">
                <div class="mb-4 text-xs font-mono text-primary-400 uppercase tracking-widest">
                  Step {{ currentSlideIndex + 1 }} / {{ slides.length }}
                </div>
                
                <h3 class="text-3xl sm:text-4xl font-bold text-white mb-6">
                  {{ slides[currentSlideIndex].title }}
                </h3>
                
                <div class="prose prose-invert prose-lg mx-auto text-text-muted leading-relaxed" v-html="slides[currentSlideIndex].content"></div>

                <!-- Custom Component Slot Support could be added here if needed contextually, 
                     but for now v-html covers text and simple standard HTML. 
                     Complex custom visualizations can be passed as specialized slides later. -->
                <div v-if="slides[currentSlideIndex].component" class="mt-8 w-full h-64 border border-white/10 rounded-lg overflow-hidden bg-black/20">
                    <component :is="slides[currentSlideIndex].component" v-bind="slides[currentSlideIndex].props" />
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Footer / Navigation -->
        <div class="p-6 border-t border-white/5 bg-white/5 flex items-center justify-between">
          <div class="flex space-x-1">
            <div 
              v-for="(_, idx) in slides" 
              :key="idx"
              class="w-2 h-2 rounded-full transition-all duration-300"
              :class="idx === currentSlideIndex ? 'bg-primary-500 w-8' : 'bg-white/20'"
            ></div>
          </div>

          <div class="flex gap-4">
            <Button 
              variant="secondary" 
              :disabled="currentSlideIndex === 0"
              @click="prevSlide"
            >
              Previous
            </Button>
             <Button 
              v-if="currentSlideIndex < slides.length - 1"
              variant="primary" 
              @click="nextSlide"
            >
              Next
            </Button>
             <Button 
              v-else
              variant="primary" 
              @click="close"
            >
              Finish
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide Left (Next) */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

/* Slide Right (Prev) */
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-100px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
