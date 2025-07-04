<template>
  <div class="component-props">
    <div class="component-props__title">组件属性 <span>水波图</span></div>
    <a-divider style="margin: 8px 0 16px 0" />

    <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" layout="horizontal">
      <a-form-item label="组件标题">
        <a-input v-model:value="attrData.title" placeholder="水波图" />
      </a-form-item>
      <a-form-item label="Topic">
        <a-select v-model:value="selectTopic" placeholder="请选择订阅主题" :options="opts" @change="v => { attrData.topic = JSON.parse(v) }"></a-select>
      </a-form-item>
      <a-form-item label="组件宽度">
        <a-input
          placeholder="240"
          type="number"
          :value="localWidth"
          @input="onWidthInput"
          @pressEnter="enterBlurWidth"
          @blur="onWidthBlur"
        />
      </a-form-item>
      <a-form-item label="组件高度">
        <a-input
          placeholder="240"
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
      <a-form-item label="主配色" v-if="attrData.colorMain">
        <div style="display: flex; align-items: center;">
          <input
            type="color"
            v-model="attrData.colorMain"
            style="width: 40px; height: 32px; border: none; background: none; padding: 0;"
          />
          <span style="line-height: 32px; font-size: 14px; margin-left: 8px;">{{ attrData.colorMain }}</span>
        </div>
      </a-form-item>
      <a-form-item label="总量">
        <a-input v-model:value.number="attrData.total" placeholder="100" />
      </a-form-item>
    </a-form>

    <div class="tips">
      <div class="tips-title">组件功能</div>
      <div class="tips-desc">
        实时获取每次接收到的数值，与总量对比显示进度百分比（0~100%）。
      </div>
    </div>
    <div class="tips">
      <div class="tips-title">订阅数据</div>
      <div class="tips-desc">
        每收到一条订阅消息，内容为本次数值（如 23），显示为 23/总量 的百分比
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

const localWidth = ref(attrData.value.width)
const localHeight = ref(attrData.value.height)
watch(() => attrData.value.width, (newVal) => { localWidth.value = newVal })
watch(() => attrData.value.height, (newVal) => { localHeight.value = newVal })

function onWidthInput(e) { localWidth.value = e.target.value }
function onHeightInput(e) { localHeight.value = e.target.value }
function onWidthBlur(e) {
  const newWidth = parseFloat(localWidth.value) || 240
  attrData.value.width = newWidth
  localWidth.value = newWidth
  bus.emit('liquidfillChartWHChange', {
    id: bus.activeCompId,
    newWidth,
    newHeight: attrData.value.height
  })
}
function onHeightBlur(e) {
  const newHeight = parseFloat(localHeight.value) || 240
  attrData.value.height = newHeight
  localHeight.value = newHeight
  bus.emit('liquidfillChartWHChange', {
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
}
</style>