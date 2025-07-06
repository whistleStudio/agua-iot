import mqtt from 'mqtt';

const clientGroup = {
  // clientID: <mqttClientObject>,
}; 

const clientIdList = []
const browserWindows = [] // 用于存储浏览器窗口引用

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
      console.log("------------------------\n", topic, packet, "---------------------\n")
      console.log(`Client ${clientID} received message on ${topic} QOS${packet.qos}: ${message.toString()}`);
      const time = new Date(Date.now() + 8 * 3600000).toISOString().replace('T', ' ').replace('Z', '').slice(0, 19) // 东8区
      const payload = message.toString();
      // 找出所有命中的订阅表达式
      const matchedSubs = clientGroup[projId].customSubTopics.filter(sub =>
        matchMqttTopicFilter(sub.topic, topic)
      );

      // 这里可以添加处理接收到消息的逻辑
      if (browserWindows.length) {
        if (matchedSubs.length === 0) return 
        for (const win of browserWindows) {
          matchedSubs.forEach(sub => {
            console.log(`Matched subscription for ${sub.topic} in project ${projId} ${sub.qos} packet.qos ${packet.qos}`);
            win.webContents.send('m:mqttRemoteData', { projId, topic: sub.topic, qos: Math.min(packet.qos, sub.qos||0), payload, time })
            // if (sub?.retained?.indexOf(topic)<0) {
            //   win.webContents.send('m:mqttRemoteData', { projId, topic: sub.topic, qos: Math.min(packet.qos, sub.qos||0), payload, time })
            //   sub.retained.push(topic); // 添加至已retain接收过的列表，避免重复向renderer发送
            // }
          })
          win.webContents.send('m:mqttRemoteProjData', { projId, topic, qos: packet.qos, payload, time }); // 发送到renderer进程Proj.vue
        }
      }
    }

    // 回调：异常
    const onErrorHandle = (err) => {
      console.error(`Client ${clientID} connection error:`, err);
      console.log(err.message);
      disconnectRemoteMqtt({projId, clientID, initiated: false}); // 断开连接
      rej({err: 1, msg: `连接失败: ${err.message}`});
    }

    // 回调: 断开
    const onCloseHandle = () => {
      console.log(`Client ${clientID} disconnected`);
      setTimeout(() => {
        disconnectRemoteMqtt({projId, clientID, initiated: false}); // 断开连接
      }, 500); // 延时0.5秒后断开连接，避免重复触
    }
    const customSubTopics = subTopics.map(topic => ({...topic, retained: []}))
    clientGroup[projId] = {client, onConnectHandle, onMessageHandle, onErrorHandle, customSubTopics}; // 存储客户端
    clientIdList.push(clientID); // 存储客户端ID

    client.on('connect', onConnectHandle);
    client.on('message', onMessageHandle);
    client.on('error', onErrorHandle);
    client.on('close', onCloseHandle);
  })
}

// 断开事件
function disconnectRemoteMqtt ({projId, clientID, initiated = true}) {
  const client = clientGroup[projId]?.client;
  if (!client) return
  client.removeListener('connect', clientGroup[projId].onConnectHandle); // 移除连接成功监听
  client.removeListener('message', clientGroup[projId].onMessageHandle); // 移除消息监听
  client.removeListener('error', clientGroup[projId].onErrorHandle); // 移除错误监听
  client.end(); // 关闭连接
  console.log(`remote Client ${clientID} removed`);
  if (clientGroup.hasOwnProperty(projId)) {
    delete clientGroup[projId]; // 从客户端组中删除
  }
  if (clientIdList.includes(clientID)) {
    clientIdList.splice(clientIdList.indexOf(clientID), 1); // 从客户端ID列表中删除
  }
  if (browserWindows.length && !initiated) { // 主动断开不触发异常断开事件
    for (const win of browserWindows) {
      console.log("trigger remote disconnect event")
      win.webContents.send('m:mqttRemoteErrDisconnected', { projId })
    }
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
          // 更新订阅列表
          if (!clientGroup[projId].customSubTopics) {
            clientGroup[projId].customSubTopics = [];
          }
          clientGroup[projId].customSubTopics.push({...topic, retained: []}); // 添加到订阅列表中
          // 如果有浏览器窗口，发送订阅成功事件
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
        if (clientGroup[projId].customSubTopics) {
          // 从订阅列表中移除主题
          clientGroup[projId].customSubTopics = clientGroup[projId].customSubTopics.filter(sub => sub.topic !== topic);
        }
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
        console.log(`remote Client published to ${packet.topic}: ${packet.payload} ${packet.qos}`);
      }
    });
  } else {
    console.log(`publishRemoteTopic - Client not found for project ${projId}`);
  }
}


// 完整支持+和#的MQTT主题匹配
function matchMqttTopicFilter(filter, topic) {
  if (typeof filter !== 'string' || typeof topic !== 'string') return false;
  if (filter.length === 0 || topic.length === 0) return false;
  if (filter.includes('//') || topic.includes('//')) return false;

  const filterLevels = filter.split('/');
  const topicLevels = topic.split('/');

  let i = 0;
  for (; i < filterLevels.length; i++) {
    const f = filterLevels[i];
    const t = topicLevels[i];
    if (f === '#') {
      // #必须在末尾
      return i === filterLevels.length - 1;
    }
    if (f === '+') {
      if (typeof t === 'undefined') return false;
      continue;
    }
    if (typeof t === 'undefined') return false;
    if (f !== t) return false;
  }
  return filterLevels.length === topicLevels.length;
}

export default {
  browserWindows,
  connectRemoteMqtt,
  disconnectRemoteMqtt,
  subscribeRemoteTopic,
  unsubscribeRemoteTopic,
  publishRemoteTopic  
}