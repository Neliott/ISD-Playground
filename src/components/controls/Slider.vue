<script setup>
defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 1
  }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="relative h-6 flex items-center">
    <input 
      type="range" 
      :min="min" 
      :max="max" 
      :step="step"
      :value="modelValue"
      @input="$emit('update:modelValue', Number($event.target.value))"
      class="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white hover:accent-white/80"
    />
  </div>
</template>
