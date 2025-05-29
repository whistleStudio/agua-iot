import { createMemoryHistory, createRouter } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  { path: '/', component: () => import('../views/Intro.vue') },
  { 
    path: '/home', 
    component: Home, 
    children: [
      {
        path: 'device',
        component: () => import('../views/Device.vue'),
      },
      {
        path: 'proj',
        component: () => import('../views/Proj.vue'),
      },
      {
        path: 'chart',
        component: () => import('../views/Chart.vue'),
        children: [
          {
            path: 'layout',
            component: () => import('../views/chart-views/Layout.vue'),
          },
          {
            path: 'pubtext',
            component: () => import('../views/chart-views/Pubtext.vue'),
          },
          {
            path: 'button',
            component: () => import('../views/chart-views/Pubtext.vue'),
          },
          {
            path: 'linechart',
            component: () => import('../views/chart-views/LineChart.vue'),
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router