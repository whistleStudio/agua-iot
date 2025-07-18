<template>
  <a-layout class="visual-editor" v-if="projList.length > 0">
    <!-- Header -->
    <a-layout-header v-show="!isFullscreen" class="visual-editor__header">
      <div class="visual-editor__header-left">
        <a-dropdown>
          <a class="ant-dropdown-link" @click.prevent style="font-size: 18px; margin-left: 2px;">
            {{ activeProj.name }} ▼
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item v-for="(item, index) in projList" :key="index" @click="() => {activeProjIdx = index; bus.activeProjIdx = index; showLayoutSettings()}">
                <span>{{ item.name }}</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <div class="visual-editor__header-right">
        <!-- <a-badge status="error" />
        <span class="visual-editor__header-connection">连接失败</span> -->
        <!-- <div @click="clickReadingBtn" class="reading-btn">
          <img v-if="isStart" :src="getImgPath('stop.svg')" alt="">
          <img v-else :src="getImgPath('start.svg')" alt="">
        </div>  -->
        <template v-if="activeProjIdx !== -1 && activeProj.mode === 'remote'">
          <img
            :src="getImgPath(activeProj.connected == 1 ? 'connect_1.gif' : `connect_${activeProj.connected}.svg`)"
            class="proj-conn-btn"
            alt="连接状态"
            @click="toggleRemoteConnection"
            style="width: 40px; height: 40px; margin-right: 8px; cursor: pointer;"
          />
        </template>
        <a-button type="primary" shape="round" class="visual-editor__header-fullscreen"
        @click="isFullscreen ? exitFullscreen() : enterFullscreen()">
          <template #icon></template>
          全屏
        </a-button>
      </div>
    </a-layout-header>

    <a-layout class="visual-editor__main-layout">
      <!-- 左侧组件面板 -->
      <a-layout-sider v-show="!isFullscreen" width="160" class="visual-editor__sider visual-editor__sider--left" ref="leftSiderRef">
        <div
          class="visual-editor__panel"
          :class="{ 'visual-editor__panel--droppable': isDragging && isOverLeftSider }"
          ref="panelDropArea"
        >
          <div v-for="(group, groupIndex) in Object.values(menu)" :key="groupIndex" class="visual-editor__group">
            <div class="visual-editor__panel-subtitle">{{ group.name }}</div>
            <a-space direction="vertical" size="small" style="width: 100%;">
              <a-button
                v-for="(item, itemKey) in group.parts"
                :key="itemKey"
                block
                size="small"
                @click="addComponent(itemKey)"
              >
                {{ item.name }}
              </a-button>
            </a-space>
          </div>
        </div>
      </a-layout-sider>

      <!-- 中间画布部分 -->
      <a-layout-content class="visual-editor__content" :style="editorContentStyle">
        <div class="visual-editor__canvas-wrapper" @mousedown="showLayoutSettings">
          <div class="visual-editor__canvas" ref="canvasRef" :style="canvasStyle">
            <div
              v-for="(comp, idx) in canvasComponents"
              :key="comp.id"
              class="visual-editor__draggable"
              :class="{ 'visual-editor__draggable--dragging': isDragging && draggingIndex === idx, active: activeComponent === comp }"
              :style="getDraggableStyle(comp, idx)"
              @mousedown.stop="startDrag($event, idx, comp)"
            >
              <component :is="comp.component" :compProps="comp.props" :compId="comp.id" :activeCompId="activeCompId"/>
            </div>
          </div>
        </div>
      </a-layout-content>

      <!-- 右侧属性面板 -->
      <a-layout-sider v-show="!isFullscreen" width="260" class="visual-editor__sider visual-editor__sider--right">
        <router-view />
      </a-layout-sider>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, markRaw, provide, reactive, computed, onBeforeMount, watch, onBeforeUnmount, nextTick, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import chartCfg from '../cfg/chart-cfg';
import {cloneDeep} from 'lodash-es';
import bus from '../utils/bus';

// 引入所有可用的自定义组件
// import PubTextComp from '../components/chart-comps/PubTextComp.vue'
// import ButtonComp from '../components/chart-comps/ButtonComp.vue'
// import SwitchComp from '../components/chart-comps/SwitchComp.vue';
// import SliderComp from '../components/chart-comps/SliderComp.vue';
// import RadioComp from '../components/chart-comps/RadioComp.vue';
// import CheckboxComp from '../components/chart-comps/CheckboxComp.vue';
// import SubcommontextComp from '../components/chart-comps/SubcommontextComp.vue';
// import SublabeltextComp from '../components/chart-comps/SublabeltextComp.vue';
// import LineChartComp from '../components/chart-comps/LineChartComp.vue';
// import GaugeComp from '../components/chart-comps/GaugeComp.vue';
// import PieComp from '../components/chart-comps/PieComp.vue'
// import ScatterComp from '../components/chart-comps/ScatterComp.vue';
// import LiquidfillComp from '../components/chart-comps/LiquidfillComp.vue';
// import BarComp from '../components/chart-comps/BarComp.vue';
// import StackedareaComp from '../components/chart-comps/StackedareaComp.vue';
// import RadarComp from '../components/chart-comps/RadarComp.vue';


// 获取路由实例
const router = useRouter();

const emit = defineEmits(['alert']);

// 组件映射，key要与chart-cfg配置一致
const componentMap = {
  pubtext: markRaw(defineAsyncComponent(() => import('../components/chart-comps/PubTextComp.vue'))),
  button: markRaw(defineAsyncComponent(() => import('../components/chart-comps/ButtonComp.vue'))),
  chartPie: markRaw(defineAsyncComponent(() => import('../components/chart-comps/PieComp.vue'))),
  switch: markRaw(defineAsyncComponent(() => import('../components/chart-comps/SwitchComp.vue'))),
  slider: markRaw(defineAsyncComponent(() => import('../components/chart-comps/SliderComp.vue'))),
  radio: markRaw(defineAsyncComponent(() => import('../components/chart-comps/RadioComp.vue'))),
  checkbox: markRaw(defineAsyncComponent(() => import('../components/chart-comps/CheckboxComp.vue'))),
  subcommontext: markRaw(defineAsyncComponent(() => import('../components/chart-comps/SubcommontextComp.vue'))),
  sublabeltext: markRaw(defineAsyncComponent(() => import('../components/chart-comps/SublabeltextComp.vue'))),
  linechart: markRaw(defineAsyncComponent(() => import('../components/chart-comps/LineChartComp.vue'))),
  gauge: markRaw(defineAsyncComponent(() => import('../components/chart-comps/GaugeComp.vue'))),
  pie: markRaw(defineAsyncComponent(() => import('../components/chart-comps/PieComp.vue'))),
  scatter: markRaw(defineAsyncComponent(() => import('../components/chart-comps/ScatterComp.vue'))),
  liquidfill: markRaw(defineAsyncComponent(() => import('../components/chart-comps/LiquidfillComp.vue'))),
  bar: markRaw(defineAsyncComponent(() => import('../components/chart-comps/BarComp.vue'))),
  stackedarea: markRaw(defineAsyncComponent(() => import('../components/chart-comps/StackedareaComp.vue'))),
  radar: markRaw(defineAsyncComponent(() => import('../components/chart-comps/RadarComp.vue'))),
  // ...可继续扩展其它组件
};

// const isStart = ref(false);
const menu = ref(chartCfg.menu);
const projList = reactive(bus.projList);
// 直接从 bus 中获取和设置 activeProjIdx
const activeProjIdx = ref(bus.activeProjIdx)
const activeProj = computed(() => projList[activeProjIdx.value]);
const canvasRawComponents = computed({
  get() {
    return activeProj.value?.canvasCache?.rawComponents || []
  },
  set(val) {
    // 响应式赋值
    if (activeProj.value && activeProj.value.canvasCache) {
      activeProj.value.canvasCache.rawComponents = val
    }
  }
})
const editorContentStyle = computed(() => ({ backgroundColor: activeProj.value?.canvasCache?.layout?.theme == 'dark' ? '#a8a8a8' : '#f5f5f5' }))

const activeBgData = ref("")
const canvasStyle = computed(() => {
  return { 
    backgroundImage: (activeProj.value?.canvasCache?.layout?.bgUrl && activeProj.value.canvasCache.layout?.background == 'upload') ? `url(${activeBgData.value})` : 'none',
    backgroundColor: (activeProj.value?.canvasCache?.layout?.theme == 'dark') ? '#444' : '#f0f2f5',
  };
});

const canvasComponents = ref([])
const canvasLayout = ref({})

// 画布上激活的组件
const layoutComp = {props:{}};
const activeComponent = ref(layoutComp), activeCompId = ref(0);
const compProps = {...chartCfg.menu.pubComponents.parts, ...chartCfg.menu.subComponents.parts};
// 拖拽相关
const isDragging = ref(false);
const draggingIndex = ref(null);
const isOverLeftSider = ref(false);
let dragOffsetX = 0;
let dragOffsetY = 0;

const leftSiderRef = ref(null);
const panelDropArea = ref(null);
const canvasRef = ref(null);


/* 添加组件到画布 */
function addComponent(type) {
  if (!componentMap[type]) return;
  const newComp = {
    id: Date.now() + Math.random(),
    type,
    props: cloneDeep(compProps[type].props),
    top: 50 + Math.random() * 40,
    left: 50 + Math.random() * 30
  }
  // 恢复 component 字段
  canvasRawComponents.value.push(newComp)
  canvasComponents.value.push({
    ...newComp, // 其中props是对象的引用，直接同步canvasRawComponents
    component: componentMap[type] // 直接映射组件
  });
  // bus.changeProjInfo()
  // console.log(bus.projList[activeProjIdx.value].canvasCache.rawComponents.length, 'components');
  activeComponent.value = canvasComponents.value[canvasComponents.value.length - 1]; // 设置新添加组件为激活状态
  bus.activeCompId = newComp.id
  activeCompId.value = newComp.id; // 更新本地状态
  router.push({ path: '/home/chart/' + type });
}


/* 拖拽选中逻辑 */
function startDrag(event, idx, comp) {
  if (!isDragging.value) {
    setTimeout(() => {
      activeComponent.value = comp; // 同组件修改时，blur数据更新存在滞后，延时防止立即调用最新的属性
      bus.activeCompId = comp.id; // 更新总线上的当前组件
      activeCompId.value = comp.id; // 更新本地状态
    }, 50)

    // 路由跳转
    router.push({ path: '/home/chart/' + comp.type});
  };
  isDragging.value = true;
  draggingIndex.value = idx;
  dragOffsetX = event.clientX - canvasComponents.value[idx].left;
  dragOffsetY = event.clientY - canvasComponents.value[idx].top;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
}

function onDrag(event) {
  if (!isDragging.value || draggingIndex.value === null) return;
  const comp = canvasComponents.value[draggingIndex.value];
  comp.left = event.clientX - dragOffsetX;
  comp.top = event.clientY - dragOffsetY;
  // 检查是否在左侧面板
  const leftPanel = panelDropArea.value;
  const leftRect = leftPanel.getBoundingClientRect();
  const compCenterX = event.clientX;
  const compCenterY = event.clientY;
  isOverLeftSider.value =
    compCenterX >= leftRect.left &&
    compCenterX <= leftRect.right &&
    compCenterY >= leftRect.top &&
    compCenterY <= leftRect.bottom;
}
function stopDrag() {
  if (isDragging.value && draggingIndex.value !== null) {
    if (isOverLeftSider.value) {
      canvasComponents.value.splice(draggingIndex.value, 1);
      canvasRawComponents.value.splice(draggingIndex.value, 1); // 手动同步删除
    }
  }
  // bus.changeProjInfo();
  isDragging.value = false;
  draggingIndex.value = null;
  isOverLeftSider.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}

// 根据大小调整阴影
function getDraggableStyle(comp, idx) {
  // 阴影深浅/扩散可根据宽高动态变化
  const baseSpread = 4;
  const baseBlur = 8;
  const spread = Math.round(((comp.width || 120) + (comp.height || 50)) / 60);
  const blur = Math.round(((comp.width || 120) + (comp.height || 50)) / 20);
  const shadowColor = 'rgba(36, 137, 202, 0.13)';
  return {
    position: 'absolute',
    top: comp.top + 'px',
    left: comp.left + 'px',
    // width: (comp.width || 120) + 'px',
    // height: (comp.height || 50) + 'px',
    opacity: isDragging.value && draggingIndex.value === idx ? 0.7 : 1,
    zIndex: isDragging.value && draggingIndex.value === idx ? 999 : 1,
    boxShadow: `0 ${baseSpread}px ${baseBlur + blur}px ${spread}px ${shadowColor}`,
    border: '1px solid #e6e6e6',
    borderRadius: '6px',
    // background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'box-shadow 0.2s, transform 0.2s, opacity 0.2s',
    userSelect: 'none',
    cursor: 'move',
  };
}

// 提供getter/setter让属性面板可读写当前props
provide('activeCompProps', {
  get: () => activeComponent.value?.props,
  set: (val) => { activeComponent.value.props = { ...val } }
})
// 提供getter/setter让布局面板可读写当前设置
provide('activeLayoutSettings', {
  get: () => activeProj.value?.canvasCache?.layout || {},
  set: (val) => { activeProj.value.canvasCache.layout = { ...val } }
});

// 恢复组件，布局设置
function restoreCanvas() {
  if (activeProj.value && activeProj.value.canvasCache) {
    canvasComponents.value = activeProj.value.canvasCache.rawComponents.map(item => ({
      ...item,
      component: componentMap[item.type] 
    })) || [];
    canvasLayout.value = activeProj.value.canvasCache.layout || {};
  } else {
    canvasComponents.value = [];
    canvasLayout.value = {};
  }
}

// 获取图片路径
function getImgPath(imgName) {
  return new URL(`../assets/img/${imgName}`, import.meta.url).href
}

// function clickReadingBtn() {
//   isStart.value = !isStart.value;
//   bus.emit("showCustomAlert", { type: "info", msg: isStart.value ? "开始监听消息" : "暂停监听消息", time: 1500 });
// }

// // 监听mqtt数据
// window.electron.ipcRenderer.on("m:mqttData", (_, data) => {
//   const { topic, qos, payload, time } = data
//   if (!isStart.value) return
//   bus.emit('subTopicData', data)
// })

// 新增：全屏状态
const isFullscreen = ref(false);

// 全屏切换
function enterFullscreen() {
  bus.emit("showCustomAlert", { type: "info", msg: "ESC键或双击画布区域 退出全屏模式; Ctrl+P连接/断开远程服务端", time: 3000 });
  isFullscreen.value = true;
  bus.emit('enterFullscreen'); // 通知总线进入全屏状态
  // 监听esc退出
  document.addEventListener('keydown', onEscExitFullscreen);
  // 监听双击画布空白退出
  nextTick(() => {
    const wrapper = document.querySelector('.visual-editor__canvas-wrapper');
    if (wrapper) wrapper.addEventListener('dblclick', exitFullscreen);
  });
}
function exitFullscreen() {
  isFullscreen.value = false;
  bus.emit('exitFullscreen'); // 通知总线退出全屏状态
  document.removeEventListener('keydown', onEscExitFullscreen);
  const wrapper = document.querySelector('.visual-editor__canvas-wrapper');
  if (wrapper) wrapper.removeEventListener('dblclick', exitFullscreen);
}
function onEscExitFullscreen(e) {
  if (e.key === 'Escape' || e.key === 'Esc') {
    exitFullscreen();
  }
}

// 开始/暂停接收消息快捷键
function onToggleReading(e) {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
    e.preventDefault()
    toggleRemoteConnection()
    // isStart.value = !isStart.value;
    // bus.emit("showCustomAlert", { type: "info", msg: isStart.value ? "开始监听消息" : "暂停监听消息", time: 1500 });
  }
}

document.addEventListener('keydown', onToggleReading);


/* 切换remote项目连接状态 */
function toggleRemoteConnection() {
  if (activeProjIdx.value === -1) return
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

// 断开连接
function disconnectRemoteMqtt({type="success", msg="已断开连接", projId=activeProj.value.id, clientID=activeProj.value.clientID}={}) {
  // 断开连接
  window.electron.ipcRenderer.invoke('r:disconnectRemoteMqtt', {
    projId,
    clientID,
  })
  .then((res) => {
    console.log("disconnectRemoteMqtt res:", res, type, msg)
    if (res.err) {
      bus.emit("showCustomAlert", { type: "error", msg: res.msg })
    } else if(activeProj.value.mode === "remote") bus.emit("showCustomAlert", { type: type, msg: msg })
    activeProj.value.connected = 0
  })
}


/* 开始/暂停监听 */
// 处理本地服务订阅消息内容, 仅激活项目
window.electron.ipcRenderer.on("m:mqttData", (_, data) => {
  // if (activeProjIdx.value === -1 || activeProj.value.mode === "remote") return
  const localProjList = projList.filter((item) => item.mode === 'local')
  if (localProjList.length === 0) return
  bus.emit('subTopicData', data)
  const { topic, qos, payload, time } = data
  localProjList.forEach((proj) => { // 同步cache
    if (proj.subTopics.some((item) => item.topic === topic)) {
      proj.cache.push({ type: 0, time, topic, qos, content: payload, color: proj.subTopics.find((item) => item.topic === topic).color })
    }
  })
  bus.changeProjInfo()
})
// 处理远程服务订阅消息内容
window.electron.ipcRenderer.on("m:mqttRemoteData", (_, data) => {
  // if (activeProjIdx.value === -1) return
  const proj = projList.find((item) => item.id === data.projId)
  if (!proj || proj.mode !== 'remote' || proj.connected !== 2) return
  bus.emit('subTopicData', data)
  // const { topic, qos, payload, time } = data // 同步cache
  // proj.cache.push({ type: 0, time, topic, qos, content: payload, color: proj.subTopics.find((item) => item.topic === topic).color })
  // bus.changeProjInfo()
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
  proj.connected = 0 // 设置为连接中状态
  bus.emit("showCustomAlert", { type: "error", msg: `项目${proj.name}-clientID:${proj.clientID}异常断开` })
  bus.changeProjInfo()
})



/* 获取当前项目背景图片base64数据 */
provide('activeBgData', activeBgData) // 向布局组件注入
function getBgData() {
  if (!canvasLayout.value?.bgUrl) return
  window.electron.ipcRenderer.invoke('r:getBgData', canvasLayout.value.bgUrl)
    .then((res) => {
      if (res.err) {
        bus.emit("showCustomAlert", { type: "error", msg: res.msg, time: 1500 })
      } else {
        activeBgData.value = res.bgData || "";
        console.log("获取背景图片数据成功", activeBgData.value);
      }
    })
    .catch((err) => {
      bus.emit("showCustomAlert", { type: "error", msg: err.message, time: 1500 })
    });
}

/* ----------------------------------------------------- */
// 同步canvasComponents到bus
watch(canvasComponents, (newVal) => {
  // console.log('canvasComponents changed:', newVal);
  // 每次组件变化时更新到 bus 中
  if (activeProj.value && activeProj.value.canvasCache) {
    newVal.forEach((comp, idx) => {
      canvasRawComponents.value[idx].left = comp.left;
      canvasRawComponents.value[idx].top = comp.top;
    });
  }
  bus.changeProjInfo();
}, { deep: true });
// 同步canvasLayout到bus
watch(canvasLayout, (newVal, oldVal) => {
  // console.log('Layout settings changed:', oldVal, "->",newVal);
  if (activeProj.value && activeProj.value.canvasCache) {
    // activeProj.value.canvasCache.layout = { ...newVal }; // 这样写不行会导致canvasLayout.value 和 activeProj.value.canvasCache.layout 引用不同对象
    // console.log('==', activeProj.value.canvasCache.layout == canvasLayout.value); // false
    // canvasLayout.value = { ...newVal }; // 而这样写会导致递归错误
    // 啥都不用写，因为 onBeforeMount 后，bus里的layout和canvasLayout.value 已经是同一个对象了
    bus.changeProjInfo();
  }
}, { deep: true });

watch(() => canvasLayout.value.bgUrl, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    getBgData();
    console.log("背景图片更新:", newVal);
  }
})

// 监听activeProjIdx变化，自动更新canvasComponents和canvasLayout
watch(activeProjIdx, (newIdx) => {
  console.log('Active project changed:', newIdx);
  if (projList[newIdx]) {
    restoreCanvas();
  } else {
    canvasComponents.value = [];
    canvasLayout.value = {};
  }
}, { immediate: true });

/* ----------------------------- */
onBeforeMount(() => {
  if (projList.length === 0) {
    router.push('/home/proj');
    emit("alert", { type: "warning", msg: "当前图表不可用，请先创建项目", time: 1500 })
  } else {
    // 初始化时设置第一个项目为激活状态
    if (activeProjIdx.value < 0) {
      activeProjIdx.value = 0; // 如果没有设置，默认第一个项目
      bus.activeProjIdx = 0; // 同步到总线
    }
    // 获取背景图片数据
    getBgData();
    restoreCanvas(); // 恢复画布组件和布局设置
  }
})

onBeforeUnmount(() => {
  // 清理拖拽事件监听
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  // 清理mqtt数据监听
  window.electron.ipcRenderer.removeAllListeners("m:mqttData")
  window.electron.ipcRenderer.removeAllListeners("m:mqttRemoteData")
  window.electron.ipcRenderer.removeAllListeners("m:mqttRemoteProjData")
  window.electron.ipcRenderer.removeAllListeners("m:mqttRemoteErrDisconnected")
  // 清理全屏监听
  document.removeEventListener('keydown', onEscExitFullscreen);
  isFullscreen.value = false; // 重置全屏状态
  const canvasWrapper = document.querySelector('.visual-editor__canvas-wrapper');
  if (canvasWrapper) canvasWrapper.removeEventListener('dblclick', exitFullscreen);
  // 清理快捷键监听
  document.removeEventListener('keydown', onToggleReading);
  const wrapper = document.querySelector('.visual-editor__canvas-wrapper');
  if (wrapper) wrapper.removeEventListener('dblclick', exitFullscreen);
})


// 右侧属性栏展示-布局设置
function showLayoutSettings() {
  router.push('/home/chart/layout');

  setTimeout(() => {
    activeComponent.value = layoutComp;
    bus.activeCompId = 0; // 更新总线上的当前组件
    activeCompId.value = 0; // 更新本地状态
  }, 20)
  
}

</script>

<style scoped lang="scss">
.visual-editor {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .visual-editor__main-layout {
    flex: 1;
    min-height: 0 !important;
    overflow: hidden;
    display: flex;
  }

  .visual-editor__header {
    background-color: #fff;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 2;
    flex-shrink: 0;
    &-left {
      display: flex;
      align-items: center;
    }
    &-right {
      display: flex;
      align-items: center;
      .reading-btn {
        display: flex;
        margin-right: 10px;
        cursor: pointer;
        img {
          width: 20px;
          height: 20px;
        }
      }
    }
  }

  &__sider {
    background-color: #f9f9f9;
    min-height: 0;
    overflow: hidden;
    &--left {
      background-color: #f7f8fa !important;
      border-right: 1px solid #e4e4e4;
      .visual-editor__panel {
        padding: 16px;
        background: transparent;
        position: relative;
        transition: background-color 0.2s, border-color 0.2s;
        height: 100%;
        overflow: auto;
        &--droppable {
          background: #fff7f6 !important;
          border: 2px dashed #ff7875 !important;
        }
      }
      .visual-editor__group {
        margin: 16px 0;
        &:last-child {
          margin-bottom: 0;
        }
        .visual-editor__panel-subtitle {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        a-button {
          font-size: 13px;
        }
      }
    }
    &--right {
      background-color: #fff !important;
      border-left: 1px solid #e4e4e4;
      padding: 0 16px;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden; // 只允许竖向滚动，禁止横向滚动条
      box-sizing: border-box;
      min-width: 0;
      max-width: 100%;
      // 防止内部内容撑出横向滚动条
      > * {
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
      }
    }
  }

  &__content {
    flex: 1;
    display: flex;
    padding: 16px;
    gap: 16px;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  &__canvas-wrapper {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 0;
    min-height: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  &__canvas {
    position: relative;
    background-color: #f0f2f5;
    border: 1px dashed #d9d9d9;
    min-height: 400px;
    border-radius: 8px;
    padding: 10px;
    height: 100%;
    width: 100%;
    overflow: auto;
    box-sizing: border-box;
    background-size: cover;
    background-position: center;
  }

  &__draggable {
    &.active {
      border: 1px solid rgba(48, 150, 245, 0.6) !important;
    }
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 16px 6px rgba(36,137,202,0.18)
    }
    &--dragging {
      pointer-events: none;
      opacity: 0.7;
    }
  }
  :deep(.tips) {
    border: 1px solid #d9f7be;
    background: #f6ffed;
    padding: 8px;
    margin-top: 12px;
    border-radius: 3px;
    .tips-title {
      font-weight: bold;
      color: #389e0d;
      margin-bottom: 4px;
    }
    .tips-desc {
      color: #222;
      font-size: 13px;
      line-height: 20px;
    }
  }
  :deep(.comp-border) {
    box-shadow: 0 4px 8px 1px rgba(36, 137, 202, 0.13);
    border: 1px solid #e6e6e6;
  }
}

</style>