<template>
  <div class="input-comp" @click="emit(compClick, 'pubtext')">
    <div class="input-comp__label">{{ props.compProps.title }}</div>
    <div class="input-comp__box">
      <a-input v-model:value="inputValue" class="input-comp__input" :placeholder="props.compProps.placeholder" :style="inputStyle"/>
      <a-button type="primary" class="input-comp__send-btn" :style="btnStyle" >
        <template #icon>
          <img src="../../assets/img/pub.svg" :style="iconStyle" />
        </template>
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive, inject } from 'vue';

const inputValue = ref('');

const props = defineProps({
  compProps: {
    type: Object,
    required: false,
    default: () => ({})
  }
})

const inputStyle = computed(() => ({
  width: typeof props.compProps.width === 'number' ? (props.compProps.width - 45) + 'px'  : `calc(${props.compProps.width} - 45px)`,
  height: typeof props.compProps.height === 'number'  ? props.compProps.height + 'px'  : props.compProps.height,
  borderRadius: '8px 0 0 8px',
  fontSize: '14px'
}));
const btnStyle = computed(() => ({
  width: props.compProps.height + 'px',
  height: typeof props.compProps.height === 'number'  ? props.compProps.height + 'px'  : props.compProps.height,
  borderRadius: '0 8px 8px 0',
}));
const iconStyle = computed(() => ({
  width: props.compProps.height / 2 + 'px',
  textAlign: 'center',
}));


</script>

<style scoped>
.input-comp {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 0 8px rgba(0,0,0,0.03);
  min-width: 240px;
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
  max-width: 270px;
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
  background: #238aff;
  border: none;
}
.input-comp__send-btn:hover {
  background: #156fd1;
}
.input-comp__send-btn img {
  display: block;
  margin: 0 auto;
}
</style>