<template>
  <a-layout-sider width="260" class="visual-editor__sider visual-editor__sider--right">
    <div class="visual-editor__settings-title">布局设置</div>

    <div class="visual-editor__settings-group">
      <div class="visual-editor__settings-label">主题</div>
      <a-radio-group v-model:value="layoutSettings.theme" class="visual-editor__settings-radio" :options="themeOpts">
      </a-radio-group>
    </div>
    <div class="visual-editor__settings-group">
      <div class="visual-editor__settings-label">背景图片</div>
      <a-radio-group v-model:value="layoutSettings.background" class="visual-editor__settings-radio" :options="bgOpts" >
      </a-radio-group>
      <div class="visual-editor__cover-box">
        <span class="visual-editor__cover-placeholder">暂无封面</span>
      </div>
    </div>
  </a-layout-sider>
</template>

<script setup>
import { computed, inject, ref } from 'vue';

const activeLayoutSettings = inject('activeLayoutSettings');
const layoutSettings = computed({
  get: () => activeLayoutSettings.get(),
  set: (val) => { activeLayoutSettings.set(val); }
});

const themeOpts = ref([
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' }
]);
const bgOpts = ref([
  { label: '无', value: 'default' },
  { label: '本地上传', value: 'upload' }
]);
</script>

<style lang="scss" scoped>
.visual-editor__sider--right {
  border-left: 1px solid #ededed;
  background: #fafafa;
  padding: 16px !important;
  min-width: 240px;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.visual-editor__settings-title {
  font-weight: 600;
  margin-bottom: 18px;
  font-size: 16px;
  color: #222;
}

.visual-editor__settings-group { margin-bottom: 24px; }

.visual-editor__settings-label { color: #444; font-size: 14px; }

.visual-editor__settings-radio {
  margin-top: 2px;
  display: flex;
  gap: 16px;
  .ant-radio-wrapper { font-size: 14px; }
}

.visual-editor__cover-box {
  margin-top: 8px;
  width: 140px;
  height: 100px;
  border: 1.5px dashed #e0e0e0;
  background: #fcfcfc;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  .visual-editor__cover-placeholder {
    color: #bbb;
    font-size: 13px;
  }
}
</style>