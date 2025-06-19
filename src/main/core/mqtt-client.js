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
  }
  if (clientGroup.hasOwnProperty(projId)) {
    delete clientGroup[projId]; // 从客户端组中删除
  }
  if (clientIdList.includes(clientID)) {
    clientIdList.splice(clientIdList.indexOf(clientID), 1); // 从客户端ID列表中删除
  }
}

/* 新增/修改订阅 */
function subscribeRemoteTopic ({projId, topic}) {
  const client = clientGroup[projId]?.client;
  if (client) {
    // // 检查是否已订阅该主题
    // if (client.options.subscriptions && client.options.subscriptions.some(sub => sub.topic === topic.topic)) {
    //   console.log(`Client already subscribed to ${topic.topic}`);
    //   return;
    // }
    // 订阅新主题, 同名新覆盖旧
    client.subscribe(topic.topic, {qos: topic.qos}, (err) => {
      if (err) {
        console.error(`Client failed to subscribe to ${topic.topic} - QOS${topic.qos}:`, err);
      } else {
        console.log(`Client subscribed to ${topic.topic} - QOS${topic.qos}`);
      }
    });
  } else {
    console.log(`subscribeRemoteTopic - Client not found for project ${projId}`);
  }
}

/* 取消订阅 */
function unsubscribeRemoteTopic ({projId, topic}) {
  const client = clientGroup[projId]?.client;
  console.log(clientGroup);
  if (client) {
    client.unsubscribe(topic, (err) => {
      if (err) {
        console.error(`Client failed to unsubscribe from ${topic}:`, err);
      } else {
        console.log(`Client unsubscribed from ${topic}`);
      }
    });
  } else {
    console.error(`unsubscribeRemoteTopic - Client not found for project ${projId}`);
  }

}

export default {
  connectRemoteMqtt,
  disconnectRemoteMqtt,
  subscribeRemoteTopic,
  unsubscribeRemoteTopic
}