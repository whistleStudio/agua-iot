<template>
  <div>
    <a-modal :open="open" :title="title" @ok="emit('ok', newProj)" @cancel="emit('cancel')">
      名称： <a-input v-model:value="newProj.name" placeholder="Basic usage" />
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
  content: {
    type: String,
    default: 'Default Content'
  },
  open: {
    type: Boolean,
    default: false
  }
});

</script>