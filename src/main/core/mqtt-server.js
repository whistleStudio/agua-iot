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
  // console.log(client.id, username, password.toString())
  // 打开配置文件
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
  // 多个项目订阅时，计数加1；确保unsubscribe时能正确删除
  if (mqttCache[topic]) mqttCache[topic].subCount++
  else {
    mqttCache[topic] = { subCount: 1, dataList: [] }
    // 同个主题只注册一次回调
    aedes.subscribe(
      topic, 
      (packet, cb) => {
        const topic = packet.topic, qos = packet.qos, payload = packet.payload.toString()
        const time = new Date().toISOString().replace('T', ' ').replace('Z', '')
        // 修改缓存
        if (mqttCache[topic].dataList.length >= 50) {
          mqttCache[topic].dataList.shift();
        }
        mqttCache[topic].dataList.push({ time, qos, payload })
        console.log('msg recv: ', topic, qos, payload, time)
        if (browserWindows.length) {
          // 发送消息到浏览器窗口
          for (const win of browserWindows) {
            win.webContents.send('m:mqttData', { topic, qos, payload, time })
          }
        }
        cb()
      },
      () => { console.log('local subscribe success: ', topic) }
    )
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
  publishTopic,
  browserWindows
}