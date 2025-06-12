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
      <div id="gaugeMain" ref="RefMain"></div>
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

// --- 紧凑型仪表盘，标题居中，刻度示数不重叠，支持isInit ---
const option = {
  backgroundColor: 'rgb(255,255,255)',
  series: [
    {
      name: '仪表盘',
      type: 'gauge',
      min: 0,
      max: 100,
      splitNumber: 5,
      radius: '97%',
      center: ['50%', '57%'],
      startAngle: 210,
      endAngle: -30,
      axisLine: {
        lineStyle: {
          width: 15,
          color: [
            [0.3, '#67e0e3'],
            [0.7, '#37a2da'],
            [1, '#fd666d']
          ]
        }
      },
      pointer: {
        itemStyle: {
          color: 'auto'
        },
        width: 5,
        length: '68%'
      },
      axisTick: {
        distance: -21,
        length: 8,
        lineStyle: {
          color: '#fff',
          width: 2
        }
      },
      splitLine: {
        distance: -23,
        length: 18,
        lineStyle: {
          color: '#fff',
          width: 3
        }
      },
      axisLabel: {
        color: 'inherit',
        distance: 28, // 更远离刻度线，防止重叠
        fontSize: 13
      },
      title: {
        show: true,
        color: '#222',
        fontWeight: 'bold',
        fontSize: 20,
        offsetCenter: [0, '-75%'], // 圆心正上
      },
      detail: {
        valueAnimation: true,
        formatter: '{value} {b}',
        color: 'auto',
        fontSize: 20,
        offsetCenter: [0, '40%']
      },
      data: [{ value: 0, name: '仪表盘' }]
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

// 初始值
function genInitData() {
  // isInit=true 时 value 一律为0
  if (props.compProps.isInit) {
    props.compProps.value = 0
    option.series[0].data = [{ value: 0, name: props.compProps.title || '仪表盘' }]
  } else {
    option.series[0].data = [{ value: props.compProps.value || 0, name: props.compProps.title || '仪表盘' }]
  }
  option.series[0].min = props.compProps.min ?? 0
  option.series[0].max = props.compProps.max ?? 100
  option.series[0].title = {
    show: true,
    color: '#222',
    fontWeight: 'bold',
    fontSize: 20,
    offsetCenter: [0, '-75%']
  }
}

function updateOptionData() {
  const comp = props.compProps
  if (comp.hideBg) {
    bgc.value = 'rgba(255,255,255,0.01)'
    option.backgroundColor = 'rgba(255,255,255,0.01)'
  } else {
    bgc.value = 'rgb(255,255,255)'
    option.backgroundColor = 'rgb(255,255,255)'
  }
  option.series[0].min = comp.min ?? 0
  option.series[0].max = comp.max ?? 100
  // isInit时value一律为0
  option.series[0].data = [{
    value: comp.isInit ? 0 : (comp.value ?? 0),
    name: comp.title || '仪表盘'
  }]
  option.series[0].title = {
    show: true,
    color: '#222',
    fontWeight: 'bold',
    fontSize: 18,
    offsetCenter: [0, '70%']
  }
  option.series[0].detail = {
    valueAnimation: true,
    formatter: `{value} ${comp.unit || ''}`,
    color: 'inherit',
    fontSize: 20,
    offsetCenter: [0, '40%']
  }
  option.series[0].axisLabel = {
    color: 'inherit',
    distance: 28,
    fontSize: 13
  }
  if (myChart) {
    myChart.setOption(option, true)
    myChart.resize()
  }
}

/* -------------------------------------- */
watch([width, height], () => {
  if (props.compId !== props.activeCompId) return
  activeCompProps.get().width = width.value
  activeCompProps.get().height = height.value
  nextTick(() => myChart && myChart.resize())
})

watch(props.compProps, newVal => {
  updateOptionData()
}, { immediate: true, deep: true })

const gaugeChartWHChangeHandle = ({ id, newWidth, newHeight }) => {
  if (id !== props.compId) return
  width.value = newWidth
  height.value = newHeight
  nextTick(() => myChart && myChart.resize())
}
bus.on('gaugeChartWHChange', gaugeChartWHChangeHandle)

const subTopicDataHandle = ({ topic, qos, payload, time }) => {
  if ( topic != props.compProps.topic.topic || qos != props.compProps.topic.qos ) return
  try {
    if (props.compProps.isInit) {
      props.compProps.value = 0
      props.compProps.isInit = false
    } else {
      const value = parseFloat(payload)
      props.compProps.value = isNaN(value) ? 0 : value
    }
    updateOptionData()
  } catch(e) { console.log("gauge sub data err", e); }
}
bus.on('subTopicData', subTopicDataHandle)

onBeforeMount(() => {
  width.value = props.compProps.width || 300
  height.value = props.compProps.height || 200
  genInitData()
  updateOptionData()
})
onMounted(renderChart)

onBeforeUnmount(() => {
  bus.off('gaugeChartWHChange', gaugeChartWHChangeHandle)
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
  #gaugeMain {
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