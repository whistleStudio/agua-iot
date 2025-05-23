<template>
  <div class="comp">
    <div class="comp__label">按钮</div>
    <a-button type="primary">按钮</a-button>
  </div>
</template>


<script setup>

</script>


<style scoped lang="scss">
.comp {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 0 8px rgba(0,0,0,0.03);
  min-width: 100px;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.comp__label {
  text-align: center;
  font-size: 18px;
  color: #42506b;
  font-weight: 500;
  margin-bottom: 12px;
  letter-spacing: 2px;
}

</style>
