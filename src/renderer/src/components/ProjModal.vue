<template>
  <a-modal
    :open="open"
    title="创建/编辑项目"
    @ok="handleOk"
    @cancel="handleCancel"
    :maskClosable="false"
    :keyboard="false"
    width="420px"
    destroyOnClose
    :cancelText="'取消'"
    :okText="'确定'"
  >
    <a-form
      :model="form"
      ref="formRef"
      layout="vertical"
    >
      <a-form-item label="项目名称" required>
        <a-input v-model:value.trim="form.name" placeholder="请输入项目名称" />
      </a-form-item>
      <a-form-item label="项目模式" required>
        <a-radio-group v-model:value="form.mode">
          <a-radio :value="'local'">本地服务模式</a-radio>
          <a-radio :value="'remote'">远程服务模式</a-radio>
        </a-radio-group>
      </a-form-item>
      <template v-if="form.mode === 'remote'">
        <a-form-item label="客户端ID" required>
          <a-input v-model:value.trim="form.clientID" placeholder="请输入客户端ID" />
        </a-form-item>
        <a-form-item label="IP地址" required>
          <a-input v-model:value.trim="form.ip" placeholder="请输入IP地址" />
        </a-form-item>
        <a-form-item label="端口号" required>
          <a-input v-model:value.trim="form.port" placeholder="请输入端口号" />
        </a-form-item>
        <a-form-item label="用户名">
          <a-input v-model:value.trim="form.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="密码">
          <a-input v-model:value.trim="form.password" type="password" placeholder="请输入密码" />
        </a-form-item>
      </template>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, watch, reactive } from "vue";
import bus from "../utils/bus";

const props = defineProps({
  open: Boolean,
});
const emit = defineEmits(["ok", "cancel"]);

const defaultForm = () => ({
  name: "",
  mode: "local",
  clientID: "",
  ip: "",
  port: "",
  username: "",
  password: "",
});

const form = reactive(defaultForm());
const formRef = ref(null);

watch(() => props.open, (val) => {
  if (val) {
    Object.assign(form, defaultForm());
  }
});

function handleOk() {
  // 校验
  if (!form.name.trim()) {
    console.warn("项目名称不能为空");
    bus.emit("showCustomAlert", {
      type: "warning",
      msg: "请输入项目名称",
    });
    return;
  }
  if (form.mode === "remote") {
    if (!form.clientID.trim()) {
      bus.emit("showCustomAlert", {
        type: "warning",
        msg: "请输入客户端ID",
      });
      return;
    }
    if (!form.ip.trim()) {
      bus.emit("showCustomAlert", {
        type: "warning",
        msg: "请输入IP地址",
      });
      return;
    }
    if (!form.port.trim()) {
      bus.emit("showCustomAlert", {
        type: "warning",
        msg: "请输入端口号",
      });
      return;
    }
  }
  emit("ok", { ...form });
}
function handleCancel() {
  emit("cancel");
}
</script>