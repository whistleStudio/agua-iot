import Aedes from 'aedes'
import { createServer } from 'net'
import configUrl from '../../../resources/conf/config.json?commonjs-external&asset'
import fs from 'fs'
import os from 'os'

// mqtt server, broker配置
const config = JSON.parse(fs.readFileSync(configUrl, 'utf8'))
const PORT = config.mqtt.port || 1883
const aedes = new Aedes()
const server = createServer(aedes.handle)

server.listen(PORT, function () {
  console.log('mqtt server started and listening on port ', PORT)
})

// 连接验证
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


// 获取ip地址
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
  localIP: localIP
}