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
      <div id="liquidfillMain" ref="RefMain"></div>
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
import 'echarts-liquidfill'
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

const width = ref(240)
const height = ref(240)
const left = ref(0)
const top = ref(0)
const bgc = ref('rgb(255,255,255)')
let resizing = false
let origin = { x: 0, y: 0 }
let startLeft = 0
let startTop = 0
let startWidth = 0
let startHeight = 0

// 拖拽缩放逻辑（保持handleResize不变）
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
  let newHeight = Math.max(100, startHeight + dy)
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

// 只提供一个主色，自动生成另外两个配色
function getColorArr() {
  const comp = props.compProps
  // 合法性校验，只允许 #RGB 或 #RRGGBB
  const isColor = v => typeof v === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)
  // 主色，或默认
  let mainColor = isColor(comp.colorMain) ? comp.colorMain : '#4caafe'
  // 自动生成中深配色
  function shadeColor(color, percent) {
    // 支持 #RGB 及 #RRGGBB
    let hex = color.replace('#', '')
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('')
    let r = parseInt(hex.slice(0, 2), 16)
    let g = parseInt(hex.slice(2, 4), 16)
    let b = parseInt(hex.slice(4, 6), 16)
    r = Math.min(255, Math.max(0, Math.round(r * (1 + percent))))
    g = Math.min(255, Math.max(0, Math.round(g * (1 + percent))))
    b = Math.min(255, Math.max(0, Math.round(b * (1 + percent))))
    return `#${(r<<16|g<<8|b).toString(16).padStart(6, '0')}`
  }
  // 中配色更浅，低配色更深
  const colorMid = shadeColor(mainColor, 0.23)    // 主色+23%
  const colorLow = shadeColor(mainColor, -0.18)   // 主色-18%
  return [colorLow, mainColor, colorMid]
}

// 保证初始值
function ensureValueValid() {
  const comp = props.compProps
  if (typeof comp.total !== 'number' || isNaN(comp.total) || comp.total <= 0) comp.total = 100
  if (typeof comp.value !== 'number' || isNaN(comp.value)) comp.value = 0
}

// 计算百分比
function getPercent() {
  const comp = props.compProps
  ensureValueValid()
  let percent = comp.total > 0 ? comp.value / comp.total : 0
  if (percent > 1) percent = 1
  if (percent < 0) percent = 0
  return percent
}

function getLiquidfillOption() {
  const comp = props.compProps
  let bg = comp.hideBg ? 'rgba(255,255,255,0.01)' : 'rgb(255,255,255)'
  bgc.value = bg
  const percent = getPercent()
  const colorArr = getColorArr()
  return {
    backgroundColor: bg,
    title: {
      text: comp.title || '水波图',
      left: 'center',
      top: 40, // 向下调整标题
      textStyle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#222'
      }
    },
    series: [{
      type: 'liquidFill',
      radius: '90%',
      center: ['50%', '50%'],
      data: [
        percent,
        Math.max(percent - 0.05, 0),
        Math.max(percent - 0.1, 0)
      ],
      backgroundStyle: {
        borderColor: '#156ACF',
        borderWidth: 1,
        color: 'rgba(255,255,255,0.6)'
      },
      label: {
        formatter: () => `${Math.round(percent * 100)}%`,
        fontSize: 32,
        color: '#156ACF',
        fontWeight: 'bold'
      },
      outline: {
        show: true,
        borderDistance: 4,
        itemStyle: {
          borderWidth: 2,
          borderColor: '#4caafe'
        }
      },
      itemStyle: {
        opacity: 0.9,
        shadowBlur: 8
      },
      color: colorArr
    }]
  }
}

function renderChart() {
  if (!RefMain.value) return
  if (!myChart) {
    myChart = echarts.init(RefMain.value)
  }
  ensureValueValid()
  myChart.setOption(getLiquidfillOption(), true)
  myChart.resize()
}
function updateOptionData() {
  ensureValueValid()
  if (myChart) {
    myChart.setOption(getLiquidfillOption(), true)
    myChart.resize()
  }
}

watch([width, height], () => {
  if (props.compId !== props.activeCompId) return
  activeCompProps.get().width = width.value
  activeCompProps.get().height = height.value
  nextTick(() => myChart && myChart.resize())
})
watch(props.compProps, newVal => {
  updateOptionData()
}, { immediate: true, deep: true })

const liquidfillChartWHChangeHandle = ({ id, newWidth, newHeight }) => {
  if (id !== props.compId) return
  width.value = newWidth
  height.value = newHeight
  nextTick(() => myChart && myChart.resize())
}
bus.on('liquidfillChartWHChange', liquidfillChartWHChangeHandle)

// 订阅数据：每次接收一个数值，覆盖value
const subTopicDataHandle = ({ topic, qos, payload, time }) => {
  if (topic !== props.compProps.topic.topic || qos !== props.compProps.topic.qos) return
  try {
    let val = parseFloat(payload)
    if (!isNaN(val)) {
      props.compProps.value = val
      updateOptionData()
    }
  } catch (e) { console.log("liquidfill sub data err", e); }
}
bus.on('subTopicData', subTopicDataHandle)

onBeforeMount(() => {
  width.value = props.compProps.width || 240
  height.value = props.compProps.height || 240
  ensureValueValid()
})
onMounted(renderChart)

onBeforeUnmount(() => {
  bus.off('liquidfillChartWHChange', liquidfillChartWHChangeHandle)
  bus.off('subTopicData', subTopicDataHandle)
})

</script>

<style scoped lang="scss">
.resize-container {
  border-radius: 10px;
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
  #liquidfillMain {
    width: 99%;
    height: 99%;
    min-width: 100px;
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