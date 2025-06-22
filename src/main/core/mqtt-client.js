import mqtt from 'mqtt';

const clientGroup = {
  // clientID: <mqttClientObject>,
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
function connectRemoteMqtt({projId, ip, port, clientID, username, password, subTopics}) {
  console.log(`Connecting to remote MQTT server at ${ip}:${port} with clientID: ${clientID}`);
  return new Promise((rsv, rej) => {
    // 检查是否已存在同名客户端
    if (clientGroup.hasOwnProperty(projId)) rej({err: 1, msg: '项目已存在，请勿重复连接'});
    if (clientIdList.includes(clientID)) rej({err: 1, msg: '客户端ID已存在，请更换ID'});
    // 创建新的客户端
    const client = mqtt.connect(`mqtt://${ip}:${port}`, {
      clientId: clientID,
      username,
      password,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 0
    });

    // 回调：连接成功
    const onConnectHandle = () => {
      console.log(`remote Client ${clientID} connected to ${ip}:${port}`);
      // 成功时订阅主题
      subTopics.forEach(topic => {
        client.subscribe(topic.topic, {qos: topic.qos}, (err) => {
          if (err) {
            console.error(`remote Client ${clientID} failed to subscribe to ${topic.topic} - QOS${topic.qos}:`, err);
            rej({err: 1, msg: `订阅主题失败: ${topic.topic}`});
          } else {
            console.log(`Client ${clientID} subscribed to ${topic.topic} - QOS${topic.qos}`);
          }
        });
      });
      rsv({err: 0, msg: '连接成功'});
    }

    // 回调：接收消息
    const onMessageHandle = (topic, message, packet) => {
      console.log(`Client ${clientID} received message on ${topic} QOS${packet.qos}: ${message.toString()}`);
      // 这里可以添加处理接收到消息的逻辑
    }

    // 回调：异常
    const onErrorHandle = (err) => {
      console.error(`Client ${clientID} connection error:`, err);
      console.log(err.message);
      disconnectRemoteMqtt({projId, clientID, client}); // 断开连接
      rej({err: 1, msg: `连接失败: ${err.message}`});
    }
        
    clientGroup[projId] = {client, onConnectHandle, onMessageHandle, onErrorHandle}; // 存储客户端
    clientIdList.push(clientID); // 存储客户端ID

    client.on('connect', onConnectHandle);
    client.on('message', onMessageHandle);
    client.on('error', onErrorHandle);
  })
}

// 断开事件
function disconnectRemoteMqtt ({projId, clientID}) {
  const client = clientGroup[projId]?.client;
  if (client) {
    client.removeListener('connect', clientGroup[projId].onConnectHandle); // 移除连接成功监听
    client.removeListener('message', clientGroup[projId].onMessageHandle); // 移除消息监听
    client.removeListener('error', clientGroup[projId].onErrorHandle); // 移除错误监听
    client.end(); // 关闭连接
    console.log(`remote Client ${clientID} removed`);
  }
  if (clientGroup.hasOwnProperty(projId)) {
    delete clientGroup[projId]; // 从客户端组中删除
  }
  if (clientIdList.includes(clientID)) {
    clientIdList.splice(clientIdList.indexOf(clientID), 1); // 从客户端ID列表中删除
  }
}

/* 新增订阅 */
function subscribeRemoteTopic ({projId, topic}) {
  return new Promise((rsv, rej) => {
    const client = clientGroup[projId]?.client;
    if (client) {
      // 订阅新主题
      client.subscribe(topic.topic, {qos: topic.qos}, (err) => {
        if (err) {
          console.error(`remote Client failed to subscribe to ${topic.topic} - QOS${topic.qos}:`, err);
          rej({err: 1, msg: `订阅主题失败`});
        } else {
          console.log(`remote Client subscribed to ${topic.topic} - QOS${topic.qos}`);
          rsv({err: 0, msg: '订阅成功'});
        }
      });
    } else {
      console.log(`subscribeRemoteTopic - Client not found for project ${projId}`);
      rsv({err: 0}) // 未连接的状态下添加主题
    }
  })
}

/* 取消订阅 */
function unsubscribeRemoteTopic ({projId, topic}) {
  // console.log(topic)
  const client = clientGroup[projId]?.client;
  if (client) {
    client.unsubscribe(topic, (err) => {
      if (err) {
        console.log(`remote Client failed to unsubscribe from ${topic}:`, err);
      } else {
        console.log(`remote Client unsubscribed from ${topic}`);
      }
    });
  } else {
    console.log(`unsubscribeRemoteTopic - Client not found for project ${projId}`);
  }
}


/* 发布主题 */
function publishRemoteTopic({packet, projId}) {
  const client = clientGroup[projId]?.client;
  if (client) {
    client.publish(packet.topic, packet.payload, {qos: packet.qos, retain: packet.retain}, (err) => {
      if (err) {
        console.error(`remote Client failed to publish to ${packet.topic}:`, err);
      } else {
        console.log(`remote Client published to ${packet.topic}: ${packet.payload}`);
      }
    });
  } else {
    console.log(`publishRemoteTopic - Client not found for project ${projId}`);
  }
}

export default {
  connectRemoteMqtt,
  disconnectRemoteMqtt,
  subscribeRemoteTopic,
  unsubscribeRemoteTopic,
  publishRemoteTopic  
}