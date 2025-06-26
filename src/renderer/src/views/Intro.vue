<template>
  <img alt="logo" class="logo" src="../assets/aguato.svg" @click="$router.push('/home/device')" />
  <p>AGUA-IOT</p>
  <p class="netInfo"><span></span>:<span></span></p>
  <a-modal v-model:open="isOpen" class="update-modal" :footer="null" :closable="true" title="update available" width="400">
    <div class="modal-body">
      <h2 class="release-title">
        Release Note
        <span class="emoji">🎉</span>
      </h2>
      <div class="version-line">
        <span class="version-bar"></span>
        <span class="version-text">🚀 v{{ updateInfo.version }} — {{ updateInfo.releaseDate }}</span>
      </div>
      <div class="changelog" v-html="updateInfo.changelog || 'No changelog provided.'"></div>
      <div class="info" v-html="updateInfo.info || ''"></div>
    </div>
    <div class="modal-footer">
      <a-button @click="handleDismiss">忽略</a-button>
      <a-button type="primary" @click="handleOk">更新</a-button>
    </div>
  </a-modal>
</template>

<script setup>
import { onMounted, ref, onBeforeMount, onBeforeUnmount } from 'vue'
import bus from '../utils/bus'

const isOpen = ref(false)
const updateInfo = ref({
  version: window.props.version,
  releaseDate: '',
  changelog: '',
  info: '',
  url: ''
})

const handleOk = () => {
  isOpen.value = false
  // 触发更新逻辑 打开网页
  if (updateInfo.value.url) {
    window.electron.ipcRenderer.send('r:openExternal', updateInfo.value.url)
  }
}
const handleDismiss = () => {
  isOpen.value = false
  // 记录忽略本次
}

let tim_getUpdateInfo
onBeforeMount(() => {
  let reqCount = 0
  tim_getUpdateInfo = setInterval(() => {
    if (reqCount >= 10) { clearInterval(tim_getUpdateInfo); return }
    reqCount++
    window.electron.ipcRenderer.invoke('r:getUpdateInfo').then(res => {
      if (res.err || !(res?.data?.v2)) return
      const {version, releaseDate, changelog, info, url} = res.data.v2
      if (version !== window.props.version) {
        updateInfo.value = { version, releaseDate, changelog, info, url }
        isOpen.value = true
        console.log('reqCount:', reqCount)
      }
      clearInterval(tim_getUpdateInfo)
    })
  }, 500)
})

onMounted(() => {
  setTimeout(() => {
    document.querySelector('.netInfo').children[0].innerText = bus.mqttServer.localIP
    document.querySelector('.netInfo').children[1].innerText = bus.mqttServer.port
  }, 200)
})

onBeforeUnmount(() => {
  if (tim_getUpdateInfo) clearInterval(tim_getUpdateInfo)
})
</script>

<style scoped lang="scss">
.logo {
  cursor: pointer;
  width: 300px !important;
  height: 300px !important;
}

.update-modal{
  .ant-modal-content {
    border-radius: 10px;
    padding: 0 0 16px 0;
  }
}

.modal-body {
  margin-top: 12px;
  min-height: 200px;
  max-height: 260px;
  overflow-y: auto;
  padding: 18px 22px 2px 22px;
}

.release-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  .emoji {
    margin-left: 8px;
  }
}

.version-line {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  .version-bar {
    width: 5px;
    height: 26px;
    background: #37d67a;
    border-radius: 2px;
    margin-right: 8px;
    display: inline-block;
  }
  .version-text {
    font-size: 14px;
    font-weight: 500;
  }
}

.changelog {
  font-size: 14px;
  color: #333;
  margin-bottom: 14px;
  white-space: pre-line;
}

.info {
  font-size: 13px;
  color: #888;
  margin-bottom: 10px;
  white-space: pre-line;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 0 22px;
  padding-top: 10px;
  gap: 10px;
}


</style>