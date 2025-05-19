<template>
  <ProjModal :open="isProjModalOpen" @ok="handleProjModalOk" @cancel="isProjModalOpen=false"/>
  <div class="container">
    <!-- Sidebar -->
    <div class="sidebar">
      <div>
        <span>项目</span>
        <span class="add" @click="()=>{isProjModalOpen=true; newProj.name=''}">+</span>
      </div>
      <ul>
        <li v-for="v in projList" :key="v.id">
          <span class="proj-name">{{ v.name }}</span> 
          <span class="delete-proj" @click="handleDeleteProj(v.id)">-</span>
        </li>
      </ul>
    </div>

    <!-- Main Panel -->
    <div class="main">
      <!-- Header -->
      <div class="header">
        <h1>cfiot</h1>
        <div>
          <a-button type="text">⏻</a-button>
          <a-button type="text">⋯</a-button>
        </div>
      </div>
      <div class="data-panel">
        <!-- Subscription Section -->
        <div class="left-panel subscription">
          <a-button type="primary">+ New Subscription</a-button>

        </div>
        
        <div class="right-panel">
          <!-- Messages List -->
          <div class="messages">
            <div v-for="(msg, index) in messages" :key="index" class="message">
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
            rows="3" placeholder="Enter message..." />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { onMounted, onBeforeMount, reactive, ref } from 'vue'
import ProjModal from '../components/ProjModal.vue'
import bus from '../utils/bus'
import { cloneDeep } from "lodash-es";

const message = ref('')
const topic = ref('wshwsh/1/Cmsg')
const format = ref('plaintext')
const qos = ref('0')
const retain = ref(false)
const isProjModalOpen = ref(false)
let projList = reactive([])


function getMenuIconPath(index) {
  return new URL(`../assets/img/menu_${index}.svg`, import.meta.url).href
}


const messages = ref([
  { time: '2025-03-06 10:17:37:991', topic: 'cfun/public/CTime', content: '消息内容乱码或未解码', qos: 0 },
  { time: '2025-03-06 10:17:40:992', topic: 'cfun/public/CTime', content: '消息内容乱码或未解码', qos: 0 },
  { time: '2025-03-06 10:17:50:061', topic: 'cfun/public/CTime', content: '消息内容乱码或未解码', qos: 0 },
  { time: '2025-03-06 10:20:26:016', topic: 'cfun/public/CTime', content: '消息内容乱码或未解码', qos: 0 }
])

function handleSend() {
  // 实际发送逻辑可用 MQTT.js 实现
  console.log('Send:', message.value)
  message.value = ''
}

// Project Modal OK
function handleProjModalOk(newProj) {
  isProjModalOpen.value = false
  if (newProj.name === '') return
  projList.push({
    id: new Date().getTime(),
    name: newProj.name.trim(),
    subTopics: [],
    pubTopics: []
  })
  changeProjInfo()
}

// Delete Project
function handleDeleteProj(id) {
  // 删除bus.projList中的项目
  const index = bus.projList.findIndex((item) => item.id === id)
  if (index !== -1) {
    // bus.projList.splice(index, 1)
    projList.splice(index, 1)
    console.log(bus.projList)
    changeProjInfo()
  }
}

function changeProjInfo() {
  window.electron.ipcRenderer.invoke('r:changeProjList', bus.projList)
    .then((res) => {
      // console.log('projList---', res)
    })
    .catch((err) => {
      console.error(err)
    })
}

/* -------------- */
onBeforeMount(() => {
  projList = reactive(bus.projList)
  console.log('projList---', projList)
})
</script>

<style scoped lang="scss">
@import url("../assets/css/proj.scss");
</style>
