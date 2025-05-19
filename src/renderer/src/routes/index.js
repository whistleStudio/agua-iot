import { createMemoryHistory, createRouter } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../views/Intro.vue') },
  { 
    path: '/home', 
    component: () => import('../views/Home.vue'), 
    children: [
      {
        path: 'device',
        component: () => import('../views/Device.vue'),
      },
      {
        path: 'proj',
        component: () => import('../views/Proj.vue'),
      }
    ]
  }
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router