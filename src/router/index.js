import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import KnnLvqView from '../experiences/knn-lvq/KnnLvqView.vue'
import LinearRegressionView from '../experiences/linear-regression/LinearRegressionView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/knn-lvq',
      name: 'knn-lvq',
      component: KnnLvqView
    },
    {
      path: '/linear-regression',
      name: 'linear-regression',
      component: LinearRegressionView
    }
  ]
})

export default router
