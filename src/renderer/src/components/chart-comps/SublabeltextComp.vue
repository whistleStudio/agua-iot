<template>
  <div
    class="resize-container"
    :class="{ active: props.compId === activeCompId }"
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
    <div class="labeltext-center">
      <div class="label-row">
        <span class="label-desc" :style="{ color: props.compProps.labelColor || '#d2694a' }">{{ props.compProps.labelText || '标签' }}</span>
      </div>
      <div class="label-value-row">
        <span class="label-value">{{ value }}</span>
        <span class="label-unit" :style="{ color: props.compProps.unitColor || '#ffd590' }">{{ props.compProps.unitText || '' }}</span>
      </div>
    </div>
    <div class="resize-handle" @mousedown="startResize"></div>
  </div>
</template>

<script setup>
import { ref, watch, inject, onBeforeMount, nextTick, onBeforeUnmount, computed } from 'vue'
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
const width = ref(180)
const height = ref(120)
const left = ref(0)
const top = ref(0)
const value = ref(null)

// 底色
const bgc = computed(() =>
  props.compProps.hideBg ? 'rgba(255,255,255,0.01)' : 'rgb(255,255,255)'
)

// const valueStr = computed(() => {
//   if (props.compProps.isInit) return '--'
//   if (value.value === null || value.value === undefined) return '--'
//   if (typeof value.value === 'number' && !isNaN(value.value)) return value.value
//   const num = parseFloat(value.value)
//   return isNaN(num) ? value.value : num
// })

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
  let newWidth = Math.max(100, startWidth + dx)
  let newHeight = Math.max(60, startHeight + dy)
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
  activeCompProps.get().width = width.value
  activeCompProps.get().height = height.value
})

watch(
  () => props.compProps,
  newVal => {
    width.value = newVal.width || 180
    height.value = newVal.height || 120
  },
  { immediate: true, deep: true }
)

const sublabeltextWHChangeHandle = ({ id, newWidth, newHeight }) => {
  if (id !== props.compId) return
  width.value = newWidth
  height.value = newHeight
  activeCompProps.get().width = newWidth
  activeCompProps.get().height = newHeight
  nextTick(() => { /* 可扩展：内容自适应等 */ })
}
bus.on('sublabeltextWHChange', sublabeltextWHChangeHandle)

// 监听订阅消息，实时更新内容
const subTopicDataHandle = ({ topic, qos, payload }) => {
  if (
    !props.compProps.topic ||
    topic !== props.compProps.topic.topic ||
    qos !== props.compProps.topic.qos
  ) return
  props.compProps.value = payload
  value.value = payload
  if (props.compProps.isInit) props.compProps.isInit = false
}
bus.on('subTopicData', subTopicDataHandle)

onBeforeMount(() => {
  width.value = props.compProps.width || 180
  height.value = props.compProps.height || 120
  if (props.compProps.isInit) {
    value.value = "--"
  } else {
    value.value = props.compProps.value || "--"
  }
})

onBeforeUnmount(() => {
  bus.off('subTopicData', subTopicDataHandle)
  bus.off('sublabeltextWHChange', sublabeltextWHChangeHandle)
})
</script>

<style scoped lang="scss">
.resize-container {
  border-radius: 8px;
  background: transparent;
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
    color: #333;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    padding: 0 10px;
    box-sizing: border-box;
    user-select: none;
  }
  .labeltext-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    width: 100%;
    min-height: 0;
    .label-row {
      width: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      margin-top: 6px;
      margin-bottom: 0;
      .label-desc {
        font-size: 18px;
        font-weight: 500;
      }
    }
    .label-value-row {
      width: 100%;
      display: flex;
      align-items: baseline;
      justify-content: center;
      margin-top: 4px;
      .label-value {
        font-size: 40px;
        font-weight: 600;
        color: #ffd590;
        line-height: 1;
      }
      .label-unit {
        font-size: 18px;
        margin-left: 4px;
        font-weight: 400;
      }
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