import cloneDeep from 'lodash/cloneDeep'
const events = {}

const bus = {
  mqttServer: {
    localIP: "",
    port: 1883
  },
  devices: [],
  projList: [],
  activeProjIdx: -1,
  // 注册事件监听
  on(event, callback) {
    if (!events[event]) {
      events[event] = []
    }
    events[event].push(callback)
  },

  // 注销事件监听
  off(event, callback) {
    if (!events[event]) return
    events[event] = events[event].filter(cb => cb !== callback)
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
    // console.log('changeProjInfo', this.projList)
    window.electron?.ipcRenderer.invoke('r:changeProjList', JSON.parse(JSON.stringify(this.projList)))
    .then(() => {
      // Successfully updated project info
    })
    .catch((err) => {
      console.error(err)
    })
  }
}

export default bus
