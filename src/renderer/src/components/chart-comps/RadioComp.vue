<template>
  <div class="comp" :style="compStyle">
    <div class="comp__label" :style="{color: layoutSettings.swatch.compFontColor}">{{ props.compProps.title }}</div>
    <a-radio-group
      @mousedown.stop
      v-model:value="selectedValue"
      :option-type="props.compProps.showType === 'button' ? 'button' : 'default'"
      @change="onChange"
      class="comp__radio-group"
      :style="{
        '--primary-color': layoutSettings.swatch.primaryColor,
        '--comp-font-color': layoutSettings.swatch.compFontColor,
        '--comp-bg-color': layoutSettings.swatch.compBgColor
      }"
    >
      <a-radio
        v-for="(item, idx) in props.compProps.options"
        :key="idx"
        :value="item.value"
        :style="props.compProps.showType === 'button' ? {color: layoutSettings.swatch.compFontColor} : {}"
      >
        <span v-if="props.compProps.showType !== 'button'" :style="{ color: layoutSettings.swatch.compFontColor }">{{ item.label }}</span>
        <template v-else>{{ item.label }}</template>
      </a-radio>
    </a-radio-group>
  </div>
</template>

<script setup>
import { computed, ref, watch, inject } from 'vue'
import bus from '../../utils/bus'

const props = defineProps({
  compProps: Object,
  compId: Number
})

const activeLayoutSettings = inject('activeLayoutSettings');
const layoutSettings = computed({
  get: () => activeLayoutSettings.get(),
  set: (val) => { activeLayoutSettings.set(val); }
});

const selectedValue = ref('')

watch(
  () => props.compProps.options,
  (opts) => {
    if (!opts?.length) {
      selectedValue.value = ''
    } else if (!opts.find(opt => opt.value === selectedValue.value)) {
      selectedValue.value = ''
    }
  },
  { immediate: true, deep: true }
)

const whSize = computed(() => {
  switch (props.compProps.size) {
    case 'small': return { minWidth: '80px', height: '80px', padding: '3px' }
    case 'large': return { minWidth: '120px', height: '120px', padding: '20px' }
    default: return { minWidth: '100px', height: '100px', padding: '12px' }
  }
})

const compStyle = computed(() => ({
  minWidth: whSize.value.minWidth,
  height: whSize.value.height,
  padding: whSize.value.padding,
  background: props.compProps.hideBg
    ? 'rgba(255, 255, 255, 0.01)'
    : layoutSettings.value.swatch.compBgColor,
  width: '100%',
}))

function onChange(e) {
  const val = e.target ? e.target.value : e
  selectedValue.value = val
  bus.pubTopicData(props.compProps, val)
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
.comp__radio-group {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  // 普通圆圈选中
  :deep(.ant-radio-checked .ant-radio-inner) {
    border-color: var(--primary-color) !important;
    background-color: var(--primary-color) !important;
  }
  :deep(.ant-radio-wrapper:hover .ant-radio-inner) {
    border-color: var(--primary-color) !important;
  }
  :deep(.ant-radio-checked::after) {
    border-color: var(--primary-color) !important;
  }

  // 按钮模式
  :deep(.ant-radio-button-wrapper) {
    color: var(--comp-font-color) !important;
    background: var(--comp-bg-color) !important;
    border-color: var(--primary-color) !important;
    transition: all 0.2s;
  }
  :deep(.ant-radio-button-wrapper:not(:first-child)) {
    border-left: none;
  }
  :deep(.ant-radio-button-wrapper-checked) {
    color: #fff !important;
    background: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    box-shadow: 0 2px 4px 0 rgba(35, 138, 255, 0.10);
  }
  :deep(.ant-radio-button-wrapper-checked:hover) {
    color: #fff !important;
    background: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
  }
  :deep(.ant-radio-button-wrapper:hover) {
    color: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
  }
}
</style>