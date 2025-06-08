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
      <div id="candlestickMain" ref="RefMain"></div>
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

const width = ref(420)
const height = ref(280)
const left = ref(0)
const top = ref(0)
const bgc = ref('rgb(255,255,255)')

function formatTime(ts) {
  const date = new Date(ts)
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

function ensureValueValid() {
  const comp = props.compProps
  if (!Array.isArray(comp.value)) comp.value = []
  if (!Array.isArray(comp.time)) comp.time = []
  // isInit=true时，生成10个随机K线点，每隔1小时
  if (comp.isInit) {
    comp.value = []
    comp.time = []
    const dateNow = Date.now()
    for (let i = 0; i < 10; i++) {
      const open = +(Math.random() * 100).toFixed(2)
      const close = +(open + (Math.random() - 0.5) * 10).toFixed(2)
      const low = +(Math.min(open, close) - Math.random() * 5).toFixed(2)
      const high = +(Math.max(open, close) + Math.random() * 5).toFixed(2)
      comp.value.push([open, close, low, high])
      // 每隔1小时
      comp.time.push(formatTime(dateNow - (10 - i) * 60 * 60 * 1000))
    }
    // 不立刻置 isInit=false，首次收到订阅数据后再置
  }
  // 限制最大点数
  if (comp.value.length > comp.maxPoints) {
    comp.value = comp.value.slice(comp.value.length - comp.maxPoints)
    comp.time = comp.time.slice(comp.time.length - comp.maxPoints)
  }
}

function getCandlestickOption() {
  const comp = props.compProps
  let bg = comp.hideBg ? 'rgba(255,255,255,0.01)' : 'rgb(255,255,255)'
  bgc.value = bg
  const showCount = Math.min(comp.value.length, comp.count)
  const xData = (comp.time || []).slice(-showCount)
  return {
    backgroundColor: bg,
    title: {
      text: comp.title || 'K线图',
      left: 'center',
      top: 14,
      textStyle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#222'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params) => {
        if (!params || !params[0] || !params[0].data) return ''
        const [open, close, low, high] = params[0].data
        return `时间: ${params[0].axisValue}<br/>Open: ${open}<br/>Close: ${close}<br/>Low: ${low}<br/>High: ${high}`
      }
    },
    grid: { left: 40, right: 16, top: 60, bottom: 35 },
    xAxis: {
      type: 'category',
      data: xData,
      scale: true,
      boundaryGap: true,
      axisLine: { lineStyle: { color: '#b7d7f6' } },
      axisLabel: { color: '#6c839a', fontWeight: 500 }
    },
    yAxis: {
      scale: true,
      splitArea: { show: true },
      axisLine: { lineStyle: { color: '#b7d7f6' } },
      axisLabel: { color: '#6c839a', fontWeight: 500 }
    },
    series: [{
      type: 'candlestick',
      data: comp.value.slice(-showCount),
      itemStyle: {
        color: '#ee3333',
        color0: '#4caf50',
        borderColor: '#ee3333',
        borderColor0: '#4caf50'
      }
    }]
  }
}

function renderChart() {
  if (!RefMain.value) return
  if (!myChart) {
    myChart = echarts.init(RefMain.value)
  }
  ensureValueValid()
  myChart.setOption(getCandlestickOption(), true)
  myChart.resize()
}
function updateOptionData() {
  ensureValueValid()
  if (myChart) {
    myChart.setOption(getCandlestickOption(), true)
    myChart.resize()
  }
}

watch([width, height], () => {
  activeCompProps.get().width = width.value
  activeCompProps.get().height = height.value
  nextTick(() => myChart && myChart.resize())
})
watch(() => [
  props.compProps.title,
  props.compProps.width,
  props.compProps.height,
  props.compProps.hideBg,
  props.compProps.count,
  props.compProps.maxPoints
], () => {
  updateOptionData()
})
watch(() => props.compProps.value, () => {
  updateOptionData()
}, { deep: true })
watch(() => props.compProps.time, () => {
  updateOptionData()
}, { deep: true })

const candlestickChartWHChangeHandle = ({ id, newWidth, newHeight }) => {
  if (id !== props.compId) return
  width.value = newWidth
  height.value = newHeight
  nextTick(() => myChart && myChart.resize())
}
bus.on('candlestickChartWHChange', candlestickChartWHChangeHandle)

const subTopicDataHandle = ({ topic, qos, payload, time }) => {
  if (topic !== props.compProps.topic.topic || qos !== props.compProps.topic.qos) return
  try {
    if (props.compProps.isInit) {
      props.compProps.value = []
      props.compProps.time = []
      // 不立刻置 isInit=false
    }
    const vals = payload.split(',').map(Number)
    if (vals.length === 4 && !vals.some(isNaN)) {
      if (!Array.isArray(props.compProps.value)) props.compProps.value = []
      if (!Array.isArray(props.compProps.time)) props.compProps.time = []
      props.compProps.value.push(vals)
      props.compProps.time.push(formatTime(Date.now()))
      if (props.compProps.value.length > props.compProps.maxPoints) {
        props.compProps.value = props.compProps.value.slice(props.compProps.value.length - props.compProps.maxPoints)
        props.compProps.time = props.compProps.time.slice(props.compProps.time.length - props.compProps.maxPoints)
      }
      if (props.compProps.isInit) props.compProps.isInit = false
      updateOptionData()
    }
  } catch (e) { console.log("candlestick sub data err", e); }
}
bus.on('subTopicData', subTopicDataHandle)

onBeforeMount(() => {
  width.value = props.compProps.width || 420
  height.value = props.compProps.height || 280
  ensureValueValid()
})
onMounted(renderChart)

onBeforeUnmount(() => {
  bus.off('candlestickChartWHChange', candlestickChartWHChangeHandle)
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
  #candlestickMain {
    width: 99%;
    height: 99%;
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