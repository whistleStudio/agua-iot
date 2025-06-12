<template>
  <div class="component-props">
    <div class="component-props__title">组件属性 <span>普通文本显示</span></div>
    <a-divider style="margin: 8px 0 16px 0" />
    <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" layout="horizontal">
      <a-form-item label="组件标题">
        <a-input v-model:value="attrData.title" placeholder="普通文本显示" />
      </a-form-item>
      <a-form-item label="Topic">
        <a-select
          v-model:value="selectTopic"
          placeholder="请选择订阅主题"
          :options="opts"
          @change="v => { attrData.topic = JSON.parse(v) }"
        />
      </a-form-item>
      <a-form-item label="组件宽度">
        <a-input
          placeholder="300"
          type="number"
          :value="localWidth"
          @input="onWidthInput"
          @pressEnter="enterBlurWidth"
          @blur="onWidthBlur"
        />
      </a-form-item>
      <a-form-item label="组件高度">
        <a-input
          placeholder="60"
          type="number"
          :value="localHeight"
          @input="onHeightInput"
          @pressEnter="enterBlurHeight"
          @blur="onHeightBlur"
        />
      </a-form-item>
      <a-form-item label="显示类型">
        <a-radio-group v-model:value="attrData.inputType">
          <a-radio value="singleLine">单行</a-radio>
          <a-radio value="multiLine">多行</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="隐藏底色">
        <a-checkbox v-model:checked="attrData.hideBg" />
      </a-form-item>
    </a-form>
    <div class="tips">
      <div class="tips-title">组件功能</div>
      <div class="tips-desc">
        实时显示订阅主题下最新收到的内容。<br>
        超出长度部分将以“...”显示。
      </div>
    </div>
    <div class="tips">
      <div class="tips-title">订阅数据</div>
      <div class="tips-desc">
        示例：任意文本内容<br>
        说明：显示收到的原始内容
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

/** 只在失焦或回车时更新 width 和 height */
const localWidth = ref(attrData.value.width)
const localHeight = ref(attrData.value.height)

watch(() => attrData.value.width, (newVal) => {
  localWidth.value = newVal
})
watch(() => attrData.value.height, (newVal) => {
  localHeight.value = newVal
})

function onWidthInput(e) {
  localWidth.value = e.target.value
}
function onHeightInput(e) {
  localHeight.value = e.target.value
}
function onWidthBlur(e) {
  const newWidth = parseFloat(localWidth.value) || 300
  attrData.value.width = newWidth
  localWidth.value = newWidth
  bus.emit('subCommonTextWHChange', {
    id: bus.activeCompId,
    newWidth,
    newHeight: attrData.value.height
  })
}
function onHeightBlur(e) {
  const newHeight = parseFloat(localHeight.value) || 60
  attrData.value.height = newHeight
  localHeight.value = newHeight
  bus.emit('subCommonTextWHChange', {
    id: bus.activeCompId,
    newWidth: attrData.value.width,
    newHeight
  })
}
function enterBlurWidth(e) {
  e.target.blur()
}
function enterBlurHeight(e) {
  e.target.blur()
}

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
  // 若没有 inputType，兼容老数据，默认设为 singleLine
  if (!newVal.inputType) attrData.value.inputType = "singleLine"
}, { deep: true })

onBeforeMount(() => {
  solveTopic(attrData.value.topic)
  selectTopic.value = solveTopic(attrData.value.topic)
  if (!attrData.value.inputType) attrData.value.inputType = "singleLine"
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