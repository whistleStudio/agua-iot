<template>
  <div class="comp" :style="compStyle">
    <div class="comp__label">{{ props.compProps.title }}</div>
    <div class="comp__checkbox-group">
      <a-checkbox-group
        v-model:value="selectedValues"
        style="width: 100%"
        @mousedown.stop
      >
        <a-checkbox
          v-for="(item, idx) in props.compProps.options"
          :key="idx"
          :value="item.value"
        >
          {{ item.label }}
        </a-checkbox>
      </a-checkbox-group>
      <a-button type="primary" style="margin-top: 12px; width: 100%;" @mousedown.stop="onSend" :disabled="!selectedValues.length">
        发送
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
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
  }
})

const selectedValues = ref([])

watch(
  () => props.compProps.options,
  (opts) => {
    if (!opts?.length) {
      selectedValues.value = []
    } else {
      // 移除已不在 options 中的值
      selectedValues.value = selectedValues.value.filter(v => opts.find(opt => opt.value === v))
    }
  },
  { immediate: true, deep: true }
)

const whSize = computed(() => {
  switch (props.compProps.size) {
    case 'small':
      return { minWidth: '90px', height: '120px', padding: '5px' }
    case 'large':
      return { minWidth: '120px', height: '145px', padding: '18px' }
    default:
      return { minWidth: '100px', height: '135px', padding: '12px' }
  }
})

const compStyle = computed(() => ({
  minWidth: whSize.value.minWidth,
  height: whSize.value.height,
  padding: whSize.value.padding,
  background: props.compProps.hideBg ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 1)',
  width: '100%'
}))

function onSend() {
  // 发送所有被选中项的value用_拼接后的字符串
  bus.pubTopicData(
    props.compProps,
    selectedValues.value.join('_')
  )
  console.log('发送数据:',  selectedValues.value.join('_'))
}
</script>

<style scoped lang="scss">
.comp {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(0,0,0,0.03);
  min-width: 80px;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.comp__label {
  text-align: center;
  font-size: 16px;
  color: #42506b;
  font-weight: 500;
  margin-bottom: 12px;
  letter-spacing: 2px;
}
.comp__checkbox-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>