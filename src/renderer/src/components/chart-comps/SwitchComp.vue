<template>
  <div class="comp" :style="compStyle">
    <div class="comp__label" :style="{color: layoutSettings.swatch.compFontColor}">{{ props.compProps.title }}</div>
    <a-switch v-model:checked="checked" @mousedown.stop @change="switchChange"
      :checked-children="props.compProps.onText"
      :un-checked-children="props.compProps.offText"
      :style="{ color: layoutSettings.swatch.compFontColor, backgroundColor: layoutSettings.swatch.primaryColor }"
    />
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

const checked = ref(true);

const whSize = computed(() => {
  switch (props.compProps.size) {
    case 'small': return { minWidth: '80px', height: '80px', padding: '7px' };
    case 'large': return { minWidth: '120px', height: '120px', padding: '25px' };
    default: return { minWidth: '100px', height: '100px', padding: '16px' };
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

function switchChange(checked) {
  bus.pubTopicData(props.compProps, checked ? props.compProps.onPayload : props.compProps.offPayload);
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
</style>