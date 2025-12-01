<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <div class="view-wrapper">
        <component :is="Component" />
      </div>
    </transition>
  </RouterView>
</template>

<style>
.view-wrapper {
  width: 100%;
  height: 100%;
  background-color: #000;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
