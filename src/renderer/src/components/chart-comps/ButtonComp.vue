<template>
  <div class="comp" :style="compStyle">
    <div class="comp__label" :style="{color: layoutSettings.swatch.compFontColor}">{{ props.compProps.title }}</div>
    <a-button :style="btnStyle" type="primary" @mousedown.stop="bus.pubTopicData(props.compProps, props.compProps.payload)">{{ props.compProps.btnText }}</a-button>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
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

const whSize = computed(() => {
  switch (props.compProps.size) {
    case 'small': return { minWidth: '80px', height: '80px', padding: '3px' };
    case 'large': return { minWidth: '120px', height: '120px', padding: '20px' };
    default: return { minWidth: '100px', height: '100px', padding: '12px' };
  }
});

const compStyle = computed(() => ({
  minWidth: whSize.value.minWidth,
  height: whSize.value.height,
  padding: whSize.value.padding,
  background: props.compProps.hideBg
    ? 'rgba(255, 255, 255, 0.01)'
    : layoutSettings.value.swatch.compBgColor,
}));

const btnStyle = computed(() => ({
  height: `calc(${whSize.value.height} / 2.5)` || '40px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: layoutSettings.value.swatch.primaryColor
}));
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
</style>