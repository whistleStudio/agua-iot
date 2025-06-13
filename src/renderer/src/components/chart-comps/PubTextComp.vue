<template>
  <div class="input-comp" :style="inputCompStyle" >
    <div class="input-comp__label" :style="{color: layoutSettings.swatch.compFontColor}">{{ props.compProps.title }}</div>
    <div class="input-comp__box" @mousedown.stop>
      <a-input v-model:value="inputValue" class="input-comp__input" placeholder="请输入发布内容" :style="inputStyle"/>
      <a-button type="primary" class="input-comp__send-btn" :style="btnStyle" @mousedown.stop="bus.pubTopicData(props.compProps, inputValue)">
        <template #icon>
          <img src="../../assets/img/pub.svg" :style="iconStyle" />
        </template>
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive, inject } from 'vue';
import bus from '../../utils/bus';
import { color } from 'echarts';

const inputValue = ref('');

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

const whSize = computed(() => {
  switch (props.compProps.size) {
    case 'small':
      return { width: '180px', height: '30px' };
    case 'large':
      return { width: '300px', height: '50px' };
    default:
      return { width: '240px', height: '40px' };
  }
});
const inputCompStyle = computed(() => ({
  background: props.compProps.hideBg ? 'rgba(255, 255, 255, 0.01)' : layoutSettings.value.swatch.compBgColor,
}))

const activeLayoutSettings = inject('activeLayoutSettings');
const layoutSettings = computed({
  get: () => activeLayoutSettings.get(),
  set: (val) => { activeLayoutSettings.set(val); }
});
const inputStyle = computed(() => ({
  width:  `calc(${whSize.value.width} - ${whSize.value.height})`,
  height: whSize.value.height,
  borderRadius: '8px 0 0 8px',
  fontSize: '14px',
  background: props.compProps.hideBg ? 'rgba(255, 255, 255, 0.01)' : layoutSettings.value.swatch.compBgColor,
  '--ph-color': layoutSettings.value.swatch.compPhColor,
}));
const btnStyle = computed(() => ({
  width: whSize.value.height,
  height: whSize.value.height,
  borderRadius: '0 8px 8px 0',
  background: props.compProps.hideBg ? 'rgba(35, 138, 255, 0.2)' : 'rgba(35, 138, 255, 1)',
}));
const iconStyle = computed(() => ({
  width: `calc(${whSize.value.height} / 2)`,
  textAlign: 'center',
}));

// /* 发布数据 */
// function pubTopicData() {
//   // console.log("props.compProps.topic.topic:", props.compProps.topic.topic);
//   if (!props.compProps.topic || !props.compProps.topic.topic) { bus.emit("showCustomAlert", { type: "warning", msg: "请选择一个主题" }); return; }
//   window.electron.ipcRenderer.invoke('r:publishMqtt', {
//     ...props.compProps.topic,
//     payload: inputValue.value,
//   })
//   .then((res) => {
//     if (res.err) {
//       emit("alert", { type: "error", msg: res.msg })
//     }
//   })
// }


</script>

<style scoped>
.input-comp {
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 0 8px rgba(0,0,0,0.03);
  /* min-width: 240px; */
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.input-comp__label {
  text-align: center;
  font-size: 16px;
  color: #42506b;
  font-weight: 500;
  margin-bottom: 12px;
  letter-spacing: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.input-comp__box {
  display: flex;
  flex-direction: row;
  width: 100%;
  /* max-width: 270px; */
  align-items: center;
}
.input-comp__input {
  flex: 1 1 auto;
  border-radius: 8px 0 0 8px !important;
  border-right: none !important;
  box-shadow: 4px 8px 18px 0 rgba(36,137,202,0.09); 

}
.input-comp__send-btn {
  /* width: 45px;
  height: 30px;
  min-width: 45px; */
  /* border-radius: 0 8px 8px 0 !important; */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
}
.input-comp__send-btn:hover {
  background: #156fd1 !important;
}
.input-comp__send-btn img {
  display: block;
  margin: 0 auto;
}
input::placeholder {
  color: var(--ph-color, rgb(66, 80, 107, 0.5));
}
</style>