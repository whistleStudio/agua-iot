<template>
  <div class="component-props">
    <div class="component-props__title">组件属性 <span>输入框</span></div>
    <a-divider style="margin: 8px 0 16px 0" />

    <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" layout="horizontal">
      <a-form-item label="组件标题">
        <a-input v-model:value="attrData.title" placeholder="输入框" />
      </a-form-item>
      <a-form-item label="Topic">
        <a-select v-model:value="selectTopic" placeholder="请选择发布主题" :options="opts" @change="v => {console.log(v); attrData.topic = JSON.parse(v)}"></a-select>
      </a-form-item>
      <!-- <a-divider style="margin: 16px 0" /> -->
      <a-form-item label="组件大小">
        <a-select v-model:value="attrData.size" placeholder="请选择" :options="bus.sizeOpts" @change="v => attrData.size = v"></a-select>
      </a-form-item>
      <a-form-item label="隐藏底色">
        <a-checkbox v-model:checked="attrData.hideBg" />
      </a-form-item>
    </a-form>

    <div class="tips">
      <div class="tips-title">组件功能</div>
      <div class="tips-desc">
        点击发送按钮，将输入框内容发布到指定主题。<br>
      </div>
    </div>
    <div class="tips">
      <div class="tips-title">发布数据</div>
      <div class="tips-desc">
        示例：喵~<br>
        说明：文本
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, computed, ref, onBeforeMount, watch } from 'vue'
import bus from '../../utils/bus'

const activeCompProps = inject('activeCompProps')
// 直接用computed对象实现表单与画布props的双向绑定
const attrData = computed({
  get: () => activeCompProps.get(),
  set: (val) => {activeCompProps.set(val)}
})

const pubTopics = computed(() => (bus.activeProjIdx !== -1 && bus.activeProjIdx !== undefined) ? bus.projList[bus.activeProjIdx].pubTopics : [])

const selectTopic = ref()

const opts = computed(() => pubTopics.value.map(v => {
  return {
    label: bus.projList[bus.activeProjIdx].mode === "remote" ? `${v.topic}${'\u00A0'.repeat(Math.max(0, 25 - v.topic.length))} qos:${v.qos} retain:${v.retain}` : v.topic,
    value: JSON.stringify(v)
  }
}))

// 处理主题
function solveTopic(topic) {
  if (topic && pubTopics.value.findIndex(v => JSON.stringify(v) === JSON.stringify(topic)) !== -1) {
    return JSON.stringify(topic)
  } else {
    return null
  }
}

/* -------------------------------- */
watch(attrData, (newVal) => {
  solveTopic(newVal.topic)
  selectTopic.value = solveTopic(newVal.topic)
}, { deep: true })


/* ------------------------------- */
onBeforeMount(() => {
  solveTopic(attrData.value.topic)
  selectTopic.value = solveTopic(attrData.value.topic)
})

</script>

<style lang="scss" scoped>
.component-props {
  padding: 16px 12px 16px 0;
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