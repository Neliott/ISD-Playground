<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  labels: {
    type: Array,
    default: () => ['Off', 'On']
  }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex p-1 bg-black/20 rounded-xl">
    <button 
      class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200"
      :class="!modelValue ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/60'"
      @click="$emit('update:modelValue', false)"
    >
      {{ labels[0] }}
    </button>
    <button 
      class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200"
      :class="modelValue ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/60'"
      @click="$emit('update:modelValue', true)"
    >
      {{ labels[1] }}
    </button>
  </div>
</template>
