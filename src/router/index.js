import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import KnnLvqView from '../experiences/knn-lvq/KnnLvqView.vue'
import LinearRegressionView from '../experiences/linear-regression/LinearRegressionView.vue'
import BoxPlotHistogramView from '../experiences/box-plot-histogram/BoxPlotHistogramView.vue'
import GradientDescentView from '../experiences/gradient-descent/GradientDescentView.vue'
import ConfusionMatrixView from '../experiences/confusion-matrix/ConfusionMatrixView.vue'

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
    },
    {
      path: '/box-plot-histogram',
      name: 'box-plot-histogram',
      component: BoxPlotHistogramView
    },
    {
      path: '/gradient-descent',
      name: 'gradient-descent',
      component: GradientDescentView
    },
    {
      path: '/confusion-matrix',
      name: 'confusion-matrix',
      component: ConfusionMatrixView
    }
  ]
})

export default router
