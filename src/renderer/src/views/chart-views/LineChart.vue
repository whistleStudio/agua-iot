<template>
  <div class="component-props">
    <div class="component-props__title">组件属性 <span>折线图</span></div>
    <a-divider style="margin: 8px 0 16px 0" />

    <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" layout="horizontal">
      <a-form-item label="组件标题">
        <a-input v-model:value="attrData.title" placeholder="折线图" />
      </a-form-item>
      <a-form-item label="Topic">
        <a-select v-model:value="selectTopic" placeholder="请选择订阅主题" :options="opts" @change="v => { attrData.topic = JSON.parse(v) }"></a-select>
      </a-form-item>
      <a-form-item label="组件宽度">
        <a-input v-model:value.number="attrData.width" placeholder="420" @pressEnter="enterBlur"
        @blur="bus.emit('lineChartWHChange', {id: bus.activeCompId, newWidth:attrData.width, newHeight:attrData.height})"/>
      </a-form-item>
      <a-form-item label="组件高度">
        <a-input v-model:value.number="attrData.height" placeholder="280" @pressEnter="enterBlur"
        @blur="bus.emit('lineChartWHChange', {id: bus.activeCompId, newWidth:attrData.width, newHeight:attrData.height})"/>
      </a-form-item>
      <a-form-item label="隐藏底色">
        <a-checkbox v-model:checked="attrData.hideBg" />
      </a-form-item>
      <a-form-item label="纵轴单位">
        <a-input v-model:value="attrData.yUnit" placeholder="°C" />
      </a-form-item>
      <a-form-item label="数量">
        <a-select v-model:value="attrData.count" :options="countOpts" />
      </a-form-item>
      <a-form-item label="折线配置">
        <div class="lineset-list">
          <div v-for="(line, idx) in lineList" :key="idx" class="lineset-row">
            <span class="line-index">{{ idx + 1 }}.</span>
            <a-input class="line-input" v-model:value="lineList[idx]" :placeholder="`折线${idx + 1}`" :disabled="false" @change="updateLines" />
            <a-button v-if="lineList.length > 1" type="text" class="line-remove-btn" style="color:#d4380d" @click="removeLine(idx)">-</a-button>
          </div>
          <a-button v-if="lineList.length < 5" type="dashed" class="line-add-btn" @click="addLine" style="margin-top: 8px;width: 40px;height: 32px;">+</a-button>
        </div>
      </a-form-item>
    </a-form>

    <div class="tips">
      <div class="tips-title">组件功能</div>
      <div class="tips-desc">
        定时获取最新的10/100/1000条数据，<br>
        以消息时间为x轴，显示在折线图上。
      </div>
    </div>
    <div class="tips">
      <div class="tips-title">订阅数据</div>
      <div class="tips-desc">
        示例：111，222，333...<br>
        说明：数据1，数据2，数据3...(与折线数量匹配)
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, computed, ref, watch, onBeforeMount } from 'vue'
import bus from '../../utils/bus'

const activeCompProps = inject('activeCompProps')
const attrData = computed({
  get: () => activeCompProps.get(),
  set: (val) => { activeCompProps.set(val) }
})

const subTopics = computed(() =>
  (bus.activeProjIdx !== -1 && bus.activeProjIdx !== undefined)
    ? bus.projList[bus.activeProjIdx].subTopics
    : []
)

const selectTopic = ref()
const opts = computed(() => subTopics.value.map(v => ({
  label: `${v.topic}${'\u00A0'.repeat(Math.max(0, 25 - v.topic.length))} qos:${v.qos}`,
  value: JSON.stringify(v)
})))

const countOpts = [
  { label: '10', value: 10 },
  { label: '100', value: 100 },
  { label: '1000', value: 1000 }
]

// 折线名称数组（最多5项）与attrData同步
const lineList = ref([])

onBeforeMount(() => {
  const avtJson = JSON.stringify(attrData.value.topic)
  if (
    attrData.value?.topic?.topic &&
    subTopics.value.findIndex(v => JSON.stringify(v) === avtJson) !== -1
  ) {
    selectTopic.value = avtJson
  } else {
    selectTopic.value = null
  }
  // if (!attrData.value.count) attrData.value.count = 10
  // if (!attrData.value.width) attrData.value.width = 420
  // if (!attrData.value.height) attrData.value.height = 280
  // if (!attrData.value.yUnit) attrData.value.yUnit = '°C'

  // // 初始化折线数组
  // if (Array.isArray(attrData.value.lines)) {
  //   lineList.value = [...attrData.value.lines]
  // } else if (attrData.value.line1) {
  //   lineList.value = [attrData.value.line1]
  // } else {
  //   lineList.value = ['折线1']
  // }
  lineList.value = attrData.value.lineTitles
  // // 初始状态的话给出示例图表
  console.log("isInit", attrData.value.isInit)
  if (attrData.value.isInit) {
    attrData.value.yData.forEach((line, idx) => {
      // line = Array(5).fill(0).map((_, i) => (i+idx))
      console.log(`init line ${idx + 1}:`, line)
    })
  }

  updateLines()
})

watch(lineList, updateLines, { deep: true })

function addLine() {
  if (lineList.value.length < 5) {
    lineList.value.push(`折线${lineList.value.length + 1}`)
  }
}
function removeLine(idx) {
  if (lineList.value.length > 1) {
    lineList.value.splice(idx, 1)
  }
}
function updateLines() {
  // 同步到attrData
  attrData.value.lines = [...lineList.value]
  // 兼容老字段
  if (attrData.value.lines?.[0]) attrData.value.line1 = attrData.value.lines[0]
}
// 输入框回车失去焦
function enterBlur(e) { e.target.blur() }
</script>

<style lang="scss" scoped>
.component-props {
  padding: 16px 12px 16px 0 !important;
  min-width: 240px;
  .component-props__title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 2px;
    span {
      margin-left: 10px;
      color: #aaa;
    }
  }
  :deep(.ant-form-item) {
    margin-bottom: 16px;
  }
  .lineset-list {
    min-height: 42px;
    .lineset-row {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      .line-index {
        display: inline-block;
        width: 18px;
        color: #555;
        font-size: 15px;
        text-align: right;
        margin-right: 6px;
      }
      .line-input {
        width: 120px;
        margin-right: 4px;
      }
      .line-remove-btn {
        margin-left: 4px;
      }
    }
    .line-add-btn {
      display: block;
      margin-left: 24px;
      border: 1px dashed #d9d9d9;
      background: #fafafa;
      width: 40px;
      height: 32px;
      border-radius: 6px;
      font-size: 15px;
      transition: border 0.2s;
      &:hover {
        border: 1px solid #1890ff;
        background: #e6f7ff;
      }
    }
  }
  .tips {
    border: 1px solid #d9f7be;
    background: #f6ffed;
    padding: 8px 12px;
    margin-top: 12px;
    border-radius: 3px;
    .tips-title {
      font-weight: bold;
      color: #389e0d;
      margin-bottom: 4px;
    }
    .tips-desc {
      color: #222;
      font-size: 13px;
      line-height: 20px;
    }
  }
}
</style>