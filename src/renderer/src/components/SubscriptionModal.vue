<template>
  <a-modal
    :open="Boolean(open)"
    :title="subModalTitle"
    @ok="handleOk"
    @cancel="emit('cancel')"
    width="540px"
    class="subscription-modal"
    :okText="'确定'"
    :cancelText="'取消'"
  >
    <a-form :model="newSub" :rules="rules" ref="subscriptionForm" layout="vertical">
      <!-- Topic -->
      <a-form-item label="主题" name="topic" required :rules="[{ required: true, message: 'Please input topic!' }]">
        <a-input v-model:value.trim="newSub.topic" placeholder="Enter topic" suffix-icon="info-circle" />
      </a-form-item>

      <!-- QoS & Color -->
      <div class="row-flex">
        <a-form-item v-if="mode === 'remote'" label="QoS" name="qos" required :rules="[{ required: true, message: 'Please select QoS!' }]" class="qos-item">
          <a-select v-model:value="newSub.qos">
            <a-select-option :value="0">0 At most once</a-select-option>
            <a-select-option :value="1">1 At least once</a-select-option>
            <a-select-option :value="2">2 Exactly once</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="颜色" name="color" class="color-item">
          <div class="color-inline-group">
            <a-input v-model:value.trim="newSub.color" class="color-input">
              <template #suffix><span @click="randomColor" style="cursor: pointer;">🎲</span></template>
            </a-input>
            <input type="color" v-model="newSub.color" class="color-picker" aria-label="Pick color" />
          </div>
        </a-form-item>
      </div>

      <!-- Alias -->
      <a-form-item label="备注" name="alias" :extra="aliasHint">
        <a-input v-model:value="newSub.alias" placeholder="请输入备注信息" suffix-icon="info-circle" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const emit = defineEmits(['ok', 'cancel'])
const props = defineProps({
  open: { // 0关，1新建，2编辑
    type: Number,
    default: 0
  },
  passform: {
    type: Object,
    default: null
  },
  subModalTitle: {
    type: String,
    default: '创建/编辑订阅主题'
  },
  mode: {
    type: String,
    default: 'local' // create or edit
  }
})

const newSub = ref({
  topic: 'customtopic/#', // topic字段为唯一值
  qos: 0,
  color: '#97CE54',
  alias: ''
})

const rules = {
  topic: [
    { required: true, message: 'Please input topic!', trigger: 'blur' }
  ],
  qos: [
    { required: true, message: 'Please select QoS!', trigger: 'change' }
  ]
}

const aliasHint = ' '

function randomColor() {
  newSub.value.color = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0').toUpperCase()
}

// 弹窗打开时初始化
watch(
  () => props.open,
  (newVal) => {
    if (newVal === 1) {
      // 新建订阅
      newSub.value = {
        topic: 'customtopic/#',
        qos: 0,
        color: '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0').toUpperCase(),
        alias: ''
      }
    }
    if (newVal === 2 && props.passform) {
      // 编辑订阅，初始化表单为当前主题属性
      // 防止 passform 缺字段
      newSub.value = {
        topic: props.passform.topic ?? '',
        qos: typeof props.passform.qos === 'number' ? props.passform.qos : 0,
        color: props.passform.color ?? '#97CE54',
        alias: props.passform.alias ?? ''
      }
    }
  },
  { immediate: true }
)

function handleOk() {
  emit('ok', { ...newSub.value })
}
</script>

<style lang="scss" scoped>
.subscription-modal {
  .ant-modal-content {
    border-radius: 10px;
  }
  .ant-modal-header {
    border-radius: 10px 10px 0 0;
  }
}

.row-flex {
  display: flex;
  gap: 16px;
}

.qos-item, .color-item {
  flex: 2;
}

.color-inline-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-input {
  width: calc(100% - 88px);
  min-width: 80px;
}

.color-picker {
  width: 36px;
  height: 32px;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  // 垂直对齐
  vertical-align: middle;
  appearance: none;
  border-radius: 5px;
  box-shadow: 0 0 0 1px #d9d9d9 inset;
}

.color-refresh {
  width: 40px;
  min-width: 40px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-footer {
  text-align: right;
  .footer-cancel {
    margin-right: 8px;
  }
  .footer-confirm {
    color: #38cfa7;
    border: none;
    background: none;
    &:hover, &:focus {
      color: #33b895;
      background: none;
      border: none;
    }
  }
}
</style>