<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const experiences = [
  {
    id: 'knn-lvq',
    title: 'kNN & LVQ Visualization',
    description: 'Interactive visualization of k-Nearest Neighbors and Learning Vector Quantization algorithms.',
    route: '/knn-lvq',
    color: '#4464ff'
  }
]

function navigateTo(route) {
  router.push(route)
}
</script>

<template>
  <div class="home-container">
    <header class="hero">
      <h1>AI Things</h1>
      <p>Interactive Artificial Intelligence Experiments</p>
    </header>

    <div class="grid">
      <div 
        v-for="exp in experiences" 
        :key="exp.id" 
        class="card"
        @click="navigateTo(exp.route)"
        :style="{ '--accent-color': exp.color }"
      >
        <div class="card-content">
          <h2>{{ exp.title }}</h2>
          <p>{{ exp.description }}</p>
        </div>
        <div class="card-footer">
          <span class="explore-btn">Explore →</span>
        </div>
      </div>
    </div>

    <footer class="footer">
      <p>Built with Vue 3 + Vite + WebGL</p>
    </footer>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.hero {
  text-align: center;
  margin-bottom: 60px;
  padding-top: 40px;
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(to right, #fff, #888);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 16px;
}

.hero p {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.6);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  flex: 1;
}

.card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--accent-color);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.card:hover::before {
  opacity: 1;
}

.card h2 {
  font-size: 1.5rem;
  margin: 0 0 12px 0;
  color: rgba(255, 255, 255, 0.9);
}

.card p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
  margin: 0;
}

.card-footer {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.explore-btn {
  color: var(--accent-color);
  font-weight: 600;
  font-size: 0.9rem;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.card:hover .explore-btn {
  opacity: 1;
}

.footer {
  margin-top: 60px;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.9rem;
  padding-bottom: 20px;
}
</style>
