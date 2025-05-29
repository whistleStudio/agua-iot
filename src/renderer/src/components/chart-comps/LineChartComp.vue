<template>
  <div
    class="resize-container"
    :style="{
      width: width + 'px',
      height: height + 'px',
      left: left + 'px',
      top: top + 'px',
      position: 'absolute'
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
import { ref, onMounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  compProps: {
    type: Object,
    required: false,
    default: () => ({})
  }
})

const RefMain = ref(null)
const container = ref(null)
let myChart

const width = ref(300)
const height = ref(200)
const left = ref(100)
const top = ref(100)

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
  backgroundColor: '#f6fafd',
  title: {
    text: '多折线图',
    left: 'center',
    top: 15,
    textStyle: {
      fontWeight: 700,
      fontSize: 18,
      color: '#222'
    }
  },
  legend: {
    data: ['折线1', '折线2'],
    top: 40,
    left: 'center',
    icon: 'circle',
    itemWidth: 20,
    itemHeight: 10,
    textStyle: { fontSize: 15, color: '#444', padding: [0,0,0,3] }
  },
  grid: { top: 70, left: 48, right: 16, bottom: 38, containLabel: true },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    axisLine: { lineStyle: { color: '#b7d7f6' } },
    axisLabel: { color: '#6c839a', fontWeight: 500 }
  },
  yAxis: {
    type: 'value',
    name: '℃',
    nameTextStyle: { color: '#6c839a', fontWeight: 500, align: 'right', padding: [0,0,0,0] },
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: '#d3e5f6' } },
    axisLabel: { color: '#6c839a', fontWeight: 500 }
  },
  series: [
    {
      name: '折线1',
      data: [150, 230, 224, 218, 135, 147, 260],
      type: 'line',
      symbol: 'circle',
      symbolSize: 7,
      itemStyle: { color: '#4d8af0', borderColor: '#fff', borderWidth: 2 },
      lineStyle: { color: '#4d8af0', width: 2 }
    },
    {
      name: '折线2',
      data: [180, 330, 224, 218, 135, 147, 260],
      type: 'line',
      symbol: 'circle',
      symbolSize: 7,
      itemStyle: { color: '#ff0000', borderColor: '#fff', borderWidth: 2 },
      lineStyle: { color: '#ff0000', width: 2 }
    }
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

onMounted(renderChart)
watch([width, height], () => nextTick(() => myChart && myChart.resize()))
</script>

<style scoped lang="scss">
.resize-container {
  border: 1.5px solid #90c2fa;
  border-radius: 7px;
  background: #f6fafd;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;

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