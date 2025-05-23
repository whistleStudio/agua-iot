// import '../src/assets/main.css'

import { createApp } from 'vue'
import ChartApp from './ChartApp.vue'
import router from '../src/routes/chart-routes.js'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

createApp(ChartApp).use(router).use(Antd).mount('#app')
