<template>
  <a-layout class="visual-editor">
    <!-- Header -->
    <a-layout-header class="visual-editor__header">
      <div class="visual-editor__header-left">
        <a-dropdown>
          <a class="ant-dropdown-link" @click.prevent>
            {{ activeProj.name }} ▼
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item v-for="(item, index) in projList" :key="index" @click="() => {activeProjIdx = index; bus.activeProjIdx = index}">
                <span>{{ item.name }}</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <div class="visual-editor__header-right">
        <a-badge status="error" />
        <span class="visual-editor__header-connection">连接失败</span>
        <a-button type="primary" shape="round" class="visual-editor__header-fullscreen">
          <template #icon></template>
          全屏
        </a-button>
      </div>
    </a-layout-header>

    <a-layout class="visual-editor__main-layout">
      <!-- 左侧组件面板 -->
      <a-layout-sider width="160" class="visual-editor__sider visual-editor__sider--left" ref="leftSiderRef">
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
      <a-layout-content class="visual-editor__content">
        <div class="visual-editor__canvas-wrapper" @mousedown="() => {activeComponent = commonComp; $router.push('/home/chart/common')}">
          <div class="visual-editor__canvas" ref="canvasRef">
            <div
              v-for="(comp, idx) in canvasComponents"
              :key="comp.id"
              class="visual-editor__draggable"
              :class="{ 'visual-editor__draggable--dragging': isDragging && draggingIndex === idx, active: activeComponent === comp }"
              :style="getDraggableStyle(comp, idx)"
              @mousedown.stop="startDrag($event, idx, comp)"
            >
              <component :is="comp.component" :compProps="comp.props" />
            </div>
          </div>
        </div>
      </a-layout-content>

      <!-- 右侧属性面板 -->
      <a-layout-sider width="260" class="visual-editor__sider visual-editor__sider--right">
        <router-view />
      </a-layout-sider>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, markRaw, provide, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import chartCfg from '../cfg/chart-cfg';
import { cloneDeep } from 'lodash-es';
import bus from '../utils/bus';

// 引入所有可用的自定义组件
import PubTextComp from '../components/chart-comps/PubTextComp.vue'
import ButtonComp from '../components/chart-comps/ButtonComp.vue'
import PieComp from '../components/chart-comps/PieComp.vue'

// 获取路由实例
const router = useRouter();

// 组件映射，key要与chart-cfg配置一致
const componentMap = {
  pubtext: markRaw(PubTextComp),
  button: markRaw(ButtonComp),
  chartPie: markRaw(PieComp),
  // ...可继续扩展其它组件
};

const menu = ref(chartCfg.menu);
const projList = reactive(bus.projList);
// 直接从 bus 中获取和设置 activeProjIdx
const activeProjIdx = ref(bus.activeProjIdx)
const activeProj = computed(() => projList[activeProjIdx.value]);
const canvasComponents = ref([]);

// 画布上激活的组件
const commonComp = {props:{}};
const activeComponent = ref(commonComp);
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

// 每种类型的默认宽高
const typeSizeMap = {
  pubtext: { width: 140, height: 45 },
  button: { width: 100, height: 45 },
  chartPie: { width: 80, height: 80 },
  // ...继续扩展
};

// 添加组件到画布
function addComponent(type) {
  if (!componentMap[type]) return;
  // const size = typeSizeMap[type] || { width: 120, height: 50 };
  canvasComponents.value.push({
    id: Date.now() + Math.random(),
    type,
    component: componentMap[type],
    props: cloneDeep(compProps[type].props),
    top: 50 + Math.random() * 40,
    left: 50 + Math.random() * 30,
    
  });
  activeComponent.value = canvasComponents.value[canvasComponents.value.length - 1]; // 设置新添加组件为激活状态
  router.push({ path: '/home/chart/' + type });
}


// 拖拽逻辑
function startDrag(event, idx, comp) {
  if (!isDragging.value) {
    activeComponent.value = comp;
    console.log('ctiveComponent.value:', comp);
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
    }
  }
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
    background: '#fff',
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
}
</style>