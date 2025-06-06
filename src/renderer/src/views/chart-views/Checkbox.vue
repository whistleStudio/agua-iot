<template>
  <div class="component-props">
    <div class="component-props__title">组件属性 <span>复选框</span></div>
    <a-divider style="margin: 8px 0 16px 0" />
    <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" layout="horizontal">
      <a-form-item label="组件标题">
        <a-input v-model:value="attrData.title" placeholder="请输入标题" />
      </a-form-item>
      <a-form-item label="Topic">
        <a-select
          v-model:value="selectTopic"
          placeholder="请选择发布主题"
          :options="opts"
          @change="v => { attrData.topic = JSON.parse(v) }"
        />
      </a-form-item>
      <a-form-item label="组件大小">
        <a-select v-model:value="attrData.size" placeholder="请选择" :options="bus.sizeOpts" @change="v => attrData.size = v" />
      </a-form-item>
      <a-form-item label="选项配置">
        <div>
          <div v-for="(item, idx) in attrData.options" :key="idx" class="option-row">
            <a-input v-model:value="item.label" placeholder="标签" style="width: 45%; margin-right: 8px" :max-length="20" />
            <a-input v-model:value="item.value" placeholder="发送内容" style="width: 45%; margin-right: 8px" :max-length="20" />
            <a-button type="text" danger style="padding: 0" @click="removeOption(idx)" v-if="attrData.options.length > 2">-</a-button>
          </div>
          <a-button type="dashed" block style="margin-top: 8px" :disabled="attrData.options ? attrData.options.length >= 5 : false" @click="addOption">+</a-button>
        </div>
      </a-form-item>
      <a-form-item label="隐藏底色">
        <a-checkbox v-model:checked="attrData.hideBg" />
      </a-form-item>
    </a-form>
    <div class="tips">
      <div class="tips-title">组件功能</div>
      <div class="tips-desc">
        可多选标签，选中后点击发送按钮，将所有选中内容用下划线连接拼接为文本后发布到指定主题。
      </div>
    </div>
    <div class="tips">
      <div class="tips-title">发布数据</div>
      <div class="tips-desc">
        示例：value1_value2<br>说明：用下划线_拼接所有被勾选项的“发送内容”value
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, computed, ref, onBeforeMount, watch } from 'vue'
import bus from '../../utils/bus'

const activeCompProps = inject('activeCompProps')
const attrData = computed({
  get: () => activeCompProps.get(),
  set: (val) => { activeCompProps.set(val) }
})

const pubTopics = computed(() => (bus.activeProjIdx !== -1 && bus.activeProjIdx !== undefined) ? bus.projList[bus.activeProjIdx].pubTopics : [])
const selectTopic = ref()

const opts = computed(() => pubTopics.value.map(v => ({
  label: `${v.topic}${'\u00A0'.repeat(Math.max(0, 25 - v.topic.length))} qos:${v.qos} retain:${v.retain}`,
  value: JSON.stringify(v)
})))

function solveTopic(topic) {
  if (topic && pubTopics.value.findIndex(v => JSON.stringify(v) === JSON.stringify(topic)) !== -1) {
    return JSON.stringify(topic)
  } else {
    return null
  }
}

watch(attrData, (newVal) => {
  solveTopic(newVal.topic)
  selectTopic.value = solveTopic(newVal.topic)
}, { deep: true })

onBeforeMount(() => {
  solveTopic(attrData.value.topic)
  selectTopic.value = solveTopic(attrData.value.topic)
  if (!attrData.value.options || !Array.isArray(attrData.value.options)) {
    attrData.value.options = [
      { label: '选项1', value: 'value1' },
      { label: '选项2', value: 'value2' }
    ]
  }
})

function addOption() {
  if (attrData.value.options.length < 5) {
    attrData.value.options.push({ label: '', value: '' })
  }
}
function removeOption(idx) {
  if (attrData.value.options.length > 2) {
    attrData.value.options.splice(idx, 1)
  }
}
</script>

<style lang="scss" scoped>
.component-props {
  padding: 16px 12px 16px 0;
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
  .option-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    .ant-input {
      min-width: 0;
    }
  }
}
</style>