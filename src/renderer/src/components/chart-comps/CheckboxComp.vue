<template>
  <div class="comp" :style="compStyle">
    <div class="comp__label" :style="{color: layoutSettings.swatch.compFontColor}">{{ props.compProps.title }}</div>
    <div class="comp__checkbox-group"
         :style="{'--primary-color': layoutSettings.swatch.primaryColor, '--comp-font-color': layoutSettings.swatch.compFontColor}">
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
          <span :style="{ color: layoutSettings.swatch.compFontColor }">{{ item.label }}</span>
        </a-checkbox>
      </a-checkbox-group>
      <a-button
        type="primary"
        style="margin-top: 12px; width: 100%;"
        @mousedown.stop="onSend"
        :disabled="!selectedValues.length"
        :style="{
          color: '#fff',
          background: layoutSettings.swatch.primaryColor,
          '--send-btn-hover': layoutSettings.swatch.primaryHoverColor || layoutSettings.swatch.primaryColor
        }"
        class="checkbox-send-btn"
      >
        发送
      </a-button>
    </div>
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

const selectedValues = ref([])

watch(
  () => props.compProps.options,
  (opts) => {
    if (!opts?.length) {
      selectedValues.value = []
    } else {
      selectedValues.value = selectedValues.value.filter(v => opts.find(opt => opt.value === v))
    }
  },
  { immediate: true, deep: true }
)

const whSize = computed(() => {
  switch (props.compProps.size) {
    case 'small': return { minWidth: '90px', height: '120px', padding: '5px' }
    case 'large': return { minWidth: '120px', height: '145px', padding: '18px' }
    default: return { minWidth: '100px', height: '135px', padding: '12px' }
  }
})

const compStyle = computed(() => ({
  minWidth: whSize.value.minWidth,
  height: whSize.value.height,
  padding: whSize.value.padding,
  background: props.compProps.hideBg
    ? 'rgba(255, 255, 255, 0.01)'
    : layoutSettings.value.swatch.compBgColor,
  width: '100%'
}))

function onSend() {
  bus.pubTopicData(
    props.compProps,
    selectedValues.value.join('_')
  )
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

  // 选中颜色
  :deep(.ant-checkbox-checked .ant-checkbox-inner) {
    background-color: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
  }
  :deep(.ant-checkbox-wrapper:hover .ant-checkbox-inner),
  :deep(.ant-checkbox:hover .ant-checkbox-inner),
  :deep(.ant-checkbox-input:focus + .ant-checkbox-inner) {
    border-color: var(--primary-color) !important;
  }
  :deep(.ant-checkbox-checked::after) {
    border-color: var(--primary-color) !important;
  }
  // 选项文字
  :deep(.ant-checkbox + span) {
    color: var(--comp-font-color) !important;
  }
}

/* 按钮 hover */
.checkbox-send-btn:hover {
  background: var(--send-btn-hover, #156fd1) !important;
}
</style>