import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import mqttServer from './core/mqtt-server'
import mqttClient from './core/mqtt-client'
// import configUrl from '../../resources/conf/config.json?commonjs-external&asset'
// import projDataUrl from '../../resources/conf/projData.json?commonjs-external&asset'
import fs from 'fs'
/* 建立/获取本地目录 */
const userDataPath = app.getPath('userData') // 获取用户数据目录
const confDir = join(userDataPath, 'conf')
if (!fs.existsSync(confDir)) fs.mkdirSync(confDir, { recursive: true })
const configUrl = join(confDir, 'config.json')
const projDataUrl = join(confDir, 'projData.json') 

function ensureFileExists(filePath, defaultResource) {
  if (!fs.existsSync(filePath)) {
    fs.copyFileSync(defaultResource, filePath)
  }
}
const defaultConfig = join(__dirname, '../../resources/conf/config.json')
const defaultProjData = join(__dirname, '../../resources/conf/projData.json')
ensureFileExists(configUrl, defaultConfig)
ensureFileExists(projDataUrl, defaultProjData)

let config = {}, projData = {}, upadteInfo = {err: -1, msg: '获取更新信息失败'};
// const updateUrl = "http://127.0.0.1:8181/api/home/getHomeData"
const updateUrl = "http://127.0.0.1:8181/api/info/getInfo?k1=aguato&k2=check_update"
init() // 初始化
checkUpdate() // 检查更新

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    alwaysOnTop: true
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })


  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // 增加mqtt通讯的渲染进程窗口
  mqttServer.browserWindows.push(mainWindow)
  mqttClient.browserWindows.push(mainWindow)

}


app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.whistlestudio.aguato')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.handle('r:test', () => config.mqtt.cmt)

  /* 获取基本信息 */
  ipcMain.handle('r:getBaseInfo', () => ({
    port: mqttServer.port,
    localIP: mqttServer.localIP,
    devices: config.devices,
    projData
  }))
  /* 更改设备列表 */
  ipcMain.handle('r:changeDevInfo', (_, devices) => {
    config.devices = devices
    try {
      fs.writeFileSync(configUrl, JSON.stringify(config, null, 2))
      return {err: 0}
    } catch (err) { return {err: 1, msg: '本地文件同步异常'} }
  })
  /* 修改本地静态数据 */
  function sysncLocalProjData(proj) {
    proj.canvasCache.rawComponents.forEach(comp => {
      if (comp?.props && comp.props.hasOwnProperty('data')) {
        // 如果存在yData属性，则清空
        comp.props.data.forEach(item => {
          if (item.hasOwnProperty('logs')) item.logs = []
        })
        if (comp.props.hasOwnProperty("time")) comp.props.time = []
        comp.props.isInit = true // 重置为初始状态
      }
      if (comp?.props && comp.props.hasOwnProperty('value')) {
        // 如果存在value属性，则重置为0
        comp.props.value = ""
        comp.props.isInit = true
      }
    })
    if (proj.hasOwnProperty('connected')) proj.connected = 0 // 重置连接状态
  }

  ipcMain.handle('r:changeProjList', (_, projList) => {
    try {
      projList.forEach(proj => {sysncLocalProjData(proj)})
      projData.list = projList
      fs.writeFileSync(projDataUrl, JSON.stringify(projData, null, 2))
      return {err: 0}
    } catch (err) { console.log(err); return {err: 1, msg: '本地文件同步异常'} }s
  })

  /* mqtt订阅 */
  ipcMain.handle('r:subscribeMqttTopic', async (_, {topic, mqttMode, projId}) => {
    topic = JSON.parse(topic)
    try {
      if (mqttMode == "local") { mqttServer.subscribeTopic(topic.topic); return {err: 0} } // 本地订阅为服务器broker订阅，不需要qos
      else { // 远程订阅需要qos
       return await mqttClient.subscribeRemoteTopic({topic, projId})
      } 
    }
    catch (err) { console.log(err); return {err: 1, msg: '订阅主题失败'} }
  })
  /* 修改订阅 */
  ipcMain.handle('r:modifyMqttTopic', async (_, {newTopic, oldTopic, mqttMode, projId}) => {
    newTopic = JSON.parse(newTopic)
    oldTopic = JSON.parse(oldTopic)
    try {
      if (mqttMode == "local") {
        mqttServer.modifyTopic({newTopic: newTopic.topic, oldTopic: oldTopic.topic}) // 本地订阅为服务器broker订阅，不需要qos
        return {err: 0}
      } else {
        mqttClient.unsubscribeRemoteTopic({topic: oldTopic.topic, projId}) // 取消订阅直接给topic
        return await mqttClient.subscribeRemoteTopic({topic: newTopic, projId}) // 远程订阅需要qos
      }
    } catch (err) {
      console.log(err); 
      return {err: 1, msg: '修改订阅失败'}
    }
  })
  /* maqtt发布 */
  ipcMain.handle('r:publishMqtt', (_, payload) => {
    try {
      if (payload.mqttMode == "local") { mqttServer.publishTopic(payload.packet); return {err: 0} }
      else { mqttClient.publishRemoteTopic(payload); return {err: 0} } 
    } catch (err) { console.log(err); return {err: 1, msg: '发布主题失败'} }
  })

  /* 建立远程服务连接 */
  ipcMain.handle("r:connectRemoteMqtt", async (_, payload) => {
    try {
      payload = JSON.parse(payload)
      // console.log(payload)
      const { projId, ip, port, clientID, username, password, subTopics } = payload;
      const res = await mqttClient.connectRemoteMqtt({ projId, ip, port, clientID, username, password, subTopics });
      if (res.err) return res; // 连接失败
      // 更新项目列表
      projData.list.forEach(proj => {
        if (proj.id == projId) {
          proj.connected = 0;
          proj.mode = "remote";
          proj.clientID = clientID;
          proj.ip = ip;
          proj.port = port;
          proj.username = username;
          proj.password = password;
        }
        // sysncLocalProjData(proj)
      })
      fs.writeFileSync(projDataUrl, JSON.stringify(projData, null, 2))
      return { err: 0 }
    } catch (err) { 
      console.log(err);
       return { err: 1, msg: err.msg || '连接失败' } }
  })

  /* 断开远程服务连接 */
  ipcMain.handle("r:disconnectRemoteMqtt", async (_, payload) => {
    try {
      mqttClient.disconnectRemoteMqtt(payload)
      return { err: 0 }
    } catch (err) {
      console.log(err);
      return { err: 1, msg: '操作异常' }
    }
  })

  /* 删除项目时调整 */
  ipcMain.on("r:deleteProj", (_, proj) => {
    proj = JSON.parse(proj)
    try {
      if (proj.mode === "local") {
        proj.subTopics.forEach(item => {
          mqttServer.unsubscribeTopic(item.topic) // 本地取消订阅主题
        })
      } else {
        if (proj.connected < 2) return; // 未连接时不用断开连接
        mqttClient.disconnectRemoteMqtt({projId: proj.id, clientID: proj.clientID})
      }
    } catch(e) {console.log(e)}
  })

  /* 删除订阅 */
  ipcMain.on("r:deleteSubTopic", (_, payload) => {
    payload = JSON.parse(payload)
    try {
      if (payload.mqttMode == "local") {
        mqttServer.unsubscribeTopic(payload.topic.topic)
      } else {
        mqttClient.unsubscribeRemoteTopic({projId: payload.projId, topic: payload.topic.topic})
      }
      return { err: 0 }
    } catch (err) {
      console.log(err);
      return { err: 1, msg: '取消订阅失败' }
    }
  })

  /* 选择背景图片 */
  ipcMain.handle("r:chooseCover", async (_, projId) => {
    //打开文件选择对话框
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }
      ]
    })
    // 获取选择的文件路径
    if (result.canceled) {
      return { err: 1, msg: '未选择文件' }
    } else {
      const filePath = result.filePaths[0]
      try {
        const data = fs.readFileSync(filePath);
        return { err: 0, destPath: `data:image/jpeg;base64,${data.toString('base64')}` }
      } catch (err) {console.log(err); return { err: 1, msg: '文件读取失败' } }
    }
  })

  /* 删除背景图片 */
  // ipcMain.handle("r:deleteCover", (_, idx) => {
  //   try {
  //     if (idx < 0 || idx >= projData.list.length) return { err: 1, msg: '项目索引错误' }
  //     projData.list[idx].canvasCache.layout = '' // 清空背景图片
  //     fs.writeFileSync(projDataUrl, JSON.stringify(projData, null, 2))
  //     return { err: 0 }
  //   } catch (err) { console.log(err); return { err: 1, msg: '删除失败' } }
  // })

  /* 获取更新信息 */
  ipcMain.handle("r:getUpdateInfo", _ => { return upadteInfo })

  /* 打开更新网页 */
  ipcMain.on("r:openExternal", (_, url) => {
    shell.openExternal(url)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


/* 初始化 */
function init () {
  try {
    config = JSON.parse(fs.readFileSync(configUrl, 'utf8'))
    projData = JSON.parse(fs.readFileSync(projDataUrl, 'utf8'))
    projData.list.forEach(el => {
      if (el.mode == "local") { // 仅本地模式项目的主题才自动订阅
        el.subTopics.forEach((item, index) => {
          mqttServer.subscribeTopic(item.topic) 
        })
      }
    });
  } catch (err) { console.log('init error: ', err) }
}

/* 检查是否存在更新版本 */
function checkUpdate() {
  // 判断是否存在新版本
  fetch(updateUrl)
    .then(response => response.json())
    .then(res => {
      console.log(res)
      upadteInfo = res || {err: -1, msg: '获取更新信息失败'};
      // if (latestVersion !== currentVersion) {
      //   isOpen.value = true
      // }
    })
    .catch(error => {
      console.error('Error fetching latest version:', error)
    })
}