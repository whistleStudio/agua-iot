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
    </div>

    <!-- Main Panel -->
    <div class="main">
      <!-- Header -->
      <div class="header">
        <h1>{{ activeProjID==-999 ? "" : activeProj.name }}</h1>
        <div>
          <a-button type="text" @click="clickReadingBtn">{{ isReading ? '⏸︎': '▶' }}</a-button>
          <a-button type="text">⋯</a-button>
        </div>
      </div>
      <div class="data-panel">
        <!-- Subscription Section -->
        <div class="left-panel subscription">
          <a-button type="primary" @click="clickAddSubscription">+ New Subscription</a-button>
          <ul>
            <li v-for="v in activeProj.subTopics" :style="{backgroundColor: v.color + '15'}" :key="v.topic">
              <div :style="{backgroundColor: v.color}"></div>
              <div :style="{color: v.color}">{{ v.topic }}</div>
              <div>QoS {{ v.qos }}</div>
            </li>
          </ul>
        </div>
        
        <div class="right-panel">
          <!-- Messages List -->
          <div class="messages">
            <div v-for="(msg, index) in messages" :key="index" class="message" :class="{ 'sub-msg': msg.type === 0, 'pub-msg': msg.type === 1 }"
            :style="{ borderColor: msg.type === 0 ? msg.color : '#fff' }">
              <div class="time">{{ msg.time }}</div>
              <div class="topic">
                Topic: {{ msg.topic }} <span class="qos">QoS: {{ msg.qos }}</span>
              </div>
              <div class="content">{{ msg.content }}</div>
            </div>
          </div>

          <!-- Message Publisher -->
          <div class="publisher" >
            <div class="options">
              <a-select v-model:value="format">
                <a-select-option value="plaintext">Plaintext</a-select-option>
              </a-select>
              <a-select v-model:value="qos">
                <a-select-option value="0">QoS 0</a-select-option>
                <a-select-option value="1">QoS 1</a-select-option>
                <a-select-option value="2">QoS 2</a-select-option>
              </a-select>
              <a-checkbox v-model:checked="retain" class="retain-checkbox">Retain</a-checkbox>
              <a-button type="primary" @click="handleSend">Send</a-button>
            </div>        
            <a-input v-model:value="topic" class="text-sm" />
            <a-textarea class="publish-area" v-model:value="message" :bordered="false"
            :rows="3" placeholder="Enter message..." />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { onMounted, onBeforeMount, reactive, ref, computed } from 'vue'
import ProjModal from '../components/ProjModal.vue'
import SubscriptionModal from '../components/SubscriptionModal.vue';
import bus from '../utils/bus'
import { cloneDeep } from "lodash-es";

const emit = defineEmits(['alert'])

const message = ref('')
const topic = ref('wshwsh/1/Cmsg')
const format = ref('plaintext')
const qos = ref('0')
const retain = ref(false)


const isProjModalOpen = ref(false), isSubModalOpen = ref(0), isReading = ref(false)
const activeProjID = ref(-999)
let projList = reactive([])
const passform = ref({})

const activeProjIndex = computed(() => projList.findIndex((item) => item.id === activeProjID.value))
const activeProj = computed(() => {
  if (activeProjID.value === -999) return {}
  return projList[activeProjIndex.value]
})


// type 0: 订阅消息，1: 发布消息
const messages = reactive([
  { type: 0, time: '2025-03-06 10:17:37:991', topic: 'cfun/public/CTime', content: '消息内容乱码或未解码', qos: 0, color: '#663456'},
  { type: 0, time: '2025-03-06 10:17:40:992', topic: 'cfun/public/CTime', content: '消息内容乱码或未解码', qos: 0, color: '#123456'},
  { type: 1, time: '2025-03-06 10:17:50:061', topic: 'cfun/public/CTime', content: '消息内容乱码或未解码', qos: 0, color: '#123456'},
  { type: 0, time: '2025-03-06 10:20:26:016', topic: 'cfun/public/CTime', content: '消息内容乱码或未解码', qos: 0, color: '#123456'}
])

function handleSend() {
  // 实际发送逻辑可用 MQTT.js 实现
  console.log('Send:', message.value)
  message.value = ''
}

/* 新增项目-确定 */
function handleProjModalOk(newProj) {
  isProjModalOpen.value = false
  if (newProj.name.trim() === '') return
  projList.push({
    id: new Date().getTime(),
    name: newProj.name.trim(),
    subTopics: [],
    pubTopics: [],
    cache: []
  })
  changeProjInfo()
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
    changeProjInfo()
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
    changeProjInfo()
    changeMqttCache(newSub.topic)
  }
}

// 数据本地化
function changeProjInfo() {
  window.electron.ipcRenderer.invoke('r:changeProjList', bus.projList)
    .then((res) => {
      // console.log('projList---', res)
    })
    .catch((err) => {
      console.error(err)
    })
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

// 开始/暂停监听
let tim_reading = null 
function clickReadingBtn() {
  isReading.value = !isReading.value

}
window.electron.ipcRenderer.on("m:mqttData", (_, data) => {
  console.log('mqttData ---', data)
})

/* -------------- */
onBeforeMount(() => {
  projList = reactive(bus.projList)
  if (projList.length > 0) {
    activeProjID.value = projList[0].id // 默认选中第一个项目
  }
})
</script>

<style scoped lang="scss">
@import url("../assets/css/proj.scss");
</style>
