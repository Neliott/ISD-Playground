<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary' // 'primary', 'danger', 'secondary'
  }
})
</script>

<template>
  <button 
    class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full"
    :class="{
      'bg-white/10 text-white hover:bg-white/20': variant === 'primary',
      'bg-red-500/20 text-red-200 hover:bg-red-500/30': variant === 'danger',
      'bg-transparent border border-white/10 text-white/60 hover:text-white hover:border-white/20': variant === 'secondary'
    }"
  >
    <slot></slot>
  </button>
</template>
