<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  position: {
    type: String,
    default: 'right' // top, bottom, left, right
  }
})

const isHovered = ref(false)
const triggerRef = ref(null)
const tooltipStyle = ref({})
const arrowStyle = ref({})

function updatePosition() {
  if (!triggerRef.value) return
  
  const rect = triggerRef.value.getBoundingClientRect()
  const gap = 8 // Space between trigger and tooltip
  
  let top = 0
  let left = 0
  
  // Default styles
  const style = { position: 'fixed', zIndex: 9999 }
  
  switch (props.position) {
    case 'top':
      top = rect.top - gap
      left = rect.left + rect.width / 2
      style.transform = 'translate(-50%, -100%)'
      break
    case 'bottom':
      top = rect.bottom + gap
      left = rect.left + rect.width / 2
      style.transform = 'translate(-50%, 0)'
      break
    case 'left':
      top = rect.top + rect.height / 2
      left = rect.left - gap
      style.transform = 'translate(-100%, -50%)'
      break
    case 'right':
      top = rect.top + rect.height / 2
      left = rect.right + gap
      style.transform = 'translate(0, -50%)'
      break
  }
  
  style.top = `${top}px`
  style.left = `${left}px`
  
  tooltipStyle.value = style
}

function onMouseEnter() {
  isHovered.value = true
  nextTick(() => {
    updatePosition()
  })
}
</script>

<template>
  <div 
    ref="triggerRef"
    class="relative flex flex-col"
    @mouseenter="onMouseEnter"
    @mouseleave="isHovered = false"
  >
    <slot></slot>
    
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div 
          v-if="isHovered"
          class="fixed px-3 py-2 text-xs font-medium text-white bg-gray-900/90 backdrop-blur-md rounded-lg shadow-xl pointer-events-none border border-white/10 max-w-xs leading-relaxed"
          :style="tooltipStyle"
        >
          {{ text }}
          <!-- Arrow (simplified, just a small square) -->
          <!-- Implementing a perfect arrow with fixed positioning is tricky without a library like floating-ui, 
               so we'll omit it for simplicity or add it inside if needed. 
               For now, a clean floating tooltip is enough. -->
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
