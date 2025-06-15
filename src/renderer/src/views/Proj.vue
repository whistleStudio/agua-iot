<!-- 
 1 未校验订阅本地化异常处理
-->
<template>
  <ProjModal :open="isProjModalOpen" @ok="handleProjModalOk" @cancel="isProjModalOpen=false"/>
  <SubscriptionModal :open="isSubModalOpen" @ok="handleSubModalOk" @cancel="isSubModalOpen=0" :passform="passform"/>
  <div class="container">
    <!-- Sidebar -->
    <div class="sidebar">
      <div>
        <span>项目</span>
        <span class="add" @click="()=>{isProjModalOpen=true}">+</span>
      </div>
      <ul>
        <li v-for="v in projList" :key="v.id" @click="() => {activeProjID = v.id; console.log('v.id ---', v.id, v.name)}"
          :class="{ 'active': activeProjID == v.id }">
          <span class="proj-name">{{ v.name }}</span> 
          <span class="delete-proj" @click.stop="handleDeleteProj(v.id)">-</span>
        </li>
      </ul>
      <div class="localIP">{{ bus.mqttServer.localIP }}:{{ bus.mqttServer.port }}</div>
    </div>

    <!-- Main Panel -->
    <div class="main">
      <!-- Header -->
      <div class="header">
        <h1>{{ activeProjID==-999 ? "" : activeProj.name }}</h1>
        <div class="header-btns">
          <!-- <img :src="getImgPath('chart.svg')" class="chart-btn" @click="clickChartBtn"/> -->
          <div @click="clickReadingBtn" class="reading-btn">
            <img v-if="isReading" :src="getImgPath('stop.svg')" alt="">
            <img v-else :src="getImgPath('start.svg')" alt="">
          </div>          
          <!-- <a-button type="text">⋯</a-button> -->
        </div>
      </div>
      <div class="data-panel">
        <!-- Subscription Section -->
        <div class="left-panel subscription">
          <a-button type="primary" @click="clickAddSubscription">+ 创建新的订阅</a-button>
          <ul>
            <li v-for="(v, i) in activeProj.subTopics" :style="{backgroundColor: v.color + '15'}" :key="v.topic"
            @mouseover="hoverSubIndex = i" @mouseleave="hoverSubIndex = -1">
              <div :style="{backgroundColor: v.color}"></div>
              <div :style="{color: v.color}">{{ v.topic }}</div>
              <div>QoS {{ v.qos }}</div>
              <div class="delete" :class="{display: i==hoverSubIndex}" @click.stop="clickDeleteSub(i)">❌</div>
            </li>
          </ul>
        </div>
        
        <div class="right-panel">
          <!-- Messages List -->
          <div class="messages" ref="messagesRef">
            <div v-for="(msg, index) in activeProj.cache" :key="index" class="message" :class="{ 'sub-msg': msg.type === 0, 'pub-msg': msg.type === 1 }"
            :style="{ borderColor: msg.type === 0 ? msg.color : '#fff' }">
              <div class="time">{{ msg.time }}</div>
              <div class="topic">
                主题: {{ msg.topic }} <span class="qos">QoS: {{ msg.qos }}</span>
              </div>
              <div class="content">{{ msg.content }}</div>
            </div>
            <img class="trashbin" :src="getImgPath('trashbin.svg')" @click="emptyCache"/>
          </div>

          <!-- Message Publisher -->
          <div class="publisher" >
            <div class="options">
              <a-select v-model:value="pubMsg.format">
                <a-select-option value="plaintext">Plaintext</a-select-option>
              </a-select>
              <a-select v-model:value="pubTopic.qos">
                <a-select-option v-for="(v, i) in Array(3)" :value="i">QoS {{ i }}</a-select-option>
              </a-select>
              <a-checkbox v-model:checked="pubTopic.retain" class="retain-checkbox">Retain</a-checkbox>
              <a-button type="primary" @click="handleSend">发布</a-button>
            </div>        
            <a-input v-model:value.trim="pubTopic.topic" class="text-sm" placeholder="请输入主题名称..."
            @blur="blurPubTopic">
              <template #suffix >
                <a-popover trigger="click" placement="topRight">
                  <template #content>
                    <template v-if="activeProj.pubTopics.length > 0">
                      <p v-for="(v, i) in activeProj.pubTopics" class="pubhistory" @click="{pubTopic.topic = v.topic; pubHistoryBtnRef.click()}"
                      @mouseover="hoverPubIndex = i" @mouseleave="hoverPubIndex = -1" :key="v.topic+v.qos+v.retain">
                        <span>{{ v.topic }}</span>
                        <span>QoS: {{ v.qos }} </span>
                        <span>retain: {{ Number(v.retain) }}</span>
                        <span class="delete" :class="{display: i==hoverPubIndex}" @click.stop="clickDeletePub(i)">❌</span>
                      </p>
                    </template> 
                    <p v-else>暂无发布主题</p>
                  </template>
                  <img :src="getImgPath('pubhistory.svg')" alt="" class="pubhistory-btn" ref="pubHistoryBtnRef"/>
                </a-popover>
              </template>
            </a-input>
            <a-textarea class="publish-area" v-model:value.trim="pubMsg.payload" :bordered="false"
            :rows="3" placeholder="请输入主题内容..." />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { onMounted, onBeforeMount, reactive, ref, computed, watch, onBeforeUnmount } from 'vue'
import ProjModal from '../components/ProjModal.vue'
import SubscriptionModal from '../components/SubscriptionModal.vue';
import bus from '../utils/bus'
import { cloneDeep } from "lodash-es";

const emit = defineEmits(['alert'])

const pubTopic = ref({
  topic: '',
  qos: 0,
  retain: false
})
const pubMsg = ref({
  payload: '',
  time: '',
  format: 'plaintext'
})


const messagesRef = ref(null), pubHistoryBtnRef = ref(null)

const isProjModalOpen = ref(false), isSubModalOpen = ref(0), isReading = ref(false)
const activeProjID = ref(-999), hoverSubIndex = ref(-1), hoverPubIndex = ref(-1)
let projList = reactive([])
const passform = ref({})

const activeProjIndex = computed(() => {
  const idx = projList.findIndex((item) => item.id === activeProjID.value)
  bus.activeProjIdx = idx
  return idx
})
const activeProj = computed(() => {
  if (activeProjID.value === -999) return {}
  return projList[activeProjIndex.value]
})



/* 新增项目-确定 */
function handleProjModalOk(newProj) {
  isProjModalOpen.value = false
  if (newProj.name.trim() === '') return
  projList.push({
    id: new Date().getTime(),
    name: newProj.name.trim(),
    subTopics: [],
    pubTopics: [],
    cache: [],
    canvasCache: {
      layout: {
        theme: "light",
        background: "default",
        bgUrl: "",
        swatch: {
          compBgColor: "rgb(255, 255, 255)",
          compFontColor: "rgb(66, 80, 107)",
          compPhColor: "rgb(66, 80, 107, 0.5)",
          primaryColor: "rgb(35, 138, 255)",
        }
      },
      rawComponents: []
    }
  })
  bus.changeProjInfo()
  if (activeProjID.value === -999) {
    activeProjID.value = projList[0].id // 默认选中第一个项目
  }
}

/* 删除项目 */
function handleDeleteProj(id) {
  // 删除bus.projList中的项目
  const index = bus.projList.findIndex((item) => item.id === id)
  if (index !== -1) {
    projList.splice(index, 1)
    bus.changeProjInfo()
    // 修正activeProjID
    if (activeProjID.value == id) {
      if (projList.length > 0) {
        activeProjID.value = projList[0].id // 默认选中第一个项目
      } else {
        activeProjID.value = -999 // 没有项目时设置为-999
      }
    }
  }
}

/* 点击add Subscription  */
function clickAddSubscription() {
  if (activeProjID.value === -999) {
    emit("alert", { type: "warning", msg: "请先创建一个项目" })
    return
  }
  passform.value = null;
  isSubModalOpen.value = 1
}

/* 新增/编辑订阅-确定 */
function handleSubModalOk(newSub) {
  // newSub = newSub.value
  console.log('handleSubModalOk ---', newSub)
  isSubModalOpen.value = 0
  if (newSub.topic === '' || activeProjID.value === -999) return
  // 相同订阅主题不添加
  const index = activeProj.value.subTopics.findIndex((item) => item.topic === newSub.topic)
  console.log('index ---', index)
  if (index === -1) {
    activeProj.value.subTopics.push({
      topic: newSub.topic,
      qos: newSub.qos,
      color: newSub.color,
      alias: newSub.alias
    })
    console.log('activeProj.subTopics ---', activeProj.value.subTopics)
    bus.changeProjInfo()
    changeMqttCache(newSub.topic)
  }
}

/* 删除订阅 */
function clickDeleteSub(index) {
  console.log('clickDeleteSub ---', index)
  if (activeProjID.value === -999) return
  activeProj.value.subTopics.splice(index, 1)
  bus.changeProjInfo()
}

/* 删除发布 */
function clickDeletePub(index) {
  console.log('clickDeletePub ---', index)
  if (activeProjID.value === -999) return
  activeProj.value.pubTopics.splice(index, 1)
  bus.changeProjInfo()
}

/* 发布主题输入框模糊 */
function blurPubTopic() {
  if (pubTopic.value.topic === '') return
  // 相同发布主题不添加
  const index = activeProj.value.pubTopics.findIndex((item) => item.topic === pubTopic.value.topic && item.qos === pubTopic.value.qos && item.retain === pubTopic.value.retain)
  if (index === -1) {
    if (activeProj.value.pubTopics.length > 9) {
      activeProj.value.pubTopics.shift()
    }
    activeProj.value.pubTopics.push(cloneDeep(pubTopic.value))
    bus.changeProjInfo()
  }
}

/* 发布消息 */
function handleSend() {
  if (pubTopic.value.topic === '' || pubMsg.value.payload === '' || activeProjID.value === -999) return
  window.electron.ipcRenderer.invoke('r:publishMqtt', {
    ...pubTopic.value,
    payload: pubMsg.value.payload,
  })
  .then((res) => {
    if (res.err) {
      emit("alert", { type: "error", msg: res.msg })
    } else {
      const time = new Date().toISOString().replace('T', ' ').replace('Z', '')
      activeProj.value.cache.push({ type: 1, time, topic: pubTopic.value.topic, qos: pubTopic.value.qos, content: pubMsg.value.payload, color: '#fff' })
      bus.changeProjInfo()
    }
  })
}

/* 清空缓存 */
function emptyCache() {
  if (activeProjID.value === -999) return
  activeProj.value.cache = []
  bus.changeProjInfo()
}

// 修改mqtt缓存
function changeMqttCache(topic) {
  window.electron.ipcRenderer.invoke('r:changeMqttCache', topic)
    .then((res) => {
      // console.log('mqttCache---', res)
    })
    .catch((err) => {
      console.error(err)
    })
}

/* 开始/暂停监听 */
function clickReadingBtn() {
  isReading.value = !isReading.value
}
// 监听mqtt数据
window.electron.ipcRenderer.on("m:mqttData", (_, data) => {
  const { topic, qos, payload, time } = data
  if (activeProjID.value === -999 || !isReading.value) return
  const index = activeProj.value.subTopics.findIndex((item) => item.topic === topic)
  activeProj.value.cache.push({ type: 0, time, topic, qos, content: payload, color: activeProj.value.subTopics[index].color })
  bus.changeProjInfo()
})

// 获取图片路径
function getImgPath(imgName) {
  return new URL(`../assets/img/${imgName}`, import.meta.url).href
}

/* ---------------------------- */
watch(() => activeProj.value.cache, (newVal) => {
  console.log('activeProj.cache ---')
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}, { deep: true })

/* ---------------------------------- */
onBeforeMount(() => {
  projList = reactive(bus.projList)
  if (projList.length > 0) {
    if (bus.activeProjIdx === -1) activeProjID.value = projList[0].id // 默认选中第一个项目
    else activeProjID.value = projList[bus.activeProjIdx].id 
  }
})

onBeforeUnmount(() => {
  window.electron.ipcRenderer.removeAllListeners("m:mqttData")
})
</script>

<style scoped lang="scss">
@import url("../assets/css/proj.scss");
</style>
