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
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-12 font-sans"
      @click.self="close"
    >
      <!-- Backdrop with heavy blur for focus -->
      <div 
        class="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity duration-300" 
        @click="close"
      ></div>

      <!-- Main Card Container -->
      <div 
        class="relative w-full h-full max-w-7xl max-h-[90vh] bg-surface/90 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col lg:grid lg:grid-cols-12"
        @click.stop
      >
        
        <!-- Decoration Gradients -->
        <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <!-- LEFT COLUMN: Content & Navigation (Cols 1-4) -->
        <div class="lg:col-span-5 flex flex-col relative z-10 border-b lg:border-b-0 lg:border-r border-white/5 bg-surface/50 backdrop-blur-sm order-2 lg:order-1">
          
          <!-- Header for Mobile -->
          <div class="p-6 lg:p-8 flex items-center justify-between">
             <div class="flex flex-col">
               <span class="text-xs font-mono text-primary-400 uppercase tracking-widest mb-1">Explanation Mode</span>
               <!-- Optional Progress Dots for Mobile -->
               <div class="flex gap-1.5 lg:hidden mt-2">
                 <div 
                    v-for="(_, idx) in slides" 
                    :key="idx"
                    class="h-1 rounded-full transition-all duration-300"
                    :class="idx === currentSlideIndex ? 'bg-primary-500 w-6' : 'bg-white/20 w-2'"
                  ></div>
               </div>
             </div>
             
             <!-- Close Button -->
             <button 
              @click="close"
              class="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
             </button>
          </div>

          <!-- Text Content Area -->
          <div class="flex-1 overflow-y-auto px-6 lg:px-10 pb-6 relative">
             <Transition :name="direction === 'next' ? 'slide-up' : 'slide-down'" mode="out-in">
               <div :key="currentSlideIndex" class="flex flex-col justify-center min-h-[50%] pt-4 lg:pt-12">
                 <h2 class="text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight">
                   {{ slides[currentSlideIndex].title }}
                 </h2>
                 <div class="prose prose-invert prose-lg text-text-muted leading-relaxed" v-html="slides[currentSlideIndex].content"></div>
               </div>
             </Transition>
          </div>

          <!-- Bottom Navigation Bar -->
          <div class="p-6 lg:p-8 mt-auto border-t border-white/5 flex items-center justify-between bg-black/20">
             <!-- Desktop Dots -->
             <div class="hidden lg:flex gap-2">
                <div 
                  v-for="(_, idx) in slides" 
                  :key="idx"
                  class="h-1.5 rounded-full transition-all duration-300 cursor-pointer hover:bg-white/40"
                  :class="idx === currentSlideIndex ? 'bg-primary-500 w-8' : 'bg-white/20 w-3'"
                  @click="() => { direction = idx > currentSlideIndex ? 'next' : 'prev'; currentSlideIndex = idx }"
                ></div>
             </div>

             <div class="flex gap-3 w-full lg:w-auto justify-end">
               <Button 
                variant="secondary" 
                :disabled="currentSlideIndex === 0"
                @click="prevSlide"
                class="px-6"
              >
                Back
              </Button>
               <Button 
                v-if="currentSlideIndex < slides.length - 1"
                variant="primary" 
                @click="nextSlide"
                class="px-8 shadow-lg shadow-primary-500/20"
              >
                Continue
              </Button>
               <Button 
                v-else
                variant="primary" 
                @click="close"
                class="px-8 shadow-lg shadow-green-500/20"
              >
                Got it
              </Button>
             </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Visual Hero Area (Cols 5-12) -->
        <div class="lg:col-span-7 relative bg-black/40 overflow-hidden order-1 lg:order-2 h-[40vh] lg:h-auto border-b lg:border-b-0 lg:border-l border-white/5">
           <!-- Grid Background -->
           <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik00MCAwTDAsMHY0MGg0MFowIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] opacity-30"></div>
           
           <!-- Radial Glow -->
           <div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent"></div>

           <!-- Component/Image Transition Area -->
           <Transition name="scale-fade" mode="out-in">
             <div 
               :key="currentSlideIndex"
               class="absolute inset-0 flex items-center justify-center p-8 lg:p-16"
             >
               <!-- If component exists -->
               <div v-if="slides[currentSlideIndex].component" class="w-full h-full relative rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-surface/50 backdrop-blur-sm">
                 <component :is="slides[currentSlideIndex].component" v-bind="slides[currentSlideIndex].props" />
               </div>
               
               <!-- Fallback if only text (Illustration placeholder) -->
               <div v-else class="text-white/10 flex flex-col items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
               </div>
             </div>
           </Transition>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide Up/Down for Text Content */
.slide-up-enter-active,
.slide-up-leave-active,
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Scale Fade for Visuals */
.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
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
