<!-- 
1 menu选中
-->
<template>
  <ConnectionModal :open="connectionModalInfo.isOpen" @cancel="connectionModalInfo.isOpen=false"/>
  <a-alert class="alert" :message="alertInfo.msg" :type="alertInfo.tp" show-icon v-if="alertInfo.isShow"/>
  <div class="container">
    <!-- Menu -->
    <div v-show="!isFullscreen" class="menu">
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
import { ref, reactive, onBeforeUnmount } from 'vue'
import ConnectionModal from '../components/ProjModal.vue'
import bus from '../utils/bus'

// const toHref = href => {$router.push(href)}
const alertInfo = reactive({
  isShow: false,
  msg: '',
  tp: 'info'
})

const menuListInfo = reactive([
  { name: 'Device', href: "/home/device"},
  { name: 'Proj'  , href: "/home/proj"},
  { name: 'Chart', href: "/home/chart/layout"}
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
const showCustomAlert = ({msg, type, time=1000}) => {
  // console.log('showCustomAlert:', msg, type)
  alertInfo.isShow = true
  alertInfo.msg = msg
  alertInfo.tp = type
  setTimeout(() => {
    alertInfo.isShow = false
  }, time)
}

bus.on('showCustomAlert', showCustomAlert)

/* 监听全屏事件 */
const isFullscreen = ref(false)
const enterFullscreen = () => { isFullscreen.value = true }
bus.on('enterFullscreen', enterFullscreen)
const exitFullscreen = () => { isFullscreen.value = false }
bus.on('exitFullscreen', exitFullscreen)

/* ------------------------ */
onBeforeUnmount(() => {
  bus.off('showCustomAlert', showCustomAlert)
  bus.off('enterFullscreen', enterFullscreen)
  bus.off('exitFullscreen', exitFullscreen)
  // 更新本地LocalIp
  let updateFlag = fasle
  const localIp = bus.mqttServer.localIP || "", port = bus.mqttServer.port || 1883;
  bus.projList.forEach(proj => {
    if (proj.mode === 'local') {
      if (proj.localIp !== localIp || proj.port !== port) {
        proj.localIp = localIp; 
        proj.port = port; 
        updateFlag = true;
      }
    }
  });
  if (updateFlag) bus.changeProjInfo() 
})
</script>

<style scoped lang="scss">
@import url("../assets/css/home.scss");
</style>
