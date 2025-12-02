<script setup>
import Tooltip from '../Tooltip.vue'

defineProps({
  modelValue: {
    type: [String, Number],
    required: true
  },
  options: {
    type: Array,
    required: true
    // Array of { label: string, value: any, tooltip?: string } or just strings
  },
  layout: {
    type: String,
    default: 'grid' // 'grid' or 'list'
  }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div :class="layout === 'grid' ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2'">
    <template v-for="option in options" :key="typeof option === 'object' ? option.value : option">
      <!-- If tooltip exists, wrap in Tooltip -->
      <Tooltip 
        v-if="typeof option === 'object' && option.tooltip"
        :text="option.tooltip"
        position="top"
        class="w-full"
      >
        <button 
          @click="$emit('update:modelValue', option.value)"
          class="w-full px-3 py-2 text-xs rounded-lg border transition-all duration-200 capitalize text-center"
          :class="modelValue === option.value
            ? 'bg-white/10 border-white/20 text-white shadow-sm' 
            : 'bg-transparent border-white/5 text-white/40 hover:bg-white/5 hover:text-white/60'"
        >
          {{ option.label }}
        </button>
      </Tooltip>
      
      <!-- Otherwise just render button -->
      <button 
        v-else
        @click="$emit('update:modelValue', typeof option === 'object' ? option.value : option)"
        class="w-full px-3 py-2 text-xs rounded-lg border transition-all duration-200 capitalize text-center"
        :class="modelValue === (typeof option === 'object' ? option.value : option) 
          ? 'bg-white/10 border-white/20 text-white shadow-sm' 
          : 'bg-transparent border-white/5 text-white/40 hover:bg-white/5 hover:text-white/60'"
      >
        {{ typeof option === 'object' ? option.label : option }}
      </button>
    </template>
  </div>
</template>
