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
      '--header-color': (layoutSettings?.swatch?.compFontColor || '#333')
    }"
    ref="container"
  >
    <div class="chart-center">
      <div id="main" ref="RefMain"></div>
    </div>
    <div class="resize-handle" @mousedown="startResize"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, inject, onBeforeMount, onBeforeUnmount, computed } from 'vue'
import * as echarts from 'echarts'
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
const RefMain = ref(null)

const width = ref(300)
const height = ref(200)
const left = ref(0)
const top = ref(0)
const containerBg = computed(() =>
  props.compProps.hideBg
    ? 'rgba(255,255,255,0.01)'
    : (layoutSettings.swatch?.compBgColor || 'rgb(255,255,255)')
)

let myChart
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
  let newWidth = Math.max(150, startWidth + dx)
  let newHeight = Math.max(120, startHeight + dy)
  left.value = startLeft + (startWidth - newWidth)
  top.value = startTop + (startHeight - newHeight)
  width.value = newWidth
  height.value = newHeight
  nextTick(() => {
    if (myChart) myChart.resize()
  })
}
function stopResize() {
  resizing = false
  document.body.style.cursor = ''
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

const option = {
  backgroundColor: 'rgb(255,255,255)',
  title: {
    text: '',
    left: 'center',
    top: 15,
    textStyle: {
      color: '#333',
      fontWeight: 700,
      fontSize: 18
    }
  },
  legend: {
    data: [],
    top: 40,
    left: 'center',
    icon: 'rect',
    itemWidth: 20,
    itemHeight: 10,
    textStyle: { fontSize: 15, color: '#444', padding: [0,0,0,3] }
  },
  grid: { top: 70, left: 48, right: 16, bottom: 38, containLabel: true },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: [],
    axisLine: { lineStyle: { color: '#b7d7f6' } },
    axisLabel: { color: '#6c839a', fontWeight: 500 }
  },
  yAxis: {
    type: 'value',
    name: '',
    nameTextStyle: { color: '#6c839a', fontWeight: 500, align: 'right', padding: [0,0,0,0] },
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: '#d3e5f6' } },
    axisLabel: { color: '#6c839a', fontWeight: 500 }
  },
  series: []
}

function renderChart() {
  if (!RefMain.value) return
  if (!myChart) myChart = echarts.init(RefMain.value)
  myChart.setOption(option, true)
  myChart.resize()
}

// 保留原有初始数据生成逻辑
function genInitData() {
  if (props.compProps.isInit) {
    const catL = props.compProps.categories.length
    const dateNow = Date.now()
    Array(10).fill(0).forEach((_, idx) => {
      const timeStamp = formatTime(dateNow - (10 - idx) * 1000)
      props.compProps.time[idx] = timeStamp
      Array(catL).fill(0).forEach((__, catIdx) => {
        props.compProps.categories[catIdx].logs[idx] = idx + catIdx
      })
    })
    option.xAxis.data = props.compProps.time
  }
}

function formatTime(ts) {
  const date = new Date(ts)
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

function processPayload(payload) {
  return payload.replace(/\s+/g, '').split(/,|，/)
}

// 用于响应属性变化/主题变化，刷新option和背景色
function updateOptionData() {
  const comp = props.compProps
  const themeTitleColor = layoutSettings.swatch?.compFontColor || '#333'
  option.backgroundColor = comp.hideBg
    ? 'rgba(255,255,255,0.01)'
    : (layoutSettings.swatch?.compBgColor || 'rgb(255,255,255)')
  option.title.text = comp.title || '堆叠面积图'
  option.title.textStyle = {
    color: themeTitleColor,
    fontWeight: 700,
    fontSize: 18
  }
  option.yAxis.name = comp.yUnit
  option.legend.textStyle.color = layoutSettings.swatch?.compFontColor || '#333'
  option.legend.data = []
  option.series = []
  comp.categories.forEach((cat, idx) => {
    option.legend.data.push(cat.name || `类目${idx + 1}`)
    cat.logs.splice(0, cat.logs.length - comp.count)
    comp.time.splice(0, comp.time.length - comp.count)
    option.series.push({
      name: cat.name || `类目${idx + 1}`,
      data: cat.logs || [],
      type: 'line',
      stack: 'total',
      areaStyle: {},
      symbol: 'circle',
      symbolSize: 5,
      itemStyle: { color: cat.color, borderColor: '#fff', borderWidth: 2 },
      lineStyle: { color: cat.color, width: 2 }
    })
  })
  option.xAxis.data = comp.time || []
  if (myChart) {
    myChart.setOption({ backgroundColor: option.backgroundColor }, false)
    myChart.setOption(option, true)
    myChart.resize()
  }
}

watch([width, height], () => {
  if (props.compId !== props.activeCompId) return
  activeCompProps.get().width = width.value
  activeCompProps.get().height = height.value
  nextTick(() => myChart && myChart.resize())
})

watch(
  () => [
    props.compProps,
    layoutSettings.swatch?.compBgColor,
    layoutSettings.swatch?.compFontColor
  ],
  () => updateOptionData(),
  { immediate: true, deep: true }
)

// 属性面变化时组件DOM更新
const stackedareaChartWHChangeHandle = ({ id, newWidth, newHeight }) => {
  if (id !== props.compId) return
  width.value = newWidth
  height.value = newHeight
  nextTick(() => myChart && myChart.resize())
}
bus.on('stackedAreaChartWHChange', stackedareaChartWHChangeHandle)

const initStackedareaDataChangeHandle = () => {
  if (bus.activeCompId !== props.compId) return
  genInitData()
  updateOptionData()
}
bus.on('initStackedareaDataChange', initStackedareaDataChangeHandle)

// 监听订阅主题的数据
const subTopicDataHandle = ({ topic, qos, payload }) => {
  if (topic != props.compProps.topic.topic) return
  if (props.compProps.isInit) {
    props.compProps.time = []
    props.compProps.categories.forEach(cat => {
      cat.logs = []
    })
  }
  try {
    const data = processPayload(payload)
    const timeStamp = formatTime(Date.now())
    props.compProps.time.push(timeStamp)
    props.compProps.categories.forEach((cat, idx) => {
      if (data[idx] !== undefined) {
        cat.logs.push(parseFloat(data[idx]).toFixed(2))
      } else {
        cat.logs.push('NaN')
      }
    })
    props.compProps.isInit = false
    updateOptionData()
  } catch (e) { console.log("stackedarea sub data err", e) }
}
bus.on('subTopicData', subTopicDataHandle)

onBeforeMount(() => {
  width.value = props.compProps.width || 420
  height.value = props.compProps.height || 280
  genInitData()
})
onMounted(() => {
  renderChart()
  updateOptionData()
})

onBeforeUnmount(() => {
  bus.off('stackedareaChartWHChange', stackedareaChartWHChangeHandle)
  bus.off('initStackedareaDataChange', initStackedareaDataChangeHandle)
  bus.off('subTopicData', subTopicDataHandle)
})
</script>

<style scoped lang="scss">
.resize-container {
  border-radius: 7px;
  box-shadow: 0 0 8px rgba(0,0,0,0.03);
  background: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  &.active {
    border: 1px solid rgba(48, 150, 245, 0.6) !important;
  }
  .chart-center {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  #main {
    width: 98%;
    height: 98%;
    min-width: 120px;
    min-height: 100px;
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
</style>