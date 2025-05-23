<!-- 
1 menu选中
-->
<template>
  <ConnectionModal :open="connectionModalInfo.isOpen" @cancel="connectionModalInfo.isOpen=false"/>
  <a-alert class="alert" :message="alertInfo.msg" :type="alertInfo.tp" show-icon v-if="alertInfo.isShow"/>
  <div class="container">
    <!-- Menu -->
    <div class="menu">
      <div class="logo">
        <img alt="logo" src="../assets/electron.svg" @click="$router.push('/')"/>
      </div>
      <div class="menu-item">
        <img v-for="(item, index) in menuListInfo" :src="getMenuIconPath(index)" :alt="item.name" :key="index"
        @click="() => $router.push(item.href)" />
      </div>
    </div> 
    <router-view @alert="showCustomAlert"/>
  </div>
</template>


<script setup>
import { reactive, ref } from 'vue'
import ConnectionModal from '../components/ProjModal.vue'



// const toHref = href => {$router.push(href)}
const alertInfo = reactive({
  isShow: false,
  msg: '',
  tp: 'info'
})


const menuListInfo = reactive([
  { name: 'Device', href: "/home/device"},
  { name: 'Proj'  , href: "/home/proj"},
  { name: 'Chart', href: "/home/chart/common"}
])

function getMenuIconPath(index) {
  return new URL(`../assets/img/menu_${index}.svg`, import.meta.url).href
}
const connectionModalInfo = reactive({
  title: '设备列表',
  content: 'Connection content',
  isOpen: false
})

/* 显示自定义提示框 */
const showCustomAlert = ({msg, type}) => {
  alertInfo.isShow = true
  alertInfo.msg = msg
  alertInfo.tp = type
  setTimeout(() => {
    alertInfo.isShow = false
  }, 1000)
}

</script>

<style scoped lang="scss">
@import url("../assets/css/home.scss");
</style>
