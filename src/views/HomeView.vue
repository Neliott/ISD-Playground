<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const experiences = [
  {
    id: 'knn-lvq',
    title: 'kNN & LVQ',
    subtitle: 'Classification Algorithms',
    description: 'Interactive visualization of k-Nearest Neighbors and Learning Vector Quantization. Watch how algorithms learn and classify data in real-time.',
    route: '/knn-lvq',
    color: '#4464ff',
    icon: '🎯'
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
  <div class="home-container">
    <div class="background-gradient"></div>
    
    <header class="hero">
      <div class="hero-content">
        <h1 class="title">AI <span class="gradient-text">Playground</span></h1>
        <p class="subtitle">Interactive experiments in Artificial Intelligence & Machine Learning</p>
      </div>
    </header>

    <main class="grid-container">
      <div 
        v-for="exp in experiences" 
        :key="exp.id" 
        class="card"
        @click="navigateTo(exp.route)"
        @mousemove="handleMouseMove"
        :style="{ '--accent-color': exp.color }"
      >
        <div class="card-glow"></div>
        <div class="card-content">
          <div class="card-header">
            <span class="icon">{{ exp.icon }}</span>
            <span class="arrow">→</span>
          </div>
          <div class="card-body">
            <h3>{{ exp.subtitle }}</h3>
            <h2>{{ exp.title }}</h2>
            <p>{{ exp.description }}</p>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">
      <p>Designed for the future of AI education.</p>
    </footer>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background-color: #050505;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
}

.background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 15% 50%, rgba(68, 100, 255, 0.08), transparent 25%),
    radial-gradient(circle at 85% 30%, rgba(255, 68, 255, 0.08), transparent 25%);
  z-index: 0;
  pointer-events: none;
}

.hero {
  padding: 120px 20px 80px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.title {
  font-size: 5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1.1;
}

.gradient-text {
  background: linear-gradient(135deg, #fff 0%, #88aaff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 24px;
  font-weight: 400;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.grid-container {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 32px;
  position: relative;
  z-index: 1;
}

.card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 2px; /* For border gradient effect if needed */
  cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  overflow: hidden;
  height: 320px;
}

.card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 255, 255, 0.06),
    transparent 40%
  );
  opacity: 0;
  transition: opacity 0.3s;
}

.card:hover .card-glow {
  opacity: 1;
}

.card-content {
  background: #0a0a0a;
  height: 100%;
  border-radius: 22px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: auto;
}

.icon {
  font-size: 2.5rem;
  background: rgba(255, 255, 255, 0.05);
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.arrow {
  font-size: 1.5rem;
  color: var(--accent-color);
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.card:hover .arrow {
  opacity: 1;
  transform: translateX(0);
}

.card-body h3 {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent-color);
  margin: 0 0 8px 0;
  font-weight: 600;
}

.card-body h2 {
  font-size: 2rem;
  margin: 0 0 16px 0;
  font-weight: 700;
  color: white;
}

.card-body p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  margin: 0;
}

.footer {
  padding: 60px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.9rem;
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .title {
    font-size: 3rem;
  }
  
  .grid-container {
    padding: 0 20px;
    grid-template-columns: 1fr;
  }
}
</style>
