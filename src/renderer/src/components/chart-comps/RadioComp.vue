<template>
  <div class="comp" :style="compStyle">
    <div class="comp__label">{{ props.compProps.title }}</div>
    <a-radio-group
      @mousedown.stop
      v-model:value="selectedValue"
      :option-type="props.compProps.showType === 'button' ? 'button' : 'default'"
      @change="onChange"
      class="comp__radio-group"
    >
      <a-radio
        v-for="(item, idx) in props.compProps.options"
        :key="idx"
        :value="item.value"
      >
        {{ item.label }}
      </a-radio>
    </a-radio-group>
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

const selectedValue = ref('')

// 初始化默认选中
watch(
  () => props.compProps.options,
  (opts) => {
    console.log('watch options', opts)
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
    case 'small':
      return { minWidth: '80px', height: '80px', padding: '3px' }
    case 'large':
      return { minWidth: '120px', height: '120px', padding: '20px' }
    default:
      return { minWidth: '100px', height: '100px', padding: '12px' }
  }
})

const compStyle = computed(() => ({
  minWidth: whSize.value.minWidth,
  height: whSize.value.height,
  padding: whSize.value.padding,
  background: props.compProps.hideBg ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 1)',
  width: '100%'
}))

function onChange(e) {
  const val = e.target ? e.target.value : e // 兼容a-radio-group和v-model:value
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
}
</style>