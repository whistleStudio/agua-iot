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
      <div id="pieMain" ref="RefMain"></div>
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
    text: '饼状图',
    left: 'center',
    top: 15,
    textStyle: {
      fontWeight: 700,
      fontSize: 18,
      color: '#222'
    }
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 10,
    top: 40,
    textStyle: { fontSize: 15, color: '#444' }
  },
  series: [
    {
      name: '分块',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'outside',
        formatter: '{d}%',
      },
      labelLine: {
        show: true
      },
      data: []
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

// 初始状态样例数据生成
function genInitData() {
  if (props.compProps.isInit) {
    const dataL = props.compProps.data.length
    for (let i = 0; i < dataL; i++) {
      props.compProps.data[i].value = 20 + 10 * i
    }
    updateOptionData()
  }
}

// 处理payload
function processPayload(payload) {
  return payload.replace(/\s+/g, '').split(/,|，/)
}

function updateOptionData() {
  const comp = props.compProps
  option.title.text = comp.title || '饼状图'
  if (comp.hideBg) {
    bgc.value = 'rgba(255,255,255,0.01)'
    option.backgroundColor = 'rgba(255,255,255,0.01)'
  } else {
    bgc.value = 'rgb(255,255,255)'
    option.backgroundColor = 'rgb(255,255,255)'
  }
  option.legend.data = []
  option.series[0].data = []
  comp.data.forEach((seg, idx) => {
    option.legend.data.push(seg.name || `分块${idx + 1}`)
    option.series[0].data.push({
      value: seg.value || 0,
      name: seg.name || `分块${idx + 1}`,
      itemStyle: { color: seg.color }
    })
  })
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

// 属性面变化时组件DOM更新
const pieChartWHChangeHandle = ({ id, newWidth, newHeight }) => {
  if (id !== props.compId) return
  width.value = newWidth
  height.value = newHeight
  nextTick(() => myChart && myChart.resize())
}
bus.on('pieChartWHChange', pieChartWHChangeHandle)

// 增删分块时更新图表
const initPieDataChangeHandle = () => {
  if (bus.activeCompId !== props.compId) return 
  genInitData()
  updateOptionData()
}
bus.on('initPieDataChange', initPieDataChangeHandle)

// 监听订阅主题的数据
const subTopicDataHandle = ({ topic, qos, payload, time }) => {
  if ( topic != props.compProps.topic.topic || qos != props.compProps.topic.qos ) return
  if (props.compProps.isInit) {
    props.compProps.data.forEach(seg => {
      seg.value = 0 // 清空所有分块数据
    })
  }
  try {
    const data = processPayload(payload)
    props.compProps.data.forEach((seg, idx) => {
      if (data[idx] !== undefined) {
        seg.value = parseFloat(data[idx])
      } else {
        seg.value = 0
      }
    })
    props.compProps.isInit = false // 标记为非初始化状态
    updateOptionData()
  } catch(e) { console.log("pie sub data err", e); }
}
bus.on('subTopicData', subTopicDataHandle)
/* ---------------------------------- */
onBeforeMount(() => {
  width.value = props.compProps.width || 300
  height.value = props.compProps.height || 200
  genInitData()
  updateOptionData()
})
onMounted(renderChart)

onBeforeUnmount(() => {
  bus.off('pieChartWHChange', pieChartWHChangeHandle)
  bus.off('initPieDataChange', initPieDataChangeHandle)
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
  #pieMain {
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