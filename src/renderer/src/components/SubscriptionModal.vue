<template>
  <a-modal
    :open="Boolean(open)"
    :title="subModalTitle"
    @ok="handleOk"
    @cancel="onCancel"
    width="540px"
    class="subscription-modal"
    :okText="'确定'"
    :cancelText="'取消'"
  >
    <a-form :model="newSub" :rules="rules" ref="subscriptionForm" layout="vertical">
      <!-- Topic -->
      <a-form-item label="主题" name="topic" required :rules="[{ required: true, message: '主题不能为空' }]">
        <a-input v-model:value.trim="newSub.topic" placeholder="Enter topic" suffix-icon="info-circle" />
      </a-form-item>

      <!-- QoS & Color -->
      <div class="row-flex">
        <a-form-item v-if="mode === 'remote'" label="QoS" name="qos" required :rules="[{ required: true, message: '请选择qos等级' }]" class="qos-item">
          <a-select v-model:value="newSub.qos">
            <a-select-option :value="0">0 At most once</a-select-option>
            <a-select-option :value="1">1 At least once</a-select-option>
            <a-select-option :value="2">2 Exactly once</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="颜色" name="color" class="color-item">
          <div class="color-inline-group">
            <a-input v-model:value.trim="newSub.color" class="color-input">
              <template #suffix>
                <span @click="randomColor" style="cursor: pointer;">🎲</span>
              </template>
            </a-input>
            <input type="color" v-model="safeColor" class="color-picker" aria-label="Pick color" />
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
import { ref, watch, nextTick, computed } from 'vue'

const subscriptionForm = ref()
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
    default: 'local'
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
    { required: true, message: 'Please input topic!', trigger: 'blur' },
    { validator: validateTopic, trigger: 'blur' }
  ],
  qos: [
    { required: true, message: 'Please select QoS!', trigger: 'change' }
  ]
}

const aliasHint = ' '

function randomColor() {
  newSub.value.color = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0').toUpperCase()
}

// 保证type="color"绑定的值始终合法
const safeColor = computed({
  get() {
    const c = newSub.value.color
    return /^#[0-9A-Fa-f]{6}$/.test(c) ? c : '#97CE54'
  },
  set(val) {
    newSub.value.color = val
  }
})

function validateTopic(rule, value) {
  if (!value) return Promise.reject('主题不能为空')
  // 仅允许ASCII
  if (!/^[\x00-\x7F]+$/.test(value)) return Promise.reject('主题仅支持ASCII字符')
  // 不能包含\0
  if (value.includes('\0')) return Promise.reject('主题不能包含空字符（\\0）')
  return Promise.resolve()
}

// 关闭modal时，颜色为空赋随机色
watch(
  () => props.open,
  async (newVal, oldVal) => {
    if (newVal === 1) {
      newSub.value = {
        topic: 'customtopic/#',
        qos: 0,
        color: '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0').toUpperCase(),
        alias: ''
      }
    }
    if (newVal === 2 && props.passform) {
      newSub.value = {
        topic: props.passform.topic ?? '',
        qos: typeof props.passform.qos === 'number' ? props.passform.qos : 0,
        color: props.passform.color ?? '#97CE54',
        alias: props.passform.alias ?? ''
      }
    }
    await nextTick()
    subscriptionForm.value?.clearValidate?.()
    // modal关闭时，颜色为空或不合法赋随机色
    if ((oldVal === 1 || oldVal === 2) && newVal === 0) {
      if (!/^#[0-9A-Fa-f]{6}$/.test(newSub.value.color)) {
        randomColor()
      }
    }
  },
  { immediate: true }
)

function handleOk() {
  subscriptionForm.value.validate().then(() => {
    // 提交前再兜底校验颜色
    if (!/^#[0-9A-Fa-f]{6}$/.test(newSub.value.color)) randomColor()
    emit('ok', { ...newSub.value })
  })
}

function onCancel() {
  // 关闭时颜色为空或不合法也给随机色
  if (!/^#[0-9A-Fa-f]{6}$/.test(newSub.value.color)) randomColor()
  emit('cancel')
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