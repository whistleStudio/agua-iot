import mqtt from 'mqtt';

const clientGroup = {
  // clientId: <mqttClientObject>,
}; 

const clientIdList = []

// // 连接成功回调
// client.on('connect', () => {
//   console.log('Connected');
//   // 订阅主题
//   client.subscribe('iot/test', (err) => {
//     if (!err) {
//       console.log('Subscribed to iot/test');
//       // 发布消息
//       client.publish('iot/test', 'Hello IoT!');
//     }
//   });
// });

// // 接收到消息回调
// client.on('message', (topic, message) => {
//   console.log(`Received message on ${topic}: ${message.toString()}`);
// });

// // 错误处理
// client.on('error', (err) => {
//   console.error('Connection error:', err);
// });

// // 关闭连接
// client.on('close', () => {
//   console.log('Connection closed');
// });

/* 远程连接（创建客户端） */
function connectRemoteMqtt({projId, ip, port, clientId, username, password, subTopics}) {
  return new Promise((rsv, rej) => {
    // 检查是否已存在同名客户端
    if (clientGroup.hasOwnProperty(projId)) rej({err: 1, msg: '项目已存在，请勿重复连接'});
    if (clientIdList.includes(clientId)) rej({err: 1, msg: '客户端ID已存在，请更换ID'});
    // 创建新的客户端
    const client = mqtt.connect(`mqtt://${ip}:${port}`, {
      clientId,
      username,
      password,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000
    });
    
    // 监听连接成功
    const onConnectHandle = () => {
      console.log(`Client ${clientId} connected to ${ip}:${port}`);
      clientGroup[projId] = client; // 存储客户端
      // 订阅主题
      subTopics.forEach(topic => {
        client.subscribe(topic, (err) => {
          if (err) {
            console.error(`Client ${clientId} failed to subscribe to ${topic}:`, err);
            rej({err: 1, msg: `订阅主题失败: ${topic}`});
          } else {
            console.log(`Client ${clientId} subscribed to ${topic}`);
          }
        });
      });
      rsv({err: 0, msg: '连接成功'});
    }
    client.on('connect', onConnectHandle);

    // 监听异常
    const onErrorHandle = (err) => {
      console.error(`Client ${clientId} connection error:`, err);
      rej({err: 1, msg: err});
    }
    client.on('error', onErrorHandle);

    // 监听订阅消息
    const onMessageHandle = (topic, message, packet) => {
      console.log(`Client ${clientId} received message on ${topic} QOS${packet.qos}: ${message.toString()}`);
      // 这里可以添加处理接收到消息的逻辑
    }
    client.on('message', onMessageHandle);
  }) 
}

export default {
  connectRemoteMqtt
}