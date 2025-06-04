<template>
  <div class="comp" :style="compStyle">
    <div class="comp__label">{{ props.compProps.title }}</div>
    <div @mousedown.stop class="slider-box" :style="sliderBoxStyle">
      <a-input-number class="slider-box-num" :style="sliderNumStyle" 
      v-model:value="sliderVal" :min="props.compProps.min" :max="props.compProps.max" />
      <a-slider @mousedown.stop class="slider-box-slider" :style="sliderStyle" :vertical="props.compProps.vertical"
      v-model:value="sliderVal" :min="props.compProps.min" :max="props.compProps.max" :step="props.compProps.step"
      @afterChange="bus.pubTopicData(props.compProps, sliderVal.toString())"/>
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
  if (props.compProps.vertical) {
    switch (props.compProps.size) {
      case 'small':
        return { width: '100px', height: '180px', padding: '12px' };
      case 'large':
        return { width: '100px', height: '400px', padding: '12px' };
      default:
        return { width: '100px', height: '265px', padding: '12px' };  
    }
  } else {
    switch (props.compProps.size) {
      case 'small':
        return { width: '180px', height: '100px', padding: '12px' };
      case 'large':
        return { width: '400px', height: '100px', padding: '12px' };
      default:
        return { width: '265px', height: '100px', padding: '12px' };  
    }
  }
});

const compStyle = computed(() => ({
  width: whSize.value.width,
  height: whSize.value.height,
  padding: whSize.value.padding,
  background: props.compProps.hideBg ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 1)',
}));

const sliderBoxStyle = computed(() => {
  if (props.compProps.vertical) {
    return { height: '100%', width: '30px', flexDirection: 'column' };
  } else {

  }
});

const sliderNumStyle = computed(() => {
  if (props.compProps.size === 'small') {
    return { display: 'none' };
  } else if (props.compProps.vertical) {
    return { width: '60px', height: "30px", marginBottom: '10px',  marginRight: 0 };
  }
});

const sliderStyle = computed(() => {
  if (props.compProps.vertical) {
    return { width: '100%', height: 'calc(100% - 30px)', marginLeft: '30px', boxSizing: 'border-box' }; 
  } else if (props.compProps.size === 'small') {
    return { width: '100%' };
  }
});

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


</style>
