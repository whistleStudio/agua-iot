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

const option = ref({
  backgroundColor: 'rgb(255, 255, 255)',
  title: {
    text: '雷达图',
    left: 15,
    top: 15,
    textStyle: {
      fontWeight: 700,
      fontSize: 18,
      color: '#222'
    }
  },
  legend: {
    show: false
  },
  tooltip: {
    show: true,
    formatter: function(params) {
      if (!params || !params.value) return '';
      let indicator = option.value.radar.indicator || [];
      let result = '';
      for (let i = 0; i < params.value.length; ++i) {
        let maxStr = indicator[i]?.max !== undefined ? `(最大值:${indicator[i].max})` : '';
        result += `${indicator[i]?.axisName || ''}: ${params.value[i]} ${maxStr}<br/>`;
      }
      return result;
    }
  },
  radar: {
    indicator: [],
    radius: '60%',
    splitNumber: 5,
    splitArea: {
      areaStyle: { color: ['#f7fbff', '#e5f3fe'] }
    },
    axisLine: {
      lineStyle: { color: '#b7d7f6' }
    },
    splitLine: {
      lineStyle: { color: '#d3e5f6' }
    },
    name: {
      color: '#444',
      fontSize: 12,
      // 显示名称和最大值
      formatter: function (axisName, indicator) {
        return indicator.axisName + (indicator.max !== undefined ? `\n(max:${indicator.max})` : '')
      }
    }
  },
  series: [
    {
      type: 'radar',
      data: [
        {
          value: [],
          name: '数据',
          areaStyle: { color: 'rgba(76,170,254,0.15)' },
          lineStyle: { color: '#4caafe', width: 2 },
          itemStyle: { color: '#4caafe', borderColor: '#fff', borderWidth: 2 }
        }
      ]
    }
  ]
})

function renderChart() {
  if (!RefMain.value) return
  if (!myChart) {
    myChart = echarts.init(RefMain.value)
  }
  myChart.setOption(option.value, true)
  myChart.resize()
}

// 处理payload
function processPayload(payload) {
  return payload.replace(/\s+/g, '').split(/,|，/).map(Number)
}

watch([width, height], () => {
  activeCompProps.get().width = width.value
  activeCompProps.get().height = height.value
  nextTick(() => myChart && myChart.resize())
})

watch(props.compProps, newVal => {
  option.value.title.text = newVal.title || '雷达图'
  if (newVal.hideBg) {
    bgc.value = 'rgba(255, 255, 255, 0.01)'
    option.value.backgroundColor = 'rgba(255, 255, 255, 0.01)'
  } else {
    bgc.value = 'rgb(255, 255, 255)'
    option.value.backgroundColor = 'rgb(255, 255, 255)'
  }
  // 更新 indicator，显示最大值，使用 axisName
  option.value.radar.indicator = (newVal.categories || []).map(cat => ({
    axisName: cat.name,
    max: cat.max !== undefined ? cat.max : 100
  }))
  // 清空数据
  option.value.series[0].data[0].value = []
  if (myChart) {
    myChart.setOption(option.value, true)
    myChart.resize()
  }
}, { immediate: true, deep: true })

// 属性面变化时组件DOM更新
const radarChartWHChangeHandle = ({ id, newWidth, newHeight }) => {
  if (id !== props.compId) return
  width.value = newWidth
  height.value = newHeight
  nextTick(() => myChart && myChart.resize())
}
bus.on('radarChartWHChange', radarChartWHChangeHandle)

// 增删类目时更新图表
const initRadarDataChangeHandle = () => {
  if (bus.activeCompId !== props.compId) return 
  // 更新指示器
  option.value.radar.indicator = (props.compProps.categories || []).map(cat => ({
    axisName: cat.name,
    max: cat.max !== undefined ? cat.max : 100
  }))
  option.value.series[0].data[0].value = []
  if (myChart) {
    myChart.setOption(option.value, true)
    myChart.resize()
  }
}
bus.on('initRadarDataChange', initRadarDataChangeHandle)

// 监听订阅主题的数据
const subTopicDataHandle = ({ topic, qos, payload, time }) => {
  if ( topic != props.compProps.topic.topic || qos != props.compProps.topic.qos ) return
  try {
    const data = processPayload(payload)
    // 只保留最新一次
    option.value.series[0].data[0].value = data.slice(0, (props.compProps.categories || []).length)
    if (myChart) {
      myChart.setOption(option.value, true)
      myChart.resize()
    }
  } catch(e) { console.log("radar sub data err", e); return}
}
bus.on('subTopicData', subTopicDataHandle)

onBeforeMount(() => {
  width.value = props.compProps.width || 420
  height.value = props.compProps.height || 280
  // 初始化indicator，显示最大值，使用 axisName
  option.value.radar.indicator = (props.compProps.categories || []).map(cat => ({
    axisName: cat.name,
    max: cat.max !== undefined ? cat.max : 100
  }))
  option.value.series[0].data[0].value = []
})
onMounted(renderChart)

onBeforeUnmount(() => {
  bus.off('radarChartWHChange', radarChartWHChangeHandle)
  bus.off('initRadarDataChange', initRadarDataChangeHandle)
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