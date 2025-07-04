<template>
  <div class="component-props" v-if="attrData.labelColor">
    <div class="component-props__title">组件属性 <span>标签文本显示</span></div>
    <a-divider style="margin: 8px 0 16px 0" />

    <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" layout="horizontal">
      <a-form-item label="组件标题">
        <a-input v-model:value="attrData.title" placeholder="标签文本显示" />
      </a-form-item>
      <a-form-item label="Topic">
        <a-select v-model:value="selectTopic" placeholder="请选择订阅主题" :options="opts"
                  @change="v => { attrData.topic = JSON.parse(v) }"></a-select>
      </a-form-item>
      <a-form-item label="组件宽度">
        <a-input
          placeholder="180"
          type="number"
          :value="localWidth"
          @input="onWidthInput"
          @pressEnter="enterBlurWidth"
          @blur="onWidthBlur"
        />
      </a-form-item>
      <a-form-item label="组件高度">
        <a-input
          placeholder="120"
          type="number"
          :value="localHeight"
          @input="onHeightInput"
          @pressEnter="enterBlurHeight"
          @blur="onHeightBlur"
        />
      </a-form-item>
      <a-form-item label="标签描述" v-if="attrData.labelColor">
        <div style="display: flex; align-items: center;">
          <a-input v-model:value="attrData.labelText" placeholder="标签" style="flex:1"/>
          <input type="color" v-model="attrData.labelColor" style="width: 32px; height: 32px; border: none; background: none; margin-left:8px;"/>
        </div>
      </a-form-item>
      <a-form-item label="标签单位" v-if="attrData.unitColor">
        <div style="display: flex; align-items: center;">
          <a-input v-model:value="attrData.unitText" placeholder="单位" style="flex:1"/>
          <input type="color" v-model="attrData.unitColor" style="width: 32px; height: 32px; border: none; background: none; margin-left:8px;"/>
        </div>
      </a-form-item>
      <a-form-item label="隐藏底色">
        <a-checkbox v-model:checked="attrData.hideBg" />
      </a-form-item>
    </a-form>
    <div class="tips">
      <div class="tips-title">组件功能</div>
      <div class="tips-desc">
        实时显示订阅主题下最新收到的数值，并带有自定义标签描述和单位。
      </div>
    </div>
    <div class="tips">
      <div class="tips-title">订阅数据</div>
      <div class="tips-desc">
        每收到一条订阅消息，内容为本次数值（如 26.5），显示为“标签 26.5 单位”
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
  const newWidth = parseFloat(localWidth.value) || 180
  attrData.value.width = newWidth
  localWidth.value = newWidth
  bus.emit('sublabeltextWHChange', {
    id: bus.activeCompId,
    newWidth,
    newHeight: attrData.value.height
  })
}
function onHeightBlur(e) {
  const newHeight = parseFloat(localHeight.value) || 120
  attrData.value.height = newHeight
  localHeight.value = newHeight
  bus.emit('sublabeltextWHChange', {
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
}, { deep: true })
onBeforeMount(() => {
  solveTopic(attrData.value.topic)
  selectTopic.value = solveTopic(attrData.value.topic)
  // 默认色值
  if (!attrData.value.labelColor) attrData.value.labelColor = '#d2694a'
  if (!attrData.value.unitColor) attrData.value.unitColor = '#ffd590'
  if (typeof attrData.value.hideBg === "undefined") attrData.value.hideBg = false
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