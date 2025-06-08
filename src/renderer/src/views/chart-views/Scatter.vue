<template>
  <div class="component-props">
    <div class="component-props__title">组件属性 <span>散点图</span></div>
    <a-divider style="margin: 8px 0 16px 0" />
    <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" layout="horizontal">
      <a-form-item label="组件标题">
        <a-input v-model:value="attrData.title" placeholder="散点图" />
      </a-form-item>
      <a-form-item label="Topic">
        <a-select v-model:value="selectTopic" placeholder="请选择订阅主题" :options="opts" @change="v => { attrData.topic = JSON.parse(v) }"></a-select>
      </a-form-item>
      <a-form-item label="组件宽度">
        <a-input v-model:value.number="attrData.width" placeholder="450" @pressEnter="enterBlur"
        @blur="bus.emit('scatterChartWHChange', {id: bus.activeCompId, newWidth:attrData.width, newHeight:attrData.height})"/>
      </a-form-item>
      <a-form-item label="组件高度">
        <a-input v-model:value.number="attrData.height" placeholder="300" @pressEnter="enterBlur"
        @blur="bus.emit('scatterChartWHChange', {id: bus.activeCompId, newWidth:attrData.width, newHeight:attrData.height})"/>
      </a-form-item>
      <a-form-item label="散点颜色">
        <a-input v-model:value="attrData.scatterColor" placeholder="#37a2da" />
      </a-form-item>
      <a-form-item label="隐藏底色">
        <a-checkbox v-model:checked="attrData.hideBg" />
      </a-form-item>
      <a-form-item label="显示点数">
        <a-select v-model:value="attrData.count" :options="countOpts" />
      </a-form-item>
      <a-form-item label="最大点数">
        <a-input v-model:value.number="attrData.maxPoints" placeholder="100" />
      </a-form-item>
      <a-form-item label="X轴单位">
        <a-input v-model:value="attrData.xUnit" placeholder="X单位" />
      </a-form-item>
      <a-form-item label="Y轴单位">
        <a-input v-model:value="attrData.yUnit" placeholder="Y单位" />
      </a-form-item>
    </a-form>
    <div class="tips">
      <div class="tips-title">组件功能</div>
      <div class="tips-desc">
        实时获取并缓存最多{{ attrData.maxPoints }}组[x, y]数值，以散点图形式展示。<br>
        <span style="color:#888">订阅数据格式：数值,数值（如：23.5,48.1）</span>
      </div>
    </div>
    <div class="tips">
      <div class="tips-title">订阅数据</div>
      <div class="tips-desc">
        示例：23.5,48.1<br>
        说明：每条为x,y坐标
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
  label: `${v.topic}${'\u00A0'.repeat(Math.max(0, 25 - v.topic.length))} qos:${v.qos}`,
  value: JSON.stringify(v)
})))
const countOpts = [
  { label: '10', value: 10 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
]

function enterBlur(e) { e.target.blur() }

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
}
</style>