<script setup>
import { useRouter } from 'vue-router'
import { courses } from '../data/courses.js'

const router = useRouter()

const experiences = [
  {
    id: 'knn-lvq',
    title: 'kNN & LVQ',
    subtitle: 'Classification',
    description: 'Interactive visualization of k-Nearest Neighbors. Watch how algorithms learn and classify data.',
    route: '/knn-lvq',
    color: '#4464ff',
    icon: '🎯'
  },
  {
    id: 'linear-regression',
    title: 'Linear Regression',
    subtitle: 'Regression',
    description: 'Master the "Hello World" of ML. Learn about slopes, intercepts, error, and gradients.',
    route: '/linear-regression',
    color: '#ff4444',
    icon: '📈'
  },
  {
    id: 'box-plot',
    title: 'Box Plot vs Hist',
    subtitle: 'Statistics',
    description: 'Understanding data distribution. Compare how Histograms and Box Plots represent the same data.',
    route: '/box-plot-histogram',
    color: '#a855f7', // Purple
    icon: '📊'
  },
  {
    id: 'gradient-descent',
    title: 'Gradient Descent',
    subtitle: 'Optimization',
    description: 'Play with the Learning Rate and watch an agent descend the Loss landscape.',
    route: '/gradient-descent',
    color: '#eab308', // Yellow
    icon: '🏔️'
  },
  {
    id: 'confusion-matrix',
    title: 'Confusion Matrix',
    subtitle: 'Evaluation',
    description: 'Drag and drop samples to understand accuracy, precision, and recall trade-offs.',
    route: '/confusion-matrix',
    color: '#22c55e', // Green
    icon: '⚖️'
  }
]

function navigateTo(route) {
  router.push(route)
}

function handleMouseMove(e) {
  const card = e.currentTarget
  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  card.style.setProperty('--mouse-x', `${x}px`)
  card.style.setProperty('--mouse-y', `${y}px`)
}

// Helper to estimate duration (approx 0.75 mins per step)
function getDuration(course) {
  const mins = Math.ceil(course.steps.length * 0.75)
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}

// Helper for card gradients
function getGradient(id) {
  const map = {
    'linear-regression': 'from-blue-600/20 to-cyan-500/20 hover:from-blue-600/30 hover:to-cyan-500/30 border-blue-500/30',
    'knn-lvq': 'from-indigo-600/20 to-purple-500/20 hover:from-indigo-600/30 hover:to-purple-500/30 border-indigo-500/30',
    'confusion-matrix': 'from-emerald-600/20 to-teal-500/20 hover:from-emerald-600/30 hover:to-teal-500/30 border-emerald-500/30',
    'box-plot-histogram': 'from-fuchsia-600/20 to-pink-500/20 hover:from-fuchsia-600/30 hover:to-pink-500/30 border-fuchsia-500/30',
    'data-characteristics': 'from-orange-600/20 to-amber-500/20 hover:from-orange-600/30 hover:to-amber-500/30 border-orange-500/30',
  }
  return map[id] || 'from-slate-600/20 to-slate-500/20 border-slate-500/30'
}

function getAccentColor(id) {
    const map = {
        'linear-regression': 'text-cyan-400',
        'knn-lvq': 'text-purple-400',
        'confusion-matrix': 'text-emerald-400',
        'box-plot-histogram': 'text-pink-400',
        'data-characteristics': 'text-amber-400'
    }
    return map[id] || 'text-white'
}
</script>

<template>
  <div class="min-h-screen flex flex-col relative overflow-x-hidden bg-background text-white font-sans selection:bg-primary/30">
    <!-- Background Gradients -->
    <div class="absolute inset-0 z-0 pointer-events-none">
      <div class="absolute top-[15%] left-[15%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-[30%] right-[15%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]"></div>
    </div>
    
    <header class="pt-32 pb-16 px-5 text-center relative z-10">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
          AI <span class="bg-clip-text text-transparent bg-gradient-to-br from-white to-primary-300">Playground</span>
        </h1>
        <p class="text-xl text-white/60 font-light max-w-2xl mx-auto leading-relaxed">
          Interactive experiments in Artificial Intelligence & Machine Learning designed for the future of education.
        </p>
      </div>
    </header>

    <!-- Learning Paths Section (Now First) -->
    <section class="max-w-7xl mx-auto px-6 md:px-10 w-full relative z-10 pb-24">
        <div class="flex items-center gap-4 mb-10 pl-2">
            <h2 class="text-3xl font-bold text-white">Learning Paths</h2>
            <div class="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
            <span class="text-sm font-medium text-primary-300 uppercase tracking-widest">Structured Modules</span>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div 
                v-for="course in courses"
                :key="course.id"
                class="group relative flex flex-col h-full bg-gradient-to-b backdrop-blur-md rounded-3xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-500/10 overflow-hidden cursor-pointer"
                :class="getGradient(course.id)"
                @click="navigateTo(`/learn/${course.id}/intro`)"
            >
                <div class="p-8 flex flex-col h-full">
                     <!-- Header -->
                     <div class="flex justify-between items-start mb-6">
                        <div class="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                             {{ 
                                 course.id === 'linear-regression' ? '📈' : 
                                 course.id === 'knn-lvq' ? '🎯' : 
                                 course.id === 'gradient-descent' ? '🏔️' : 
                                 course.id === 'confusion-matrix' ? '⚖️' : 
                                 course.id === 'box-plot-histogram' ? '📊' : '🎓'
                             }}
                        </div>
                        <span :class="['text-xs font-bold px-3 py-1 rounded-full bg-white/5 border border-white/5', getAccentColor(course.id)]">
                            {{ getDuration(course) }}
                        </span>
                     </div>
                     
                    <h3 class="text-2xl font-bold text-white mb-3 group-hover:text-primary-200 transition-colors">
                        {{ course.title }}
                    </h3>
                    
                    <p class="text-sm text-white/60 leading-relaxed mb-8 flex-1">
                        {{ course.description }}
                    </p>

                    <!-- Simple Action Row -->
                    <div class="flex items-center text-sm font-bold text-white group-hover:gap-2 transition-all">
                        <span>Start Learning</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Experiences Section -->
    <main class="flex-1 max-w-7xl mx-auto px-6 md:px-10 w-full relative z-10 pb-20">
      <div class="flex items-center gap-4 mb-10 pl-2">
          <h2 class="text-3xl font-bold text-white opacity-80">Quick Experiments</h2>
          <div class="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
          <span class="text-sm font-medium text-white/40 uppercase tracking-widest">Sandbox Mode</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="exp in experiences" 
          :key="exp.id" 
          class="group relative bg-white/5 border border-white/10 rounded-3xl cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-white/20 overflow-hidden"
          @click="navigateTo(exp.route)"
          @mousemove="handleMouseMove"
          :style="{ '--accent-color': exp.color }"
        >
          <!-- Glow Effect -->
          <div 
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style="background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.06), transparent 40%);"
          ></div>

          <div class="relative z-10 h-full p-8 flex flex-col bg-surface/50 backdrop-blur-sm">
            <div class="flex justify-between items-start mb-auto">
              <span class="text-4xl bg-white/5 w-16 h-16 flex items-center justify-center rounded-2xl shadow-inner border border-white/5">
                {{ exp.icon }}
              </span>
              <span class="text-2xl text-[var(--accent-color)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                →
              </span>
            </div>
            
            <div class="mt-8">
              <h3 class="text-xs font-bold uppercase tracking-widest text-[var(--accent-color)] mb-2">
                {{ exp.subtitle }}
              </h3>
              <h2 class="text-2xl font-bold text-white mb-4 group-hover:text-primary-200 transition-colors">
                {{ exp.title }}
              </h2>
              <p class="text-base text-white/60 leading-relaxed font-light">
                {{ exp.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="py-10 text-center text-white/30 text-sm relative z-10 border-t border-white/5">
      <p>Designed for the future of AI education.</p>
    </footer>
  </div>
</template>
