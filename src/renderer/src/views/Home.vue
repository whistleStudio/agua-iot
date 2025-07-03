<!-- 
1 menu选中
-->
<template>
  <!-- <ConnectionModal :open="connectionModalInfo.isOpen" @cancel="connectionModalInfo.isOpen=false"/> -->
  <a-alert class="alert" :message="alertInfo.msg" :type="alertInfo.tp" show-icon v-if="alertInfo.isShow"/>
  <div class="container">
    <!-- Menu -->
    <div v-show="!isFullscreen" class="menu">
      <div class="logo">
        <img alt="logo" src="../assets/aguato2.svg" @click="$router.push('/')"/>
      </div>
      <div class="menu-item">
        <img v-for="(item, index) in menuListInfo" :src="getMenuIconPath(index)" :alt="item.name" :key="index"
        @click="menuTo(index)" />
      </div>
    </div> 
    <router-view @alert="showCustomAlert"/>
  </div>
  <a-modal v-model:open="isInfoModalOpen" title="关于" @ok="handleOk" class="info-modal">
    <p>
      阿瓜物联(Aguato)文档：<br><a href="https://blog.whistlestudio.cn/essay/App/aguato-docs/index.html" target="_blank">https://blog.whistlestudio.cn/essay/App/aguato-docs/index.html</a>
    </p>
    <p>
      开发者博客：<br><a href="https://www.whistlestudio.cn" target="_blank">https://whistlestudio.cn</a>
    </p>
    <template #footer>
      <!-- <a-button type="primary" @click="handleOk">取消</a-button> -->
    </template>
  </a-modal>
</template>


<script setup>
import { ref, reactive, onBeforeMount, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
// import ConnectionModal from '../components/ProjModal.vue'
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
  { name: 'Chart', href: "/home/chart/layout"},
  { name: 'Info'}
])

function getMenuIconPath(index) {
  return new URL(`../assets/img/menu_${index}.svg`, import.meta.url).href
}

const router = useRouter()
function menuTo(index) {
  if (index <= 2) {
    router.push(menuListInfo[index].href)
  } else {
    isInfoModalOpen.value = true
    // window.electron.ipcRenderer.send('r:openExternal', 'https://www.whistlestudio.cn')
  }
}

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

/* infoModal */
const isInfoModalOpen = ref(false)
const handleOk = () => {
  isInfoModalOpen.value = false
  // 处理确认逻辑
  console.log('Modal confirmed')
}


/* ------------------------ */
onBeforeMount(() => {
  // 更新本地LocalIp
  let updateFlag = false
  const localIp = bus.mqttServer.localIP || "", port = bus.mqttServer.port || 1883;
  console.log('update localIp:', localIp, 'port:', port)
  bus.projList.forEach(proj => {
    if (proj.mode === 'local') {
      if (proj.ip !== localIp || proj.port !== port) {
        proj.ip = localIp; 
        proj.port = port; 
        updateFlag = true;
      }
    }
  });
  if (updateFlag) bus.changeProjInfo() 
})

onBeforeUnmount(() => {
  bus.off('showCustomAlert', showCustomAlert)
  bus.off('enterFullscreen', enterFullscreen)
  bus.off('exitFullscreen', exitFullscreen)
})
</script>

<style scoped lang="scss">
@import url("../assets/css/home.scss");
</style>
