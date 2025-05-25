<template>
  <div class="component-props">
    <div class="component-props__title">组件属性 <span>输入框</span></div>
    <a-divider style="margin: 8px 0 16px 0" />

    <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" layout="horizontal">
      <a-form-item label="组件标题">
        <a-input v-model:value="propsData.title" placeholder="输入框" />
      </a-form-item>
      <a-form-item label="Topic">
        <a-select v-model:value="propsData.topic" placeholder="请选择">
          <a-select-option value="topic1">topic1</a-select-option>
          <a-select-option value="topic2">topic2</a-select-option>
        </a-select>
      </a-form-item>
      <!-- <a-divider style="margin: 16px 0" /> -->
      <a-form-item label="组件大小">
        <a-select v-model:value="propsData.size" placeholder="请选择">
          <a-select-option value="small">小</a-select-option>
          <a-select-option value="medium">中</a-select-option>
          <a-select-option value="large">大</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="隐藏底色">
        <a-checkbox v-model:checked="propsData.hideBg" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

// props: modelValue 双向绑定外部组件数据
const props = defineProps({
  modelValue: {
    type: Object,
    required: false,
    default: () => ({})
  }
})
const emit = defineEmits(['update:compValue'])

const propsData = reactive({
  title: props.modelValue.title || '',
  topic: props.modelValue.topic || '',
  hideBg: props.modelValue.hideBg || false,
  type: props.modelValue.type || '',
  size: props.modelValue.size || 'medium'
})

// 双向同步外部数据
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      propsData.title = val.title || ''
      propsData.topic = val.topic || ''
      propsData.hideBg = val.hideBg || false
      propsData.type = val.type || ''
      propsData.size = val.size || 'medium'
    }
  },
  { immediate: true, deep: true }
)

watch(
  propsData,
  (val) => {
    emit('update:modelValue', { ...val })
  },
  { deep: true }
)
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