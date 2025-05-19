
const events = {}

const bus = {
  mqttServer: {
    localIP: "",
    port: 1883
  },
  devices: [],
  projList: [],

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
  }
}

export default bus
