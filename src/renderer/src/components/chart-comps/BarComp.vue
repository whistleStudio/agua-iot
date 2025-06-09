<template>
  <div
    class="resize-container" :class="{ active: props.compId === activeCompId }"
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
    <div class="chart-center">
      <div id="main" ref="RefMain"></div>
    </div>
    <div
      class="resize-handle"
      @mousedown="startResize"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, inject, onBeforeMount, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
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

const RefMain = ref(null)
const container = ref(null)

let myChart

const width = ref(300)
const height = ref(200)
const left = ref(0)
const top = ref(0)
const bgc = ref('rgb(246, 250, 253)')

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
  backgroundColor: 'rgb(255, 255, 255)',
  title: {
    text: '柱状图',
    left: 'center',
    top: 15,
    textStyle: {
      fontWeight: 700,
      fontSize: 18,
      color: '#222'
    }
  },
  legend: {
    data: ['类目1'],
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
  series: [
  ]
}

function renderChart() {
  if (!RefMain.value) return
  if (!myChart) {
    myChart = echarts.init(RefMain.value)
  }
  myChart.setOption(option, true)
  myChart.resize()
}

// 初始状态样例数据生成
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

// 将 Date.now() 转为 "HH:mm:ss" 字符串
function formatTime(ts) {
  const date = new Date(ts)
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

// 处理payload
function processPayload(payload) {
  return payload.replace(/\s+/g, '').split(/,|，/)
}

watch([width, height], () => {
  activeCompProps.get().width = width.value
  activeCompProps.get().height = height.value
  nextTick(() => myChart && myChart.resize())
})

watch(props.compProps, newVal => {
  console.log('bar comp props change:')
  option.title.text = newVal.title || '柱状图'
  option.yAxis.name = newVal.yUnit
  if (newVal.hideBg) {
    bgc.value = 'rgba(255, 255, 255, 0.01)'
    option.backgroundColor = 'rgba(255, 255, 255, 0.01)'
  } else {
    bgc.value = 'rgb(255, 255, 255)'
    option.backgroundColor = 'rgb(255, 255, 255)'
  }
  option.legend.data = []
  option.series = []
  newVal.categories.forEach((cat, idx) => {
    option.legend.data.push(cat.name || `类目${idx + 1}`)
    cat.logs.splice(0, cat.logs.length - newVal.count) // 保留最新count条
    newVal.time.splice(0, newVal.time.length - newVal.count)
    option.series.push({
      name: cat.name || `类目${idx + 1}`,
      data: cat.logs || [],
      type: 'bar',
      // barWidth: 20,
      barGap: '0%',
      barCategoryGap: '30%',
      itemStyle: { color: cat.color }
    })
  })
  option.xAxis.data = newVal.time || []
  if (myChart) {
    myChart.setOption(option, true)
    myChart.resize()
  }
}, { immediate: true, deep: true })

// 属性面变化时组件DOM更新
const barChartWHChangeHandle = ({ id, newWidth, newHeight }) => {
  if (id !== props.compId) return
  width.value = newWidth
  height.value = newHeight
  nextTick(() => myChart && myChart.resize())
}
bus.on('barChartWHChange', barChartWHChangeHandle)

// 增删类目时更新图表
const initBarDataChangeHandle = () => {
  if (bus.activeCompId !== props.compId) return 
  genInitData()
}
bus.on('initBarDataChange', initBarDataChangeHandle)

// 监听订阅主题的数据
const subTopicDataHandle = ({ topic, qos, payload, time }) => {
  if ( topic != props.compProps.topic.topic || qos != props.compProps.topic.qos ) return
  if (props.compProps.isInit) {
    props.compProps.time = [] // 清空时间戳
    props.compProps.categories.forEach(cat => {
      cat.logs = [] // 清空所有类目数据
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
    props.compProps.isInit = false // 标记为非初始化状态
  } catch(e) { console.log("bar sub data err", e); return}
}
bus.on('subTopicData', subTopicDataHandle)

onBeforeMount(() => {
  width.value = props.compProps.width || 420
  height.value = props.compProps.height || 280
  genInitData()
})
onMounted(renderChart)

onBeforeUnmount(() => {
  bus.off('barChartWHChange', barChartWHChangeHandle)
  bus.off('initBarDataChange', initBarDataChangeHandle)
  bus.off('subTopicData', subTopicDataHandle)
})

</script>

<style scoped lang="scss">
.resize-container {
  border-radius: 7px;
  box-shadow: 0 0 8px rgba(0,0,0,0.03);
  background: rgb(255, 255, 255);
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