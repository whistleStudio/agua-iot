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
      <div id="pieMain" ref="RefMain"></div>
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
  compProps: Object,
  compId: Number,
  activeCompId: Number
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
  if (!myChart) myChart = echarts.init(RefMain.value)
  myChart.setOption(option, true)
  myChart.resize()
}

function updateOptionData() {
  const comp = props.compProps
  // 适配主题标题色
  const themeTitleColor = layoutSettings.swatch?.compFontColor || '#333'
  option.backgroundColor = comp.hideBg
    ? 'rgba(255,255,255,0.01)'
    : (layoutSettings.swatch?.compBgColor || 'rgb(255,255,255)')
  option.title.text = comp.title || '饼状图'
  option.title.textStyle = {
    color: themeTitleColor,
    fontWeight: 700,
    fontSize: 18
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
  () => [props.compProps, layoutSettings.swatch?.compBgColor, layoutSettings.swatch?.compFontColor],
  () => updateOptionData(),
  { immediate: true, deep: true }
)

const pieChartWHChangeHandle = ({ id, newWidth, newHeight }) => {
  if (id !== props.compId) return
  width.value = newWidth
  height.value = newHeight
  nextTick(() => myChart && myChart.resize())
}
bus.on('pieChartWHChange', pieChartWHChangeHandle)

const initPieDataChangeHandle = () => {
  if (bus.activeCompId !== props.compId) return
  updateOptionData()
}
bus.on('initPieDataChange', initPieDataChangeHandle)

const subTopicDataHandle = ({ topic, qos, payload }) => {
  if (topic !== props.compProps.topic.topic) return
  try {
    const data = payload.replace(/\s+/g, '').split(/,|，/)
    props.compProps.data.forEach((seg, idx) => {
      if (data[idx] !== undefined) {
        seg.value = parseFloat(data[idx])
        if (isNaN(seg.value)) seg.value = 0
        if (seg.value < 0) seg.value = 0 // 确保占比不为负
      } else {
        seg.value = 0
      }
    })
    props.compProps.isInit = false
    updateOptionData()
  } catch (e) { console.log("pie sub data err", e); }
}
bus.on('subTopicData', subTopicDataHandle)

onBeforeMount(() => {
  width.value = props.compProps.width || 300
  height.value = props.compProps.height || 200
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
  background: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  &.active {
    border: 1.5px solid rgba(48, 150, 245, 0.6) !important;
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