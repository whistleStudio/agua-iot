<template>
  <div>
    <a-modal :open="open" :title="title" @ok="emit('ok', newProj)" @cancel="emit('cancel')"
    :okText="'确定'" :cancelText="'取消'">
      名称： <a-input v-model:value.trim="newProj.name" placeholder="Basic usage" />
    </a-modal>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const emit = defineEmits(['ok', 'cancel']);
const newProj = reactive({
  name: '',
});

defineProps({
  title: {
    type: String,
    default: '添加项目'
  },
  open: {
    type: Boolean,
    default: false
  }
});

</script>