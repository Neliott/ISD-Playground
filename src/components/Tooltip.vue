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
const tooltipRef = ref(null)
const tooltipStyle = ref({})

function updatePosition() {
  if (!triggerRef.value || !tooltipRef.value) return
  
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  const gap = 8 // Space between trigger and tooltip
  const padding = 8 // Min distance from screen edge
  
  let top = 0
  let left = 0
  
  // Initial position calculation without transform
  switch (props.position) {
    case 'top':
      top = triggerRect.top - gap - tooltipRect.height
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
      break
    case 'bottom':
      top = triggerRect.bottom + gap
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
      break
    case 'left':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
      left = triggerRect.left - gap - tooltipRect.width
      break
    case 'right':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
      left = triggerRect.right + gap
      break
  }
  
  // Boundary checks and clamping
  const maxLeft = window.innerWidth - tooltipRect.width - padding
  const maxTop = window.innerHeight - tooltipRect.height - padding
  
  // Clamp values
  left = Math.max(padding, Math.min(left, maxLeft))
  top = Math.max(padding, Math.min(top, maxTop))
  
  tooltipStyle.value = {
    position: 'fixed',
    zIndex: 9999,
    top: `${top}px`,
    left: `${left}px`
  }
}

function onMouseEnter() {
  isHovered.value = true
  // Wait for tooltip to render so we can get its dimensions
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
          ref="tooltipRef"
          class="fixed px-3 py-2 text-xs font-medium text-white bg-gray-900/90 backdrop-blur-md rounded-lg shadow-xl pointer-events-none border border-white/10 max-w-xs leading-relaxed"
          :style="tooltipStyle"
        >
          {{ text }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
