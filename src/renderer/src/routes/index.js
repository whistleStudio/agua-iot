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
            component: () => import('../views/chart-views/Button.vue'),
          },
          {
            path: 'switch',
            component: () => import('../views/chart-views/Switch.vue'),
          },
          {
            path: 'slider',
            component: () => import('../views/chart-views/Slider.vue'),
          },
          {
            path: 'radio',
            component: () => import('../views/chart-views/Radio.vue'),
          },
          {
            path: 'checkbox',
            component: () => import('../views/chart-views/Checkbox.vue'),
          },
          {
            path: 'subcommontext',
            component: () => import('../views/chart-views/Subcommontext.vue'),
          },
          {
            path: 'sublabeltext',
            component: () => import('../views/chart-views/Sublabeltext.vue'),
          },
          {
            path: 'linechart',
            component: () => import('../views/chart-views/LineChart.vue'),
          },
          {
            path: 'gauge',
            component: () => import('../views/chart-views/Gauge.vue'),
          },
          {
            path: "pie",
            component: () => import('../views/chart-views/Pie.vue'),
          },
          {
            path: 'scatter',
            component: () => import('../views/chart-views/Scatter.vue'),
          },
          {
            path: 'liquidfill',
            component: () => import('../views/chart-views/Liquidfill.vue'),
          },
          {
            path: 'bar',
            component: () => import('../views/chart-views/Bar.vue'),
          },
          {
            path: 'stackedarea',
            component: () => import('../views/chart-views/Stackedarea.vue'),
          },
          {
            path: 'radar',
            component: () => import('../views/chart-views/Radar.vue'),
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