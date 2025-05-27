<template>
  <div class="component-props">
    <div class="component-props__title">组件属性 <span>输入框</span></div>
    <a-divider style="margin: 8px 0 16px 0" />

    <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" layout="horizontal">
      <a-form-item label="组件标题">
        <a-input v-model:value="attrData.title" placeholder="输入框" />
      </a-form-item>
      <a-form-item label="Topic">
        <a-select v-model:value="selectTopic" placeholder="请选择发布主题" :options="opts" @change="v => {console.log(v); attrData.topic = JSON.parse(v)}">
          <!-- <a-select-option v-for="v in pubTopics" :value="v" class="topic-opt">{{ v.topic }}</a-select-option> -->
        </a-select>
      </a-form-item>
      <!-- <a-divider style="margin: 16px 0" /> -->
      <a-form-item label="组件大小">
        <a-select v-model:value="attrData.size" placeholder="请选择">
          <a-select-option value="small">小</a-select-option>
          <a-select-option value="medium">中</a-select-option>
          <a-select-option value="large">大</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="隐藏底色">
        <a-checkbox v-model:checked="attrData.hideBg" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { inject, computed, ref, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import bus from '../../utils/bus'

const activeCompProps = inject('activeCompProps')
// 直接用computed对象实现表单与画布props的双向绑定
const attrData = computed({
  get: () => activeCompProps.get(),
  set: (val) => {activeCompProps.set(val)}
})

const pubTopics = computed(() => (bus.activeProjIdx !== -1 && bus.activeProjIdx !== undefined) ? bus.projList[bus.activeProjIdx].pubTopics : [])
// const selectTopic = computed(() => {
//   return pubTopics.value.find(v => v.topic === attrData.value.topic)
// })

const selectTopic = ref()

const opts = computed(() => pubTopics.value.map(v => {
  return {
    label: `${v.topic}${'\u00A0'.repeat(Math.max(0, 25 - v.topic.length))} qos:${v.qos} retain:${v.retain}`,
    value: JSON.stringify(v)
  }
}))

/* ------------------------------- */
onBeforeMount(() => {
  console.log('PubTextComp onBeforeMount:', attrData.value.topic)
  const avtJson = JSON.stringify(attrData.value.topic) 
  if (attrData.value?.topic?.topic && pubTopics.value.findIndex(v => JSON.stringify(v)===avtJson) !== -1) {
    selectTopic.value = avtJson
  } else {
    selectTopic.value = null
  }
})

</script>

<style lang="scss" scoped>
.component-props {
  padding: 16px 12px 0 12px;
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