<template>
  <ProjModal
    :open="isProjModalOpen"
    :title="projModalTitle"
    @ok="handleProjModalOk"
    @cancel="isProjModalOpen=false"
    :edit-form="editProjForm"
  />
  <SubscriptionModal
    :open="isSubModalOpen"
    :title="subModalTitle"
    @ok="handleSubModalOk"
    @cancel="isSubModalOpen=0"
    :passform="passform"
    :mode="activeProj.mode"
  />
  <div class="container">
    <!-- Sidebar -->
    <div class="sidebar">
      <div>
        <span>项目</span>
        <span class="add" @click="openAddProjModal">+</span>
      </div>
      <ul>
        <li
          v-for="v in projList"
          :key="v.id"
          @click="() => {activeProjID = v.id; console.log('v.id ---', v.id, v.name)}"
          @dblclick="editProjItem(v)"
          :class="{ 'active': activeProjID == v.id }"
        >
          <span class="proj-name">{{ v.name }}</span>
          <a-popconfirm
            title="确定要删除该项目吗？"
            ok-text="确定"
            cancel-text="取消"
            @confirm="handleDeleteProj(v.id)"
          >
            <span class="delete-proj" @click.stop> - </span>
          </a-popconfirm>
        </li>
      </ul>
      <div class="localIP">{{ activeProjMqttServer }}</div>
    </div>

    <!-- Main Panel -->
    <div class="main">
      <!-- Header -->
      <div class="header">
        <h1>
          {{ activeProjID==-999 ? "" : activeProj.name }}
          <img
            v-if="activeProjID !== -999"
            :src="getImgPath('settings.svg')"
            class="proj-setting-btn"
            alt="设置"
            @click="openEditProjModal"
            style="width: 20px; height: 20px; margin-left: 8px; cursor: pointer;"
          />
        </h1>
        <div class="header-btns">
          <template v-if="activeProjID !== -999 && activeProj.mode === 'remote'">
            <img
              :src="getImgPath(activeProj.connected == 1 ? 'connect_1.gif' : `connect_${activeProj.connected}.svg`)"
              class="proj-conn-btn"
              alt="连接状态"
              @click="toggleRemoteConnection"
              style="width: 40px; height: 40px; margin-left: 8px; cursor: pointer;"
            />
          </template>
        </div>
      </div>
      <div class="data-panel">
        <!-- Subscription Section -->
        <div class="left-panel subscription">
          <a-button type="primary" @click="clickAddSubscription">+ 创建新的订阅</a-button>
          <ul>
            <li
              v-for="(v, i) in activeProj.subTopics"
              :style="{backgroundColor: v.color + '15'}"
              :key="v.topic"
              @mouseover="hoverSubIndex = i"
              @mouseleave="hoverSubIndex = -1"
              @dblclick="editSubTopic(i)"
            >
              <div :style="{backgroundColor: v.color}"></div>
              <div :style="{color: v.color}">{{ v.topic }}</div>
              <div v-show="activeProj.mode==='remote'">QoS {{ v.qos }}</div>
              <a-popconfirm
                title="确定要删除该订阅主题吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="clickDeleteSub(i)"
              >
                <div class="delete" :class="{display: i==hoverSubIndex}" @click.stop>❌</div>
              </a-popconfirm>
            </li>
          </ul>
        </div>
        <div class="right-panel">
          <!-- Messages List -->
          <div class="messages" ref="messagesRef">
            <div
              v-for="(msg, index) in activeProj.cache"
              :key="index"
              class="message"
              :class="{ 'sub-msg': msg.type === 0, 'pub-msg': msg.type === 1 }"
              :style="{ borderColor: msg.type === 0 ? msg.color : '#fff' }"
            >
              <div class="time">{{ msg.time }}</div>
              <div class="topic">
                主题: {{ msg.topic }} <span class="qos" v-show="activeProj.mode === 'remote'">QoS: {{ msg.qos }}</span>
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
              <a-select v-model:value="pubTopic.qos" v-show="activeProj.mode === 'remote'">
                <a-select-option v-for="(v, i) in Array(3)" :value="i">QoS {{ i }}</a-select-option>
              </a-select>
              <a-checkbox v-model:checked="pubTopic.retain" class="retain-checkbox" v-show="activeProj.mode==='remote'">Retain</a-checkbox>
              <a-button type="primary" @click="handleSend" style="margin-left: auto;">发布</a-button>
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
                        <span v-show="activeProj.mode==='remote'">QoS: {{ v.qos }} </span>
                        <span v-show="activeProj.mode==='remote'">retain: {{ Number(v.retain) }}</span>
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
import { onMounted, onBeforeMount, reactive, ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'
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

const isProjModalOpen = ref(false), isSubModalOpen = ref(0)
const activeProjID = ref(-999), hoverSubIndex = ref(-1), hoverPubIndex = ref(-1)
let projList = reactive([])
const passform = ref({})
const editProjForm = ref(null)
const editSubIndex = ref(-1)

const activeProjIndex = computed(() => {
  const idx = projList.findIndex((item) => item.id === activeProjID.value)
  bus.activeProjIdx = idx
  return idx
})
const activeProj = computed(() => {
  if (activeProjID.value === -999) return {}
  return projList[activeProjIndex.value]
})
const activeProjMqttServer = computed(() => {
  if (activeProjID.value === -999) return ""
  return `${activeProj.value.ip} : ${ activeProj.value.port }`
})

// ProjModal标题
const projModalTitle = computed(() =>
  editProjForm.value && editProjForm.value.id !== undefined ? '编辑' : '新建'
)
// SubscriptionModal标题
const subModalTitle = computed(() =>
  isSubModalOpen.value === 2 ? '编辑' : '新建'
)

// 订阅主题仅校验不为空、唯一性、只允许ASCII、不能有\0，允许+和#
function isTopicNameValid(topic, topics, editingIdx = -1) {
  if (!topic || !topic.trim()) return { valid: false, msg: "主题名称不能为空" }
  if (!/^[\x00-\x7F]+$/.test(topic)) return { valid: false, msg: "主题仅支持ASCII字符" }
  if (topic.includes('\0')) return { valid: false, msg: "主题名称不能包含空字符（\\0）" }
  const idx = topics.findIndex((item) => item.topic === topic)
  if (idx !== -1 && idx !== editingIdx) return { valid: false, msg: "主题名称已存在" }
  return { valid: true }
}
// 发布主题禁止包含+和#，禁止有非ASCII和\0
function isPublishTopicValid(topic) {
  if (!/^[\x00-\x7F]+$/.test(topic)) {
    return { valid: false, msg: "主题仅支持ASCII字符" }
  }
  if (topic.includes('\0')) {
    return { valid: false, msg: "主题名称不能包含空字符（\\0）" }
  }
  if (/[#+]/.test(topic)) {
    return { valid: false, msg: "主题通配符+、#，仅可用于订阅" }
  }
  return { valid: true }
}

/* 新增项目-确定 或 编辑项目-确定 */
async function handleProjModalOk(newProj) {
  isProjModalOpen.value = false
  if (!newProj.name.trim()) return

  // 编辑
  if (editProjForm.value && editProjForm.value.id !== undefined) {
    const idx = projList.findIndex(p => p.id === editProjForm.value.id)
    if (idx !== -1) {
      let isChangeFlag = false
      const oldProj = cloneDeep(projList[idx]) // 深拷贝原项目
      Object.keys(newProj).forEach(key => {
        if (newProj[key] !== projList[idx][key]) {
          isChangeFlag = true
        }
        projList[idx][key] = newProj[key]
      })
      // 连接且发生变化时，断开连接
      if (oldProj.connected === 2 && isChangeFlag) disconnectRemoteMqtt({type:"warning", msg: "配置更改，请重新连接"}) 
      if (isChangeFlag) {
        if (newProj.mode === 'remote' && oldProj.mode === 'local') { // 本地切远程，删除原本地项目订阅
          window.electron.ipcRenderer.send("r:deleteProj", JSON.stringify(oldProj)) 
        } else if (newProj.mode === 'local' && oldProj.mode === 'remote') { // 远程切本地，增加本地项目订阅
          try {
            let isOk = true
            for (const topic of oldProj.subTopics) {
              const res = await window.electron.ipcRenderer.invoke('r:subscribeMqttTopic', {
                topic: JSON.stringify(topic),
                mqttMode: 'local',
                projId: oldProj.id,
              })
              if (res.err) isOk = false
            }
            if (!isOk) bus.emit("showCustomAlert", { type: "error", msg: "部分主题订阅失败，请重启应用" })
          } catch (error) {
            console.error("handleProjModalOk error:", error)
          }
        }
        bus.changeProjInfo()
      }
    }
    editProjForm.value = null
    return
  }

  // 新增项目
  projList.push({
    id: new Date().getTime(),
    name: newProj.name.trim(),
    mode: newProj.mode,
    clientID: newProj.clientID || "",
    ip: newProj.mode === 'local' ? (bus.mqttServer.localIP || "") : (newProj.ip || ""),
    port: newProj.mode === 'local' ? (bus.mqttServer.port || "") : (newProj.port || ""),
    username: newProj.username || "",
    password: newProj.password || "",
    connected: 0,
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

/* 打开新增项目弹窗 */
function openAddProjModal() {
  editProjForm.value = null
  isProjModalOpen.value = true
}

/* 打开编辑项目弹窗（设置按钮/项目双击均可用）*/
function openEditProjModal() {
  if (activeProjID.value === -999) return
  editProjForm.value = {
    id: activeProj.value.id,
    name: activeProj.value.name,
    mode: activeProj.value.mode || "local",
    clientID: activeProj.value.clientID || "",
    ip: activeProj.value.ip || "",
    port: activeProj.value.port || "",
    username: activeProj.value.username || "",
    password: activeProj.value.password || "",
  }
  nextTick(() => {
    isProjModalOpen.value = true
  }) 
}

/** 项目列表双击进入编辑 */
function editProjItem(v) {
  editProjForm.value = {
    id: v.id,
    name: v.name,
    mode: v.mode || "local",
    clientID: v.clientID || "",
    ip: v.ip || "",
    port: v.port || "",
    username: v.username || "",
    password: v.password || "",
  }
  nextTick(() => {
    isProjModalOpen.value = true
  })
}

/* 切换remote项目连接状态 */
function toggleRemoteConnection() {
  if (activeProjID.value === -999) return
  if (activeProj.value.mode !== 'remote') return
  if (activeProj.value.connected === 1) return 
  if (activeProj.value.connected < 2) {
    window.electron.ipcRenderer.invoke('r:connectRemoteMqtt', JSON.stringify({
      projId: activeProj.value.id,
      clientID: activeProj.value.clientID,
      ip: activeProj.value.ip,
      port: activeProj.value.port,
      username: activeProj.value.username,
      password: activeProj.value.password,
      subTopics: activeProj.value.subTopics
    }))
    .then((res) => {
      if (res.err) {
        bus.emit("showCustomAlert", { type: "error", msg: res.msg, time: 1500 })
        activeProj.value.connected = 0
      } else {
        activeProj.value.connected = 2
        bus.emit("showCustomAlert", { type: "success", msg: "连接成功" })
      }
    })
    return
  } else {
    disconnectRemoteMqtt()
  }
}

/* 删除项目 */
function handleDeleteProj(id) {
  const index = bus.projList.findIndex((item) => item.id === id)
  if (index !== -1) {
    const spliceProj = projList.splice(index, 1)
    window.electron.ipcRenderer.send("r:deleteProj", JSON.stringify(spliceProj[0])) // 删除项目时发送到主进程
    bus.changeProjInfo()
    if (activeProjID.value == id) {
      if (projList.length > 0) {
        activeProjID.value = projList[0].id
      } else {
        activeProjID.value = -999
      }
    }
  }
}

// 断开连接
function disconnectRemoteMqtt({type="success", msg="已断开连接", projId=activeProj.value.id, clientID=activeProj.value.clientID}={}) {
  window.electron.ipcRenderer.invoke('r:disconnectRemoteMqtt', {
    projId,
    clientID,
  })
  .then((res) => {
    if (res.err) {
      bus.emit("showCustomAlert", { type: "error", msg: res.msg })
    } else if(activeProj.value.mode === "remote") bus.emit("showCustomAlert", { type: type, msg: msg })
    activeProj.value.connected = 0
  })
}

/* 删除订阅 */
function clickDeleteSub(index) {
  if (activeProjID.value === -999) return
  const spliceTopic = activeProj.value.subTopics.splice(index, 1)[0]
  if (!spliceTopic) return
  window.electron.ipcRenderer.send("r:deleteSubTopic", JSON.stringify({
    projId: activeProj.value.id,
    mqttMode: activeProj.value.mode,
    topic: spliceTopic
  }))
  bus.changeProjInfo()
}

/* 新增/编辑订阅-确定 */
async function handleSubModalOk(newSub) {
  try {
    isSubModalOpen.value = 0
    if (activeProjID.value === -999) return
    newSub = cloneDeep(newSub)
    // 校验主题名称
    const topics = activeProj.value.subTopics
    const check = isTopicNameValid(newSub.topic, topics, editSubIndex.value)
    if (!check.valid) {
      bus.emit("showCustomAlert", { type: "warning", msg: check.msg, time: 1500 })
      return
    }
    if (editSubIndex.value === -1) {
      const index = topics.findIndex((item) => item.topic === newSub.topic)
      if (index === -1) {
        const res = await subscribeMqttTopic(newSub)
        if (res.err) {
          bus.emit("showCustomAlert", { type: "error", msg: res.msg, time: 1500 })
          return
        }
        topics.push(newSub)
      } else { 
        bus.emit("showCustomAlert", { type: "warning", msg: "主题已存在" })
        return
      }
    } else {
      const sub = topics[editSubIndex.value]
      // 校验新旧主题是否相同
      let isChangeFlag = false
      Object.keys(newSub).forEach(key => {
        if (newSub[key] !== sub[key]) {
          isChangeFlag = true
        }
      })
      if (!isChangeFlag) { editSubIndex.value = -1; return}
      const res = await modifyMqttTopic({newTopic: JSON.stringify(newSub), oldTopic: JSON.stringify(sub)})
      editSubIndex.value = -1
      if (res.err) {
          bus.emit("showCustomAlert", { type: "error", msg: res.msg })
          return
        }
      if (sub) Object.assign(sub, cloneDeep(newSub))
    }
    bus.changeProjInfo()
  } catch (error) {
    editSubIndex.value = -1
    console.error("handleSubModalOk error:", error)
  }
}

// 订阅主题
function subscribeMqttTopic(topic) {
  return window.electron.ipcRenderer.invoke('r:subscribeMqttTopic', {
    topic: JSON.stringify(topic), 
    mqttMode: activeProj.value.mode,
    projId: activeProj.value.id,
  })
}

// 修改主题
function modifyMqttTopic({newTopic, oldTopic}) {
  return window.electron.ipcRenderer.invoke('r:modifyMqttTopic', {
    newTopic,
    oldTopic,
    mqttMode: activeProj.value.mode,
    projId: activeProj.value.id,
  })
}

/* 点击add Subscription  */
function clickAddSubscription() {
  if (activeProjID.value === -999) {
    emit("alert", { type: "warning", msg: "请先创建一个项目" })
    return
  }
  passform.value = null;
  isSubModalOpen.value = 1
  editSubIndex.value = -1
}

/* 主题编辑 */
function editSubTopic(index) {
  if (activeProjID.value === -999) return
  const sub = activeProj.value.subTopics[index]
  if (!sub) return
  passform.value = { ...sub }
  isSubModalOpen.value = 2
  editSubIndex.value = index
}

/* 删除发布 */
function clickDeletePub(index) {
  if (activeProjID.value === -999) return
  activeProj.value.pubTopics.splice(index, 1)
  bus.changeProjInfo()
}

/* 发布主题输入框模糊 */
function blurPubTopic() {
  if (pubTopic.value.topic === '') return
  const index = activeProj.value.pubTopics.findIndex((item) => item.topic === pubTopic.value.topic && item.qos === pubTopic.value.qos && item.retain === pubTopic.value.retain)
    // 校验发布主题
  const check = isPublishTopicValid(pubTopic.value.topic)
  if (!check.valid) {
    pubTopic.value.topic = ''
    emit("alert", { type: "error", msg: check.msg, time: 1500 })
    return
  }
  if (index === -1) {
    if (activeProj.value.pubTopics.length > 10) {
      activeProj.value.pubTopics.shift()
    }
    activeProj.value.pubTopics.push(cloneDeep(pubTopic.value))
    bus.changeProjInfo()
  }
}

/* 发布消息 */
function handleSend() {
  if (pubTopic.value.topic === '' || activeProjID.value === -999) return
  // 校验发布主题
  const check = isPublishTopicValid(pubTopic.value.topic)
  if (!check.valid) {
    pubTopic.value.topic = ''
    emit("alert", { type: "error", msg: check.msg, time: 1500 })
    return
  }
  const mqttMode = activeProj.value.mode
  if (mqttMode === 'remote' && activeProj.value.connected !== 2) {
    emit("alert", { type: "warning", msg: "请先连接远程MQTT服务器", time: 1500})
    return
  }
  window.electron.ipcRenderer.invoke('r:publishMqtt', {
    packet: {
      ...pubTopic.value,
      payload: pubMsg.value.payload,
    },
    mqttMode,
    projId: activeProj.value.id,
  })
  .then((res) => {
    if (res.err) {
      emit("alert", { type: "error", msg: res.msg })
    } else {
      // 转为东8区时间
      const time = new Date(Date.now() + 8 * 3600000).toISOString().replace('T', ' ').replace('Z', '').slice(0, 19);
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

/* 监听消息数据变化，滚动到底部（最快） */
function scrollToBottom() {
  nextTick(() => {
    setTimeout(() => {
      if (messagesRef.value) {
        messagesRef.value.scrollTop = messagesRef.value.scrollHeight
      }
    }, 0)
  })
}

// 监听当前项目消息长度变化（收发消息时）
watch(
  () => activeProj.value?.cache?.length,
  () => {
    scrollToBottom()
  }
)

// 监听切换项目
watch(activeProjID, () => {
  scrollToBottom()
})

// 页面mounted时滚动到底部
onMounted(() => {
  scrollToBottom()
})

onBeforeMount(() => {
  projList = reactive(bus.projList)
  if (projList.length > 0) {
    if (bus.activeProjIdx === -1) activeProjID.value = projList[0].id
    else activeProjID.value = projList[bus.activeProjIdx].id
  }
})

onBeforeUnmount(() => {
  window.electron.ipcRenderer.removeAllListeners("m:mqttData")
  window.electron.ipcRenderer.removeAllListeners("m:mqttRemoteProjData")
  window.electron.ipcRenderer.removeAllListeners("m:mqttRemoteErrDisconnected")
})

// 处理本地服务订阅消息内容
window.electron.ipcRenderer.on("m:mqttData", (_, data) => {
  const localProjList = projList.filter((item) => item.mode === 'local')
  if (localProjList.length === 0) return
  const { topic, qos, payload, time, realTopic } = data
  localProjList.forEach((proj) => {
    if (proj.subTopics.some((item) => item.topic === realTopic)) {
      if (topic === realTopic) 
        // 如果是精确匹配的主题
        proj.cache.push({ type: 0, time, topic: realTopic, qos, content: payload, color: proj.subTopics.find((item) => item.topic === topic).color })
    } else {
      // 找出所有命中的订阅表达式
      const matchedSubs = proj.subTopics.filter(sub =>
        matchMqttTopicFilter(sub.topic, realTopic)
      );
      if (matchedSubs.length > 0 && matchedSubs[0].topic === topic) {
        proj.cache.push({ type: 0, time, topic: realTopic, qos, content: payload, color: "#a58c8c" })
      }
    }
  })
  bus.changeProjInfo()
})
// 处理远程服务订阅消息内容
window.electron.ipcRenderer.on("m:mqttRemoteProjData", (_, data) => {
  const proj = projList.find((item) => item.id === data.projId)
  const { topic, qos, payload, time } = data
  if (!proj || proj.mode !== 'remote' || proj.connected !== 2) return
  proj.cache.push({ type: 0, time, topic, qos, content: payload, color: proj.subTopics.find((item) => item.topic === topic)?.color || "#a58c8c" })
  bus.changeProjInfo()
})

/* 处理异常断开 */
window.electron.ipcRenderer.on("m:mqttRemoteErrDisconnected", (_, {projId}) => {
  const proj = projList.find((item) => item.id === projId)
  if (!proj || proj.mode !== 'remote' || proj.connected === 0) return
  proj.connected = 0
  bus.emit("showCustomAlert", { type: "error", msg: `项目${proj.name}-clientID:${proj.clientID}异常断开` })
  bus.changeProjInfo()
})

function getImgPath(imgName) {
  return new URL(`../assets/img/${imgName}`, import.meta.url).href
}

// 完整支持+和#的MQTT主题匹配
function matchMqttTopicFilter(filter, topic) {
  if (typeof filter !== 'string' || typeof topic !== 'string') return false;
  if (filter.length === 0 || topic.length === 0) return false;
  if (filter.includes('//') || topic.includes('//')) return false;

  const filterLevels = filter.split('/');
  const topicLevels = topic.split('/');

  let i = 0;
  for (; i < filterLevels.length; i++) {
    const f = filterLevels[i];
    const t = topicLevels[i];
    if (f === '#') {
      // #必须在末尾
      return i === filterLevels.length - 1;
    }
    if (f === '+') {
      if (typeof t === 'undefined') return false;
      continue;
    }
    if (typeof t === 'undefined') return false;
    if (f !== t) return false;
  }
  return filterLevels.length === topicLevels.length;
}
</script>

<style scoped lang="scss">
@import url("../assets/css/proj.scss");
</style>