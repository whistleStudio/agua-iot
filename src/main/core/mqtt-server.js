import Aedes from 'aedes'
import { createServer } from 'net'
import configUrl from '../../../resources/conf/config.json?commonjs-external&asset'
import fs from 'fs'
import os from 'os'
import mqttCache from './mqtt-cache'

/* mqtt server, broker配置 */
const config = JSON.parse(fs.readFileSync(configUrl, 'utf8'))
const PORT = config.mqtt.port || 1883
const aedes = new Aedes()
const server = createServer(aedes.handle)

server.listen(PORT, function () {
  console.log('mqtt server started and listening on port ', PORT)
})

/* 连接验证，设备管理 */
aedes.authenticate = function (client, username, password, callback) {
  const config = JSON.parse(fs.readFileSync(configUrl, 'utf8'))
  for (let dev of config.devices) {
    if (dev.clientID === client.id && dev.password == password.toString()) {
      callback(null, true)
      console.log(`${new Date()} - ${client.id} connect`)
      return
    }
  }
  callback(new Error('not authorized'), false)
}

const browserWindows = []

/* 订阅主题 */
function subscribeTopic(topic) {
  if (mqttCache[topic]) {
    mqttCache[topic].subCount++
    console.log(`mqttCache[${topic}].subCount:`, mqttCache[topic].subCount)
  } else {
    // 保存deliverfunc以便后续unsubscribe
    const deliverfunc = function (packet, cb) {
      console.log('local subscribe: ', packet.topic, packet.qos)
      const topic = packet.topic, qos = packet.qos, payload = packet.payload.toString()
      const time = new Date().toISOString().replace('T', ' ').replace('Z', '')
      if (mqttCache[topic].dataList.length >= 50) {
        mqttCache[topic].dataList.shift();
      }
      mqttCache[topic].dataList.push({ time, qos, payload })
      if (browserWindows.length) {
        for (const win of browserWindows) {
          win.webContents.send('m:mqttData', { topic, qos, payload, time })
        }
      }
      cb()
    }
    mqttCache[topic] = { subCount: 1, dataList: [], deliverfunc }
    aedes.subscribe(
      topic,
      deliverfunc,
      () => { console.log('local subscribe success: ', topic) }
    )
  }
}

/* 修改订阅主题 */
function modifyTopic({newTopic, oldTopic}) {
  if (mqttCache[oldTopic]) {
    mqttCache[oldTopic].subCount--
    console.log(`mqttCache[${topic}].subCount:`, mqttCache[topic].subCount)
    if (mqttCache[oldTopic].subCount <= 0) {  
      aedes.unsubscribe(
        oldTopic,
        mqttCache[oldTopic].deliverfunc,
        () => { console.log('local unsubscribe success: ', oldTopic) }
      )
      delete mqttCache[oldTopic]
    }
  }
  subscribeTopic(newTopic) // 重新订阅新主题
}

/* 取消订阅主题 */
function unsubscribeTopic(topic) {
  if (mqttCache[topic]) {
    mqttCache[topic].subCount--
    console.log(`mqttCache[${topic}].subCount:`, mqttCache[topic].subCount)
    if (mqttCache[topic].subCount <= 0) {
      // 取消订阅必须使用相同的deliverfunc
      aedes.unsubscribe(
        topic,
        mqttCache[topic].deliverfunc,
        () => { console.log('local unsubscribe success: ', topic) }
      )
      delete mqttCache[topic]
    }
  }
}

/* 发布主题 */
function publishTopic(packet) {
  aedes.publish({ 
    topic: packet.topic,
    payload: packet.payload,
    qos: packet.qos,
    retain: packet.retain
    }, () => {
    console.log('publish success: ', packet.topic, packet.payload)
  })
}

/* -------------------------------- */
/* 获取ip地址 */
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return '127.0.0.1'
}

const localIP = getLocalIPAddress()
console.log('Local IP Address:', localIP)

export default {
  port: PORT,
  localIP: localIP,
  subscribeTopic,
  modifyTopic,
  unsubscribeTopic,
  publishTopic,
  browserWindows
}