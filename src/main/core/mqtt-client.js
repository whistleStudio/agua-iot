import mqtt from 'mqtt';

const clientGroup = {
  // clientId: <mqttClientObject>,
}; 

// 连接成功回调
client.on('connect', () => {
  console.log('Connected');
  // 订阅主题
  client.subscribe('iot/test', (err) => {
    if (!err) {
      console.log('Subscribed to iot/test');
      // 发布消息
      client.publish('iot/test', 'Hello IoT!');
    }
  });
});

// 接收到消息回调
client.on('message', (topic, message) => {
  console.log(`Received message on ${topic}: ${message.toString()}`);
});

// 错误处理
client.on('error', (err) => {
  console.error('Connection error:', err);
});

// 关闭连接
client.on('close', () => {
  console.log('Connection closed');
});

/* 远程连接（创建客户端） */
function connectRemoteMqtt({ip, port, clientId, username, password}) {
  return new Promise((rsv, rej) => {
    // 检查是否已存在同名客户端
    if (clientGroup.hasOwnProperty(clientId)) rej({err: 1, msg: '客户端已存在，请更换clientId'});
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
      clientGroup[clientId] = client; // 存储客户端
      rsv({err: 0, msg: '连接成功'});
    }
    client.on('connect', onConnectHandle);

    // 监听异常
    const onErrorHandle = (err) => {
      console.error(`Client ${clientId} connection error:`, err);
      rej({err: 1, msg: err});
    }
    client.on('error', onErrorHandle);
  }) 
}

export default {
  connectRemoteMqtt
}