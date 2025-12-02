<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="bg-surface/80 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white/10 text-text">
    <div v-if="title || $slots.header" class="flex items-center justify-between mb-4 gap-4">
      <h2 v-if="title" class="text-xl font-bold tracking-tight">{{ title }}</h2>
      <slot name="header"></slot>
    </div>
    <slot></slot>
  </div>
</template>
