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
          v-model:value.number="attrData.width"
          placeholder="300"
          @pressEnter="enterBlur"
          @blur="bus.emit('subCommonTextWHChange', {id: bus.activeCompId, newWidth:attrData.width, newHeight:attrData.height})"
        />
      </a-form-item>
      <a-form-item label="组件高度">
        <a-input
          v-model:value.number="attrData.height"
          placeholder="60"
          @pressEnter="enterBlur"
          @blur="bus.emit('subCommonTextWHChange', {id: bus.activeCompId, newWidth:attrData.width, newHeight:attrData.height})"
        />
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