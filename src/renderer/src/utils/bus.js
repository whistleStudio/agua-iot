const events = {}

const bus = {
  mqttServer: {
    localIP: "",
    port: 1883
  },
  devices: [],
  projList: [],
  activeProjIdx: -1,
  activeCompId: 0,
  sizeOpts: [
    { label: '小', value: 'small' },
    { label: '中', value: 'medium' },
    { label: '大', value: 'large' }
  ],
  // 注册事件监听
  on(event, callback) {
    if (!events[event]) {
      events[event] = []
    }
    events[event].push(callback)
    // console.log('on', event, callback)
  },

  // 注销事件监听
  off(event, callback) {
    if (!events[event]) return
    events[event] = events[event].filter(cb => cb !== callback)
    // console.log('off', event, callback)
  },

  // 触发事件
  emit(event, payload) {
    if (!events[event]) return
    events[event].forEach(callback => callback(payload))
  },

  // 只监听一次
  once(event, callback) {
    const wrapper = (payload) => {
      callback(payload)
      bus.off(event, wrapper)
    }
    bus.on(event, wrapper)
  },
  // 更新本地存储
  changeProjInfo() {
    console.log('changeProjInfo')
    window.electron?.ipcRenderer.invoke('r:changeProjList', JSON.parse(JSON.stringify(this.projList)))
    .then(() => {
      // Successfully updated project info
    })
    .catch((err) => {
      console.error(err)
    })
  },
  /* 发布数据 */
  pubTopicData(compProps, payload) {
    if (!compProps.topic || !compProps.topic.topic) { this.emit("showCustomAlert", { type: "warning", msg: "请选择一个主题" }); return; }
    if (this.projList.length === 0 || this.activeProjIdx < 0) return
    const activeProj = this.projList[this.activeProjIdx]
    window.electron.ipcRenderer.invoke('r:publishMqtt', {
      packet: {
        ...compProps.topic,
        payload,
      },
      mqttMode: activeProj.mode || "local",
      projId: activeProj.id
    })
    .then((res) => {
      if (res.err) {
        this.emit("alert", { type: "error", msg: res.msg })
      } else {
        // 转为东8区时间
        const time = new Date(Date.now() + 8 * 3600000).toISOString().replace('T', ' ').replace('Z', '').slice(0, 19);
        activeProj.cache.push({ type: 1, time, topic: compProps.topic.topic, qos: compProps.topic.qos, content: payload, color: '#fff' })
        this.changeProjInfo()
      }
    })
  }
}

export default bus
