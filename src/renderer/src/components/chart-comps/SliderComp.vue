<template>
  <div class="comp" style="height: 100px; background-color: #ff0;">
    <div class="comp__label">{{ props.compProps.title }}</div>
    <div @mousedown.stop style="height: 50px; background-color: #0f0; display: flex; align-items: center; justify-content: center;">
      <a-slider @mousedown.stop 
      v-model:value="sliderVal" :min="props.compProps.min" :max="props.compProps.max" style="width: 200px; height: 20px; background: #000; vertical-align: middle;"/>
    </div>

  </div>
</template>


<script setup>
import { computed, ref } from 'vue';
import bus from '../../utils/bus';

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

const sliderVal = ref(props.compProps.min || 0);

const whSize = computed(() => {
  switch (props.compProps.size) {
    case 'small':
      return { minWidth: '80px', height: '80px', padding: '3px' };
    case 'large':
      return { minWidth: '120px', height: '120px', padding: '20px' };
    default:
      return { minWidth: '100px', height: '100px', padding: '12px' };  
  }
});

const compStyle = computed(() => ({
  minWidth: whSize.value.width,
  height: whSize.value.height,
  padding: whSize.value.padding,
  background: props.compProps.hideBg ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 1)',
}));

const btnStyle = computed(() => ({
  height: `calc(${whSize.value.height} / 2.5)` || '40px',
  display: 'flex',
  alignItems: 'center',
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
