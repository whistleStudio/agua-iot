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
      <div class="visual-editor__cover-box" @click="chooseCover" :style="coverBoxStyle">
        <span class="visual-editor__cover-placeholder">{{ layoutSettings.bgUrl ? "" : "暂无背景" }}</span>
      </div>
    </div>
  </a-layout-sider>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue';
import bus from '../../utils/bus';

const activeLayoutSettings = inject('activeLayoutSettings');
const layoutSettings = computed({
  get: () => activeLayoutSettings.get(),
  set: (val) => { activeLayoutSettings.set(val); }
});

const coverBoxStyle = computed(() => {
  return {
    backgroundImage: layoutSettings.value.bgUrl ? `url(${layoutSettings.value.bgUrl})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: layoutSettings.value.background === 'upload' ? 1 : 0.3,
  };
})

const themeOpts = ref([
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' }
]);
const bgOpts = ref([
  { label: '无', value: 'default' },
  { label: '本地上传', value: 'upload' }
]);

function chooseCover() {
  console.log('选择封面按钮被点击');
  // 触发封面选择逻辑
  window.electron.ipcRenderer.invoke('r:chooseCover', bus.projList[bus.activeProjIdx].id)
    .then((res) => {
      if (res && res.destPath) {
        res.destPath = res.destPath.replace(/\\/g, '/'); // 替换反斜杠为正斜杠
        // console.log('选择的封面路径:', res.destPath);
        layoutSettings.value.bgUrl = res.destPath; // 更新布局设置中的封面路径
      }
    })
    .catch((err) => {
      console.error('选择封面失败:', err);
    });
}

/* --------------------- */
// 监听主题变化
watch(() => layoutSettings.value.theme, (newTheme) => {
  switch (newTheme) {
    case 'dark':
      layoutSettings.value.swatch = {
        compBgColor: "rgb(55, 55, 55)",
        compFontColor: "rgb(255, 255, 255)",
        compPhColor: "rgb(255, 255, 255, 0.5)",
        primaryColor: "rgb(103, 161, 206)"
      }
      break;
    default:
      layoutSettings.value.swatch = {
        compBgColor: "rgb(255, 255, 255)",
        compFontColor: "rgb(66, 80, 107)",
        compPhColor: "rgb(66, 80, 107, 0.5)",
        primaryColor: "rgb(35, 138, 255)"
      }
  }
});

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
  cursor: pointer;
  .visual-editor__cover-placeholder {
    color: #bbb;
    font-size: 13px;
    z-index: 2;
  }
}
</style>