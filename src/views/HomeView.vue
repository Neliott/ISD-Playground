<script setup>
import { useRouter } from 'vue-router'

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
    description: 'Interactive Simpe Linear Regression. Add points and see the best fit line update.',
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
</script>

<template>
  <div class="min-h-screen flex flex-col relative overflow-x-hidden bg-background text-white font-sans selection:bg-primary/30">
    <!-- Background Gradients -->
    <div class="absolute inset-0 z-0 pointer-events-none">
      <div class="absolute top-[15%] left-[15%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-[30%] right-[15%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]"></div>
    </div>
    
    <header class="pt-32 pb-20 px-5 text-center relative z-10">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
          AI <span class="bg-clip-text text-transparent bg-gradient-to-br from-white to-primary-300">Playground</span>
        </h1>
        <p class="text-xl text-white/60 font-light max-w-2xl mx-auto leading-relaxed">
          Interactive experiments in Artificial Intelligence & Machine Learning designed for the future of education.
        </p>
      </div>
    </header>

    <main class="flex-1 max-w-7xl mx-auto px-6 md:px-10 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 pb-20">
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
    </main>

    <footer class="py-10 text-center text-white/30 text-sm relative z-10 border-t border-white/5">
      <p>Designed for the future of AI education.</p>
    </footer>
  </div>
</template>
