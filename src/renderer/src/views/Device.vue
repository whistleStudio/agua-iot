<!-- 
待解决:
1 查询检索
2 key重复问题
3 输入左右去除空白
4 增加输入框复制功能 
-->
<template>
  <div class="device-list-container">
    <!-- 检索工具栏（无密码字段） -->
    <div class="device-list-toolbar">
      <a-input
        v-model:value="filters.name"
        placeholder="设备名称"
        class="toolbar-item"
      />
      <a-input
        v-model:value="filters.clientID"
        placeholder="客户端ID"
        class="toolbar-item"
      />
      <a-button type="primary" @click="onSearch" class="toolbar-item">查询</a-button>
    </div>
    <!-- 可编辑表格 -->
    <a-table
      :columns="columns"
      :dataSource="dataSource"
      :pagination="false"
      rowKey="key"
      bordered
      size="middle"
      class="device-table"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="['name', 'clientID', 'password'].includes(column.dataIndex)">
          <a-input
            v-if="editableData[record.key]" 
            v-model:value="editableData[record.key][column.dataIndex]"
            :placeholder="`请输入${column.title}`"
            size="small"
          />
          <template v-else >
            <span style="user-select: text; cursor: text;">{{ text }}</span>
          </template>
        </template>
        <template v-else-if="column.key === 'action'">
          <div class="device-action">
            <span v-if="editableData[record.key]">
              <a-typography-link @click="save(record.key)">保存</a-typography-link>
              <a-popconfirm title="确定取消编辑吗？" @confirm="cancel(record.key)">
              <a>取消</a>
              </a-popconfirm>
            </span>
            <span v-else class="device-action-edit">
              <a @click="edit(record.key)">编辑</a>
            </span>
            <a
              class="device-action-delete"
              @click="deleteDevice(record.key)"
            >删除</a>
          </div>

        </template>
      </template>
    </a-table>
    <!-- 添加设备按钮 -->
    <a-button
      type="primary"
      class="add-device-btn"
      @click="addDevice"
    >
      添加设备
    </a-button>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { cloneDeep } from "lodash-es";
import bus from "../utils/bus";

const emit = defineEmits(["alert"]);

// 检索项不含密码字段
const filters = ref({
  name: "",
  clientID: ""
});

const dataSource = ref([...bus.devices]);

const columns = [
  {
    title: "设备名称",
    dataIndex: "name",
    key: "name",
    width: "25%",
  },
  {
    title: "客户端ID",
    dataIndex: "clientID",
    key: "clientID",
    width: "25%",
  },
  {
    title: "密码",
    dataIndex: "password",
    key: "password",
    width: "25%",
  },
  {
    title: "操作",
    key: "action",
  },
];

// 检索仅针对设备名称和客户端ID
const onSearch = () => {
  dataSource.value = fullData.value.filter(item =>
    (!filters.value.name || item.name.includes(filters.value.name)) &&
    (!filters.value.clientID || item.clientID.includes(filters.value.clientID))
  );
};

const deleteDevice = (key) => {
  const preDataSource = cloneDeep(dataSource.value);
  // 同步删除
  dataSource.value = dataSource.value.filter(item => item.key !== key);
  changeDevInfo({
    successMsg: "删除成功",
    errMsg: "删除失败",
    preDataSource
  });
};

// 编辑功能
const editableData = reactive({})

const edit = (key) => {
  editableData[key] = cloneDeep(dataSource.value.filter(item => key === item.key)[0])
};

const save = key => {
  const preDataSource = cloneDeep(dataSource.value);
  Object.assign(dataSource.value.filter(item => key === item.key)[0], editableData[key]);
  changeDevInfo({
    successMsg: "保存成功",
    errMsg: "保存失败",
    preDataSource
  });
  delete editableData[key];
};
const cancel = key => {
  delete editableData[key];
};

// 添加设备
const addDevice = () => {
  const preDataSource = cloneDeep(dataSource.value);
  const newItem = {
    key: new Date().getTime(),
    name: "undefined",
    clientID: "undefined",
    password: "123456",
  };
  dataSource.value.push(newItem);
  changeDevInfo({
    successMsg: "添加成功",
    errMsg: "添加失败",
    preDataSource
  })
};

// 本地配置同步修改
function changeDevInfo({successMsg, errMsg, preDataSource}) {
  window.electron.ipcRenderer.invoke("r:changeDevInfo", cloneDeep(dataSource.value))
  .then((res) => {
    if (!res.err) {
      emit("alert", { type: "success", msg: successMsg });
    } else {
      emit("alert", { type: "error", msg: errMsg });
      // 如果同步失败，恢复数据
      dataSource.value = preDataSource;
    }
  })
}


</script>

<style lang="scss" scoped>
.device-list-container {
  width: 100%;
  padding: 8px;
  background: #fff;
  min-height: 100vh;
  font-family: 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;

  .device-list-toolbar {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    gap: 8px;

    .toolbar-item {
      margin-right: 0 !important;
      min-width: 140px;
    }
  }

  .device-table {
    background: #fff;
    .ant-input {
      min-width: 120px;
      font-size: 14px;
      padding: 2px 6px;
    }
    .device-action {
      .device-action-edit {
        color: #1890ff;
        margin-right: 12px;
        cursor: pointer;
        transition: color 0.2s;
        &:hover {
          color: #0958d9;
          text-decoration: underline;
        }
      }
      .device-action-delete {
        color: #f5222d;
        cursor: pointer;
        transition: color 0.2s;
        &:hover {
          color: #cf1322;
          text-decoration: underline;
        }
      }
    }

  }

  .add-device-btn {
    font-size: 16px;
    font-weight: 500;
    height: 40px;
    width: 100%;
    margin-top: 16px;
    background: #52c41a !important;
    border-color: #52c41a !important;
    transition: background 0.2s, border-color 0.2s;
    &:hover, &:focus {
      background: #389e0d !important;
      border-color: #389e0d !important;
    }
  }
}
</style>