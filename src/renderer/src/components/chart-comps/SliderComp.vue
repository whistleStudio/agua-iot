<template>
  <div class="comp" :style="compStyle">
    <div class="comp__label" :style="{color: layoutSettings.swatch.compFontColor}">{{ props.compProps.title }}</div>
    <div
      @mousedown.stop
      class="slider-box"
      :style="Object.assign({}, sliderBoxStyle, {
        '--slider-primary': layoutSettings.swatch.primaryColor,
        '--slider-rail': layoutSettings.swatch.sliderBgColor || '#e9e9e9'
      })"
    >
      <a-input-number
        class="slider-box-num dynamic-placeholder"
        :style="sliderNumStyle"
        v-model:value="sliderVal"
        :min="props.compProps.min"
        :max="props.compProps.max"
        :placeholder="sliderPlaceholder"
      />
      <a-slider
        @mousedown.stop
        class="slider-box-slider"
        :style="sliderStyle"
        :vertical="props.compProps.vertical"
        v-model:value="sliderVal"
        :min="props.compProps.min"
        :max="props.compProps.max"
        :step="props.compProps.step"
        @afterChange="bus.pubTopicData(props.compProps, sliderVal.toString())"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, inject } from 'vue';
import bus from '../../utils/bus';

const props = defineProps({
  compProps: Object,
  compId: Number
})

const activeLayoutSettings = inject('activeLayoutSettings');
const layoutSettings = computed({
  get: () => activeLayoutSettings.get(),
  set: (val) => { activeLayoutSettings.set(val); }
});

const sliderVal = ref(props.compProps.min || 0);

const whSize = computed(() => {
  if (props.compProps.vertical) {
    switch (props.compProps.size) {
      case 'small': return { width: '100px', height: '180px', padding: '12px' };
      case 'large': return { width: '100px', height: '400px', padding: '12px' };
      default: return { width: '100px', height: '265px', padding: '12px' };
    }
  } else {
    switch (props.compProps.size) {
      case 'small': return { width: '180px', height: '100px', padding: '12px' };
      case 'large': return { width: '400px', height: '100px', padding: '12px' };
      default: return { width: '265px', height: '100px', padding: '12px' };
    }
  }
});

const compStyle = computed(() => ({
  width: whSize.value.width,
  height: whSize.value.height,
  padding: whSize.value.padding,
  background: props.compProps.hideBg
    ? 'rgba(255, 255, 255, 0.01)'
    : layoutSettings.value.swatch.compBgColor,
}));

const sliderBoxStyle = computed(() => {
  if (props.compProps.vertical) {
    return { height: '100%', width: '30px', flexDirection: 'column' };
  } else {
    return {};
  }
});

const sliderNumStyle = computed(() => {
  const style = {'--ph-color': layoutSettings.value.swatch.compPhColor, color: layoutSettings.value.swatch.compFontColor};
  if (props.compProps.size === 'small') {
    style.display = 'none';
  } else if (props.compProps.vertical) {
    Object.assign(style, { width: '60px', height: "30px", marginBottom: '10px', marginRight: 0 });
  }
  return style;
});

const sliderStyle = computed(() => {
  if (props.compProps.vertical) {
    return { width: '100%', height: 'calc(100% - 30px)', marginLeft: '30px', boxSizing: 'border-box' };
  } else if (props.compProps.size === 'small') {
    return { width: '100%' };
  }
});

const sliderPlaceholder = computed(() => props.compProps.placeholder || '请输入数值');
</script>

<style scoped lang="scss">
.comp {
  background: #fff;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(0,0,0,0.03);
  min-width: 80px;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  .slider-box {
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    .slider-box-num {
      width: 20%;
      margin-right: 10px;
    }
    .slider-box-slider {
      margin-bottom: 5px;
      width: 80%;
      height: 20px;
    }
  }
  .comp__label {
    text-align: center;
    font-size: 16px;
    color: #42506b;
    font-weight: 500;
    margin-bottom: 12px;
    letter-spacing: 2px;
  }
}
.dynamic-placeholder :deep(input::placeholder) {
  color: var(--ph-color, rgb(66, 80, 107, 0.5));
}

/* 滑块主色与滑杆底色适配主题 */
:deep(.ant-slider-track) {
  background-color: var(--slider-primary, #238aff) !important;
}
:deep(.ant-slider-handle) {
  border-color: var(--slider-primary, #238aff) !important;
  background: var(--slider-primary, #238aff) !important;
}
:deep(.ant-slider:hover .ant-slider-track) {
  background-color: var(--slider-primary, #238aff) !important;
}
:deep(.ant-slider-rail) {
  background-color: var(--slider-rail, #e9e9e9) !important;
}
</style>