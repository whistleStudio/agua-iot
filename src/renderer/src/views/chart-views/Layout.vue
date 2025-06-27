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
      <div class="visual-editor__cover-box"
           @click="chooseCover"
           :style="coverBoxStyle"
           @mouseenter="() => {coverHover = true; console.log('hover')}"
           @mouseleave="coverHover = false"
      >
        <span class="visual-editor__cover-placeholder">{{ layoutSettings?.bgUrl ? "" : "暂无背景" }}</span>
        <!-- ❌ 删除按钮，仅在有背景且悬浮时显示，阻止冒泡防止触发选择封面 -->
        <span
          v-if="layoutSettings?.bgUrl && coverHover"
          class="visual-editor__cover-remove"
          @click.stop="removeCover"
          title="删除背景图"
        >❌</span>
      </div>
    </div>
  </a-layout-sider>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue';
import bus from '../../utils/bus';

const activeLayoutSettings = inject('activeLayoutSettings');
const activeBgData = inject('activeBgData');
const layoutSettings = computed({
  get: () => activeLayoutSettings.get(),
  set: (val) => { activeLayoutSettings.set(val); }
});

const coverHover = ref(false);

const coverBoxStyle = computed(() => {
  return {
    backgroundImage: layoutSettings.value.bgUrl ? `url(${activeBgData.value})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: layoutSettings.value.background === 'upload' ? 1 : 0.3,
    position: 'relative'
  };
});

const themeOpts = ref([
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' }
]);
const bgOpts = ref([
  { label: '无', value: 'default' },
  { label: '本地上传', value: 'upload' }
]);

function chooseCover() {
  window.electron.ipcRenderer.invoke('r:chooseCover', bus.projList[bus.activeProjIdx].id)
    .then((res) => {
      if (res && res.destPath) {
        res.destPath = res.destPath.replace(/\\/g, '/');
        layoutSettings.value.bgUrl = res.destPath;
      }
    })
    .catch((err) => {
      console.error('选择封面失败:', err);
    });
}

// 删除背景图
function removeCover() {
  window.electron.ipcRenderer.invoke('r:removeCover', layoutSettings.value.bgUrl)
    .then(() => {
      console.log('背景图删除成功');
    })
    .catch((err) => {
      console.error('删除背景图失败:', err);
    });
  layoutSettings.value.bgUrl = '';
  // layoutSettings.value.background = 'default'; // 重置背景选项
  coverHover.value = false; // 取消悬浮状态 
}

/* --------------------------- */
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
  position: relative;
  .visual-editor__cover-placeholder {
    color: #bbb;
    font-size: 13px;
    z-index: 2;
  }
  /* 删除按钮样式 */
  .visual-editor__cover-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 16px;
    color: #fff;
    width: 20px;
    height: 20px;
    cursor: pointer;
    z-index: 10;
    opacity: 0.85;
    transition: background 0.2s;
    // &:hover {
    //   background: rgba(255,0,0,0.8);
    //   color: #fff;
    //   opacity: 1;
    // }
  }
}
</style>