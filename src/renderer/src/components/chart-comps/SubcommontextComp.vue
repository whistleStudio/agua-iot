<template>
  <div
    class="resize-container"
    :class="{ active: props.compId === props.activeCompId }"
    :style="{
      width: width + 'px',
      height: height + 'px',
      left: left + 'px',
      top: top + 'px',
      position: 'absolute',
      backgroundColor: bgc
    }"
    ref="container"
  >
    <div v-if="props.compProps.title" class="header-bar">
      {{ props.compProps.title }}
    </div>
    <div class="text-center">
      <!-- 单行模式：省略号 -->
      <span
        v-if="inputType === 'singleLine'"
        class="text-content"
        :title="content"
      >{{ content }}</span>
      <!-- 多行模式：多行省略号，动态行数 -->
      <span
        v-else
        class="text-content-multiline"
        :style="{ WebkitLineClamp: calcLineClamp }"
        :title="content"
      >{{ content }}</span>
    </div>
    <div class="resize-handle" @mousedown="startResize"></div>
  </div>
</template>

<script setup>
import { ref, watch, inject, onBeforeMount, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import bus from '../../utils/bus'

const props = defineProps({
  compProps: {
    type: Object,
    required: false,
    default: () => ({})
  },
  compId: {
    type: Number,
    required: false,
    default: -1
  },
  activeCompId: {
    type: Number,
    required: false,
    default: -1
  }
})

const activeCompProps = inject('activeCompProps')
const container = ref(null)
const width = ref(200)
const height = ref(50)
const left = ref(0)
const top = ref(0)
const bgc = ref('rgb(246, 250, 253)')
const content = ref('')

// inputType 计算属性，兼容老数据
const inputType = computed(() => {
  return props.compProps.inputType || 'singleLine'
})

// 动态计算多行省略最大行数
const headerBarHeight = 40; // header-bar高度，若无header可设为0
const lineHeightPx = 24; // 16px*1.5=24px，需与样式一致
const verticalPadding = 0; // 若有上下padding需加上
const calcLineClamp = computed(() => {
  // 可用高度 = 总高度 - 头部高度 - 上下padding
  let available = height.value - (props.compProps.title ? headerBarHeight : 0) - verticalPadding
  return Math.max(1, Math.floor(available / lineHeightPx))
})

let resizing = false
let origin = { x: 0, y: 0 }
let startLeft = 0
let startTop = 0
let startWidth = 0
let startHeight = 0

function startResize(e) {
  e.preventDefault()
  resizing = true
  document.body.style.cursor = 'se-resize'
  origin.x = e.clientX
  origin.y = e.clientY
  startLeft = left.value
  startTop = top.value
  startWidth = width.value
  startHeight = height.value
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

function handleResize(e) {
  if (!resizing) return
  const dx = e.clientX - origin.x
  const dy = e.clientY - origin.y
  let newWidth = Math.max(80, startWidth + dx)
  let newHeight = Math.max(32 + (props.compProps && props.compProps.title ? 32 : 0), startHeight + dy)
  left.value = startLeft + (startWidth - newWidth)
  top.value = startTop + (startHeight - newHeight)
  width.value = newWidth
  height.value = newHeight
}

function stopResize() {
  resizing = false
  document.body.style.cursor = ''
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

watch([width, height], () => {
  if (props.compId !== props.activeCompId) return
  activeCompProps.get().width = width.value
  activeCompProps.get().height = height.value
})

watch(
  () => props.compProps,
  newVal => {
    if (!newVal) return
    width.value = newVal.width || 200
    height.value = newVal.height || 50
    if (newVal.hideBg) {
      bgc.value = 'rgba(255, 255, 255, 0.01)'
    } else {
      bgc.value = 'rgb(255, 255, 255)'
    }
  },
  { immediate: true, deep: true }
)

const subTopicDataHandle = ({ topic, qos, payload }) => {
  if (
    !props.compProps.topic ||
    topic !== props.compProps.topic.topic ||
    qos !== props.compProps.topic.qos
  ) {
    return
  }
  content.value = payload
  props.compProps.content = payload
  if (props.compProps.isInit) props.compProps.isInit = false
}
bus.on('subTopicData', subTopicDataHandle)

const subCommonTextWHChangeHandle = ({ id, newWidth, newHeight }) => {
  if (id !== props.compId) return
  width.value = newWidth
  height.value = newHeight
  activeCompProps.get().width = newWidth
  activeCompProps.get().height = newHeight
  nextTick(() => { /* 可扩展：内容自适应等 */ })
}
bus.on('subCommonTextWHChange', subCommonTextWHChangeHandle)

onBeforeMount(() => {
  width.value = props.compProps.width || 200
  height.value = props.compProps.height || 50
  if (props.compProps.hideBg) {
    bgc.value = 'rgba(255, 255, 255, 0.01)'
  } else {
    bgc.value = 'rgb(255, 255, 255)'
  }
  if (props.compProps.isInit) content.value = ''
  else content.value = props.compProps.content || ''
})


onBeforeUnmount(() => {
  bus.off('subTopicData', subTopicDataHandle)
  bus.off('subCommonTextWHChange', subCommonTextWHChangeHandle)
})
</script>

<style scoped lang="scss">
.resize-container {
  border-radius: 7px;
  box-shadow: 0 0 8px rgba(0,0,0,0.03);
  background: rgb(255, 255, 255);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  box-sizing: border-box;
  &.active {
    border: 1px solid rgba(48, 150, 245, 0.6) !important;
  }
  .header-bar {
    width: 100%;
    height: 45px;
    background: #fff;
    color: #333;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #f0f0f0;
    font-size: 18px;
    padding: 0 10px;
    box-sizing: border-box;
    user-select: none;
  }
  .text-center {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    .text-content {
      display: inline-block;
      width: 100%;
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
      font-size: 18px;
      color: #222;
      line-height: 1.3;
      padding: 0 8px;
      box-sizing: border-box;
    }
    .text-content-multiline {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      /* 行数由 style 动态设置：-webkit-line-clamp */
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: normal;
      word-break: break-all;
      width: 100%;
      max-width: 100%;
      text-align: left;
      font-size: 16px;
      color: #222;
      line-height: 1.5;
      padding: 0 8px;
      box-sizing: border-box;
      /* 建议加transition使调整更丝滑 */
      transition: -webkit-line-clamp 0.2s;
    }
  }
  .resize-handle {
    position: absolute;
    width: 14px;
    height: 14px;
    right: 0;
    bottom: 0;
    cursor: se-resize;
    border-radius: 2px;
    border: 1.5px solid #b1cdf3;
    background: #eaf4fe;
    z-index: 2;
    &:hover {
      border: 1.5px solid #4d8af0;
      background: #d6eaff;
    }
    &::after {
      content: '';
      display: block;
      width: 7px;
      height: 7px;
      border-bottom: 2px solid #a3b9d9;
      border-right: 2px solid #a3b9d9;
      position: absolute;
      right: 2.5px;
      bottom: 2.5px;
    }
  }
}
</style>