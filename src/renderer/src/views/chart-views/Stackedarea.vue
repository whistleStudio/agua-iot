<template>
  <div class="component-props">
    <div class="component-props__title">组件属性 <span>堆叠面积图</span></div>
    <a-divider style="margin: 8px 0 16px 0" />

    <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" layout="horizontal">
      <a-form-item label="组件标题">
        <a-input v-model:value="attrData.title" placeholder="堆叠面积图" />
      </a-form-item>
      <a-form-item label="Topic">
        <a-select v-model:value="selectTopic" placeholder="请选择订阅主题" :options="opts" @change="v => { attrData.topic = JSON.parse(v) }"></a-select>
      </a-form-item>
      <a-form-item label="组件宽度">
        <a-input
          placeholder="420"
          type="number"
          :value="localWidth"
          @input="onWidthInput"
          @pressEnter="enterBlurWidth"
          @blur="onWidthBlur"
        />
      </a-form-item>
      <a-form-item label="组件高度">
        <a-input
          placeholder="280"
          type="number"
          :value="localHeight"
          @input="onHeightInput"
          @pressEnter="enterBlurHeight"
          @blur="onHeightBlur"
        />
      </a-form-item>
      <a-form-item label="隐藏底色">
        <a-checkbox v-model:checked="attrData.hideBg" />
      </a-form-item>
      <a-form-item label="纵轴单位">
        <a-input v-model:value="attrData.yUnit" placeholder="单位" />
      </a-form-item>
      <a-form-item label="数量">
        <a-select v-model:value="attrData.count" :options="countOpts" />
      </a-form-item>
      <a-form-item label="类目配置">
        <div class="category-list">
          <div v-for="(cat, idx) in categoryList" :key="idx" class="category-row">
            <span class="cat-index">{{ idx + 1 }}.</span>
            <a-input class="cat-input" v-model:value="categoryList[idx].name" :placeholder="`类目${idx + 1}`" />
            <a-button v-if="categoryList.length > 1" type="text" class="cat-remove-btn" style="color:#d4380d" @click="removeCategory(idx)">-</a-button>
          </div>
          <a-button v-if="categoryList.length < 5" type="dashed" class="cat-add-btn" @click="addCategory" style="margin-top: 8px;width: 40px;height: 32px;">+</a-button>
        </div>
      </a-form-item>
    </a-form>

    <div class="tips">
      <div class="tips-title">组件功能</div>
      <div class="tips-desc">
        定时获取最新的10/50/100条数据，<br>
        以消息时间为x轴，显示在堆叠面积图上。
      </div>
    </div>
    <div class="tips">
      <div class="tips-title">订阅数据</div>
      <div class="tips-desc">
        示例：111，222，333...<br>
        说明：数据1，数据2，数据3...(与类目数量匹配)
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, computed, ref, watch, onBeforeMount } from 'vue'
import bus from '../../utils/bus'

const activeCompProps = inject('activeCompProps')
const attrData = computed({
  get: () => activeCompProps.get(),
  set: (val) => { activeCompProps.set(val) }
})

const subTopics = computed(() =>
  (bus.activeProjIdx !== -1 && bus.activeProjIdx !== undefined)
    ? bus.projList[bus.activeProjIdx].subTopics
    : []
)

const selectTopic = ref()
const opts = computed(() => subTopics.value.map(v => ({
  label: bus.projList[bus.activeProjIdx].mode === "remote" ? `${v.topic}${'\u00A0'.repeat(Math.max(0, 25 - v.topic.length))} qos:${v.qos}` : v.topic,
  value: JSON.stringify(v)
})))

const countOpts = [
  { label: '10', value: 10 },
  { label: '50', value: 50 },
  { label: '100', value: 100 }
]

const categoryList = computed(() => (attrData.value.categories || []))

function addCategory() {
  let defaultNameList = Array(5).fill(0).map((_, i) => `类目${i + 1}`)
  let defaultColorList = ['#a9c5e8', '#b7e8c5', '#f7e3b5', '#f5c6b7', '#e3b7d3']
  categoryList.value.forEach(cat => {
    const idx = defaultNameList.indexOf(cat.name)
    if (idx !== -1) defaultNameList.splice(idx, 1)
    const idx2 = defaultColorList.indexOf(cat.color)
    if (idx2 !== -1) defaultColorList.splice(idx2, 1)
  })
  if (categoryList.value.length < 5) {
    const logs = []
    const times = attrData.value.time || []
    for(let i = 0; i < times.length; i++) logs.push('NaN')
    categoryList.value.push({name: defaultNameList[0], color: defaultColorList[0], logs})
    bus.emit('initStackedAreaDataChange')
  }
}
function removeCategory(idx) {
  if (categoryList.value.length > 1) {
    categoryList.value.splice(idx, 1)
    bus.emit('initStackedAreaDataChange')
  }
}

// 宽高仅在失焦/回车时更新
const localWidth = ref(attrData.value.width)
const localHeight = ref(attrData.value.height)
watch(() => attrData.value.width, (newVal) => { localWidth.value = newVal })
watch(() => attrData.value.height, (newVal) => { localHeight.value = newVal })

function onWidthInput(e) { localWidth.value = e.target.value }
function onHeightInput(e) { localHeight.value = e.target.value }
function onWidthBlur(e) {
  const newWidth = parseFloat(localWidth.value) || 420
  attrData.value.width = newWidth
  localWidth.value = newWidth
  bus.emit('stackedAreaChartWHChange', {
    id: bus.activeCompId,
    newWidth,
    newHeight: attrData.value.height
  })
}
function onHeightBlur(e) {
  const newHeight = parseFloat(localHeight.value) || 280
  attrData.value.height = newHeight
  localHeight.value = newHeight
  bus.emit('stackedAreaChartWHChange', {
    id: bus.activeCompId,
    newWidth: attrData.value.width,
    newHeight
  })
}
function enterBlurWidth(e) { e.target.blur() }
function enterBlurHeight(e) { e.target.blur() }

function solveTopic(topic) {
  if (topic && subTopics.value.findIndex(v => JSON.stringify(v) === JSON.stringify(topic)) !== -1) {
    return JSON.stringify(topic)
  } else {
    return null
  }
}
watch(attrData, (newVal) => {
  solveTopic(newVal.topic)
  selectTopic.value = solveTopic(newVal.topic)
}, { deep: true })
onBeforeMount(() => {
  solveTopic(attrData.value.topic)
  selectTopic.value = solveTopic(attrData.value.topic)
})
</script>

<style lang="scss" scoped>
.component-props {
  padding: 16px 12px 16px 0 !important;
  min-width: 240px;
  .component-props__title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 2px;
    span {
      margin-left: 10px;
      color: #aaa;
    }
  }
  :deep(.ant-form-item) {
    margin-bottom: 16px;
  }
  .category-list {
    min-height: 42px;
    .category-row {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      .cat-index {
        display: inline-block;
        width: 18px;
        color: #555;
        font-size: 15px;
        text-align: right;
        margin-right: 6px;
      }
      .cat-input {
        width: 120px;
        margin-right: 4px;
      }
      .cat-remove-btn {
        margin-left: 4px;
      }
    }
    .cat-add-btn {
      display: block;
      margin-left: 24px;
      border: 1px dashed #d9d9d9;
      background: #fafafa;
      width: 40px;
      height: 32px;
      border-radius: 6px;
      font-size: 15px;
      transition: border 0.2s;
      &:hover {
        border: 1px solid #1890ff;
        background: #e6f7ff;
      }
    }
  }
}
</style>