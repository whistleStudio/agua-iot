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
      <div id="scatterMain" ref="RefMain"></div>
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

const width = ref(450)
const height = ref(300)
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

// 保证点数上限、初始值
function ensureValueValid() {
  const comp = props.compProps
  if (!Array.isArray(comp.value)) comp.value = []
  // 限制最大点数
  if (comp.value.length > comp.maxPoints) {
    comp.value = comp.value.slice(comp.value.length - comp.maxPoints)
  }
}

// 初始数据生成逻辑（沿用原有业务逻辑）
onBeforeMount(() => {
  width.value = props.compProps.width || 450
  height.value = props.compProps.height || 300
  const comp = props.compProps
  if (!Array.isArray(comp.value)) comp.value = []
  // isInit=true时，生成10个随机点，先清空
  if (comp.isInit) {
    comp.value = []
    for (let i = 0; i < 10; i++) {
      comp.value.push([
        Number((Math.random() * 100).toFixed(2)),
        Number((Math.random() * 100).toFixed(2))
      ])
    }
  }
  // 限制最大点数
  if (comp.value.length > comp.maxPoints) {
    comp.value = comp.value.slice(comp.value.length - comp.maxPoints)
  }
})

function getScatterOption() {
  const comp = props.compProps
  let scatterColor = comp.scatterColor || '#37a2da'
  let bg = comp.hideBg
    ? 'rgba(255,255,255,0.01)'
    : (layoutSettings.swatch?.compBgColor || 'rgb(255,255,255)')
  const themeTitleColor = layoutSettings.swatch?.compFontColor || '#333'
  return {
    backgroundColor: bg,
    title: {
      text: comp.title || '散点图',
      left: 'center',
      top: 14,
      textStyle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: themeTitleColor
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const [x, y] = params.value
        return `x: ${x} ${comp.xUnit || ''}<br/>y: ${y} ${comp.yUnit || ''}`
      }
    },
    xAxis: {
      name: comp.xUnit || '',
      nameLocation: 'end',
      type: 'value',
      axisLabel: { color: '#666', fontSize: 13 }
    },
    yAxis: {
      name: comp.yUnit || '',
      nameLocation: 'end',
      type: 'value',
      axisLabel: { color: '#666', fontSize: 13 }
    },
    series: [{
      type: 'scatter',
      symbolSize: 8,
      itemStyle: {
        color: scatterColor
      },
      data: comp.value.slice(-comp.count)
    }]
  }
}

function renderChart() {
  if (!RefMain.value) return
  if (!myChart) myChart = echarts.init(RefMain.value)
  ensureValueValid()
  myChart.setOption(getScatterOption(), true)
  myChart.resize()
}
function updateOptionData() {
  ensureValueValid()
  if (myChart) {
    // 实时刷新背景色
    myChart.setOption({ backgroundColor: getScatterOption().backgroundColor }, false)
    myChart.setOption(getScatterOption(), true)
    myChart.resize()
  }
}

// 数据大小变化自适应
watch([width, height], () => {
  if (props.compId !== props.activeCompId) return
  activeCompProps.get().width = width.value
  activeCompProps.get().height = height.value
  nextTick(() => myChart && myChart.resize())
})

// 响应属性及主题变化刷新
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
const scatterChartWHChangeHandle = ({ id, newWidth, newHeight }) => {
  if (id !== props.compId) return
  width.value = newWidth
  height.value = newHeight
  nextTick(() => myChart && myChart.resize())
}
bus.on('scatterChartWHChange', scatterChartWHChangeHandle)

// 业务数据订阅逻辑（保留原有）
const subTopicDataHandle = ({ topic, qos, payload, time }) => {
  if (topic !== props.compProps.topic.topic || qos !== props.compProps.topic.qos) return
  try {
    if (props.compProps.isInit) {
      // 清空数据
      props.compProps.value = []
      props.compProps.isInit = false
    }
    // 订阅数据格式：x,y
    const vals = payload.split(',').map(Number)
    if (vals.length === 2 && !vals.some(isNaN)) {
      if (!Array.isArray(props.compProps.value)) props.compProps.value = []
      props.compProps.value.push(vals)
      if (props.compProps.value.length > props.compProps.maxPoints) {
        props.compProps.value = props.compProps.value.slice(props.compProps.value.length - props.compProps.maxPoints)
      }
      updateOptionData()
    }
  } catch (e) { console.log("scatter sub data err", e); }
}
bus.on('subTopicData', subTopicDataHandle)

onMounted(() => {
  renderChart()
  updateOptionData()
})

onBeforeUnmount(() => {
  bus.off('scatterChartWHChange', scatterChartWHChangeHandle)
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
  }
  #scatterMain {
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