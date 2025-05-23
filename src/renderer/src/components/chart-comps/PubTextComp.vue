<template>
  <div class="input-comp">
    <div class="input-comp__label">输入框</div>
    <div class="input-comp__input-group">
      <a-input
        v-model:value="inputValue"
        :placeholder="placeholder"
        class="input-comp__input"
        @pressEnter="handleSend"
      />
      <a-button
        type="primary"
        class="input-comp__send-btn"
        :style="{ background: '#36b4a5', border: 'none' }"
        @click="handleSend"
      >
        <template #icon>
          <img src="../../assets/img/pub.svg" alt="" width="20" height="20" />
        </template>
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  placeholder: {
    type: String,
    default: '请输入'
  }
});

const inputValue = ref('');

function handleSend() {
  // 可扩展发送逻辑
  // 如需触发事件，可 emit("send", inputValue.value);
  inputValue.value = '';
}
</script>

<style scoped>
.input-comp {
  background: #fff;
  border-radius: 5px;
  padding: 16px 16px 12px 16px;
  box-shadow: 0 0 8px rgba(0,0,0,0.03);
  min-width: 240px;
}
.input-comp__label {
  text-align: center;
  font-size: 18px;
  color: #42506b;
  font-weight: 500;
  margin-bottom: 12px;
  letter-spacing: 2px;
}
.input-comp__input-group {
  display: flex;
  align-items: center;
}
.input-comp__input {
  flex: 1;
  border-radius: 2px 0 0 2px;
  border-right: none !important;
  background: #fff;
}
.input-comp__input :deep(.ant-input) {
  border-radius: 2px 0 0 2px;
  background: #fff;
}
.input-comp__send-btn {
  border-radius: 0 2px 2px 0 !important;
  height: 38px;
  min-width: 52px;
  font-size: 16px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-comp__send-btn :deep(.anticon) {
  vertical-align: middle;
}
</style>