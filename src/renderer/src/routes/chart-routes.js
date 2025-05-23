import { createMemoryHistory, createRouter } from 'vue-router'
import Common from '../views/chart-views/Common.vue'

const routes = [
  { path: '/', component: Common },
  { path: '/pubtext', component: () => import('../views//chart-views/Pubtext.vue') },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router