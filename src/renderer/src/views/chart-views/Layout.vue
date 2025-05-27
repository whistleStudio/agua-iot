<template>
  <a-layout-sider width="260" class="visual-editor__sider visual-editor__sider--right">
    <div class="visual-editor__settings-title">布局设置</div>
    <div class="visual-editor__settings-group">
      <span>当前布局</span>
      <a-input-group compact class="visual-editor__settings-layout">
        <a-input style="width: 60px;" value="1920" disabled addon-before="W" />
        <a-input style="width: 60px;" value="1080" disabled addon-before="H" />
      </a-input-group>
    </div>
    <div class="visual-editor__settings-title">项目设置</div>
    <div class="visual-editor__settings-group">
      <div>主题</div>
      <a-radio-group value="light" class="visual-editor__settings-radio">
        <a-radio value="light">浅色</a-radio>
        <a-radio value="dark">深色</a-radio>
      </a-radio-group>
    </div>
    <div class="visual-editor__settings-group">
      <div>封面</div>
      <a-radio-group value="auto" class="visual-editor__settings-radio">
        <a-radio value="auto">自动生成</a-radio>
        <a-radio value="upload">本地上传</a-radio>
      </a-radio-group>
      <div class="visual-editor__cover-box"></div>
    </div>
  </a-layout-sider>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.visual-editor__sider--right {
  border-left: 1px solid #ededed;
  border-right: none;
  padding: 24px 16px;
  min-width: 240px;
  max-width: 280px;
  background: #fafafa;
}

.visual-editor__settings-title {
  font-weight: bold;
  margin-bottom: 16px;
  font-size: 15px;
}

.visual-editor__settings-group {
  margin-bottom: 20px;
}

.visual-editor__settings-layout {
  margin-left: 8px;
}

.visual-editor__settings-radio {
  margin-top: 8px;
}

.visual-editor__cover-box {
  margin-top: 10px;
  width: 120px;
  height: 120px;
  border: 1px dashed #e5e5e5;
  background: #fcfcfc;
  border-radius: 4px;
}
</style>
