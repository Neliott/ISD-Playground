<script setup>
defineProps({
  label: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <div v-if="label" class="flex justify-between items-center">
      <label class="text-xs font-medium text-white/50 uppercase tracking-wider">{{ label }}</label>
      <slot name="value"></slot>
    </div>
    <div v-if="description" class="text-xs text-white/40 mb-1 leading-relaxed">
      {{ description }}
    </div>
    <slot></slot>
  </div>
</template>
