<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { courses } from '../data/courses'

const route = useRoute()
const router = useRouter()

const isSidebarOpen = ref(false)

const currentCourseId = computed(() => route.params.courseId)
const currentCourse = computed(() => courses.find(c => c.id === currentCourseId.value))

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Helper to determine if a step is active or completed (simple logic for now)
const getStepStatus = (courseId, stepId) => {
  const isCurrent = route.params.lessonId === stepId && route.params.courseId === courseId
  // In a real app, we'd check user progress. For now, just simplistic active check.
  return isCurrent ? 'active' : 'inactive'
}

const navigateTo = (courseId, stepId) => {
  router.push(`/learn/${courseId}/${stepId}`)
  isSidebarOpen.value = false // Close on mobile after selection
}
</script>

<template>
  <div class="flex h-screen w-full bg-background text-text overflow-hidden">
    <!-- Mobile Header -->
    <div class="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface border-b border-white/5 z-50 flex items-center px-4 justify-between backdrop-blur-md bg-opacity-80">
      <div class="flex items-center gap-3">
        <button @click="toggleSidebar" class="p-2 -ml-2 text-text-muted hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <span class="font-bold truncate" v-if="currentCourse">{{ currentCourse.title }}</span>
      </div>
      <router-link to="/" class="text-xs font-mono text-primary-400">ISD PLAYGROUND</router-link>
    </div>

    <!-- Sidebar Navigation -->
    <aside 
      class="fixed inset-y-0 left-0 z-40 w-72 bg-surface/95 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 lg:relative lg:translate-x-0"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex flex-col h-full">
        <!-- Sidebar Header -->
        <div class="h-16 flex items-center px-6 border-b border-white/5 shrink-0">
          <router-link to="/" class="flex items-center gap-2 group">
            <div class="w-8 h-8 rounded bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-primary-500/20 transition-all">
              AI
            </div>
            <span class="font-bold tracking-tight group-hover:text-primary-400 transition-colors">ISD Playground</span>
          </router-link>
        </div>

        <!-- Course Content List -->
        <div class="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          <div v-if="currentCourse">
            <h2 class="px-2 text-xs font-mono text-text-muted uppercase tracking-widest mb-4">Current Module</h2>
            <div class="space-y-1">
              <div 
                v-for="(step, index) in currentCourse.steps" 
                :key="step.id"
                @click="navigateTo(currentCourse.id, step.id)"
                class="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 border border-transparent"
                :class="[
                  getStepStatus(currentCourse.id, step.id) === 'active' 
                    ? 'bg-primary-500/10 border-primary-500/20 text-white' 
                    : 'hover:bg-white/5 text-text-muted hover:text-white'
                ]"
              >
                <!-- Icon based on type -->
                <div class="shrink-0 w-5 h-5 flex items-center justify-center rounded bg-white/5" :class="getStepStatus(currentCourse.id, step.id) === 'active' ? 'bg-primary-500/20 text-primary-400' : 'text-text-muted/50'">
                  <span v-if="step.type === 'concept'" class="text-[10px] font-bold">{{ index + 1 }}</span>
                  <svg v-else-if="step.type === 'experiment'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                  <svg v-else-if="step.type === 'quiz'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
                
                <span class="text-sm font-medium truncate">{{ step.title }}</span>
              </div>
            </div>
          </div>

          <!-- Other Courses Links (Optional) -->
          <div>
            <h2 class="px-2 text-xs font-mono text-text-muted uppercase tracking-widest mb-4">All Modules</h2>
            <div class="space-y-1">
              <router-link 
                v-for="c in courses" 
                :key="c.id"
                :to="`/learn/${c.id}/${c.steps[0].id}`"
                class="block px-3 py-2 text-sm text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors truncate"
                :class="{ 'opacity-50 pointer-events-none': c.id === currentCourseId }"
              >
                {{ c.title }}
              </router-link>
            </div>
          </div>
        </div>

        <!-- User/Footer Area -->
        <div class="p-4 border-t border-white/5">
          <div class="text-xs text-text-muted text-center">
            &copy; 2026 ISD Playground
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 relative overflow-hidden bg-background pt-16 lg:pt-0">
      <slot />
    </main>
    
    <!-- Mobile Overlay -->
    <div 
      v-if="isSidebarOpen" 
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
      @click="isSidebarOpen = false"
    ></div>
  </div>
</template>
