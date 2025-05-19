<template>
  <a-modal
    :open="open" title="New Subscription"
    @ok="emit('ok', form)" @cancel="handleCancel"
    width="540px" class="subscription-modal"
    :okText="'确定'" :cancelText="'取消'"
  >
    <a-form
      :model="form"
      :rules="rules"
      ref="subscriptionForm"
      layout="vertical"
    >
      <!-- Topic -->
      <a-form-item
        label="Topic"
        name="topic"
        required
        :rules="[{ required: true, message: 'Please input topic!' }]"
      >
        <a-input
          v-model:value="form.topic"
          placeholder="Enter topic"
          suffix-icon="info-circle"
        />
      </a-form-item>

      <!-- QoS & Color -->
      <div class="row-flex">
        <a-form-item
          label="QoS"
          name="qos"
          required
          :rules="[{ required: true, message: 'Please select QoS!' }]"
          class="qos-item"
        >
          <a-select v-model:value="form.qos">
            <a-select-option :value="0">0 At most once</a-select-option>
            <a-select-option :value="1">1 At least once</a-select-option>
            <a-select-option :value="2">2 Exactly once</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="Color"
          name="color"
          class="color-item"
        >
          <div class="color-inline-group">
            <a-input v-model:value="form.color" class="color-input">
              <template #suffix><span @click="randomColor" style="cursor: pointer;">🎲</span></template>
            </a-input>
            <input
              type="color"
              v-model="form.color"
              class="color-picker"
              aria-label="Pick color"
            />
          </div>
        </a-form-item>
      </div>

      <!-- Alias -->
      <a-form-item
        label="Alias"
        name="alias"
        :extra="aliasHint"
      >
        <a-input
          v-model:value="form.alias"
          placeholder="Enter alias (optional)"
          suffix-icon="info-circle"
        />
      </a-form-item>
    </a-form>

    <!-- <template #footer>
      <div class="modal-footer">
        <a-button @click="handleCancel" class="footer-cancel">取消</a-button>
        <a-button type="primary" @click="submitForm" class="footer-confirm">确定</a-button>
      </div>
    </template> -->
  </a-modal>
</template>

<script setup>
import { ref, h } from 'vue'
import { ReloadOutlined } from '@ant-design/icons-vue'

const emit = defineEmits(['ok', 'cancel'])
defineProps('form', 'open')
const visible = ref(true)
// const form = ref({
//   topic: 'testtopic/#',
//   qos: 0,
//   color: '#97CE54',
//   alias: ''
// })

const rules = {
  topic: [
    { required: true, message: 'Please input topic!', trigger: 'blur' }
  ],
  qos: [
    { required: true, message: 'Please select QoS!', trigger: 'change' }
  ]
}

const aliasHint = ' '

function handleCancel() {
  visible.value = false
}
function handleOk() {
  submitForm()
}
function submitForm() {
  // Validate and submit form data here
}

function randomColor() {
  form.value.color = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0').toUpperCase()
}

// 用于 a-button 的 icon 属性
const reloadIcon = () => h(ReloadOutlined)
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