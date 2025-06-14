<template>
  <div 
    class="resize-container comp-border"
    :class="{ active: props.compId === props.activeCompId }"
    :style="{
      width: width + 'px',
      height: height + 'px',
      left: left + 'px',
      top: top + 'px',
      position: 'absolute',
      background: containerBg,
      '--primary-color': (layoutSettings?.swatch?.primaryColor || '#238aff'),
      '--comp-font-color': (layoutSettings?.swatch?.compFontColor || '#222'),
      '--header-color': layoutSettings?.swatch?.compFontColor || '#333',
      '--ph-color': layoutSettings?.swatch?.compPhColor || '#888'
    }"
    ref="container"
  >
    <div v-if="props.compProps.title" class="header-bar">
      {{ props.compProps.title }}
    </div>
    <div class="text-center">
      <span
        v-if="inputType === 'singleLine'"
        class="text-content"
        :title="content"
      >{{ content }}</span>
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

const layoutSettings = inject('activeLayoutSettings')?.get?.() || {}

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
const content = ref('')

const containerBg = computed(() =>
  props.compProps.hideBg
    ? 'rgba(255, 255, 255, 0.01)'
    : (layoutSettings.swatch?.compBgColor || 'rgb(255, 255, 255)')
)

const inputType = computed(() => {
  return props.compProps.inputType || 'singleLine'
})

const headerBarHeight = 40
const lineHeightPx = 24
const verticalPadding = 0
const calcLineClamp = computed(() => {
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
  nextTick(() => { })
}
bus.on('subCommonTextWHChange', subCommonTextWHChangeHandle)

onBeforeMount(() => {
  width.value = props.compProps.width || 200
  height.value = props.compProps.height || 50
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
  background: inherit;
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
    background: transparent;
    color: var(--header-color, #333);
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
      color: var(--comp-font-color, #222);
      line-height: 1.3;
      padding: 0 8px;
      box-sizing: border-box;
    }
    .text-content-multiline {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: normal;
      word-break: break-all;
      width: 100%;
      max-width: 100%;
      text-align: left;
      font-size: 16px;
      color: var(--comp-font-color, #222);
      line-height: 1.5;
      padding: 0 8px;
      box-sizing: border-box;
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
      border: 1.5px solid var(--primary-color, #238aff);
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
:deep(input::placeholder) {
  color: var(--ph-color, #888);
}
// .white-border {
//   box-shadow: 0 4px 8px 1px rgba(36, 137, 202, 0.13);
//   border: 1px solid #e6e6e6;
// }
</style>