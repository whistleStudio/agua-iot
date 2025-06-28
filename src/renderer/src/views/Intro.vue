<template>
  <img alt="logo" class="logo" src="../assets/aguato.svg" @click="$router.push('/home/device')" />
  <a-popover placement="bottom">
    <template #content>
      <p style="color: #8e7e7e; font-weight: bold;"><img style="cursor: pointer;" :src="getImgPath('speaker.svg')" width="17" @click.stop="speak"> /əˈɡwɑːtoʊ/</p>
      <p style="color: #8e7e7e; font-weight: bold;">阿瓜头：一种逮不到蚊子的小猫；擅长观察小鸟并模仿其叫声</p>
    </template>
    <!-- <template #title>
      <span>Title</span>
    </template> -->
    <div class="title" @click.stop="$router.push('/home/device')">
      <p>阿瓜物联</p>
      <p>AGUATO</p>
    </div>
  </a-popover>
  <a-modal v-model:open="isOpen" class="update-modal" :footer="null" :closable="true" title="update available" width="400">
    <div class="modal-body">
      <h2 class="release-title" v-if="updateInfo.title">
        {{ updateInfo.title }}
        <!-- Release Note
        <span class="emoji">🎉</span> -->
      </h2>
      <div class="version-line" v-if="updateInfo.changelog">
        <span class="version-bar"></span>
        <span class="version-text">🚀 v{{ updateInfo.version }} — {{ updateInfo.releaseDate }}</span>
      </div>
      <div class="changelog"  v-if="updateInfo.changelog" v-html="updateInfo.changelog || 'No changelog provided.'"></div>
      <div class="info" v-html="updateInfo.info || ''"></div>
    </div>
    <div class="modal-footer">
      <a-button @click="handleDismiss">{{ updateInfo.cancelText || "忽略" }}</a-button>
      <a-button type="primary" @click="handleOk">{{ updateInfo.okText || "更新" }}</a-button>
    </div>
  </a-modal>
  <audio :src="getAudioPath('aguato.mp3')" ref="audioRef"></audio>
</template>

<script setup>
import { onMounted, ref, onBeforeMount, onBeforeUnmount } from 'vue'
import bus from '../utils/bus'

const isOpen = ref(false), audioRef = ref(null)
const updateInfo = ref({
  title: '',
  version: window.props.version,
  releaseDate: '',
  changelog: '', // 没有changelog时不显示version、releaseDate和changelog
  info: '',
  url: '',
  cancelText: '',
  okText: ''  
})

// 获取图片路径
function getImgPath(imgName) {
  return new URL(`../assets/img/${imgName}`, import.meta.url).href
}
// 获取音频路径
function getAudioPath(audioName) {
  return new URL(`../assets/audio/${audioName}`, import.meta.url).href
}

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

/* 发音 */
function speak() {
  console.log('speak')
  if (audioRef.value) {
    console.log('speak2')

    audioRef.value.play().catch(err => {
      console.error('Error playing audio:', err)
    })
  }
}

/* -------------------------------- */
let tim_getUpdateInfo
onBeforeMount(() => {
  let reqCount = 0
  tim_getUpdateInfo = setInterval(() => {
    if (reqCount >= 10) { clearInterval(tim_getUpdateInfo); return }
    reqCount++
    window.electron.ipcRenderer.invoke('r:getUpdateInfo').then(res => {
      if (res.err || !(res?.data?.v2)) return
      if (res.data.v2.version !== window.props.version) { // 是否显示modal取决于版本号, 可以通过传递肯定不对的版本来常驻显示
        updateInfo.value = res.data.v2
        isOpen.value = true
        console.log('reqCount:', reqCount)
      }
      clearInterval(tim_getUpdateInfo)
    })
  }, 500)
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

.title {
  text-align: center;
  cursor: pointer;
  p {
    &:nth-of-type(1) {
      font-size: 32px;
      color: #756363;
      font-weight: bold;
      font: bold 32px/1 'Microsoft YaHei', 'Heiti', '微软雅黑', '黑体', sans-serif;
      letter-spacing: 3px;
      margin-bottom: 10px;
    }
    &:nth-of-type(2) {
      font-size: 64px;
      color: #e3b8b8;
      font-weight: bold;
      font: bold 19px/1 'Microsoft YaHei', 'Heiti', '微软雅黑', '黑体', sans-serif;
      letter-spacing: 5px;
    }
  }
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