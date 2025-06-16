import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import mqttServer from './core/mqtt-server'
import mqttClient from './core/mqtt-client'
import configUrl from '../../resources/conf/config.json?commonjs-external&asset'
import projDataUrl from '../../resources/conf/projData.json?commonjs-external&asset'
import fs from 'fs'

let config = {}, projData = {}
init() // 初始化

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
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

}


app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

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
  /* 更改项目列表 */
  ipcMain.handle('r:changeProjList', (_, projList) => {
    try {
      projList.forEach(proj => { // 清空yData属性
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
        if (proj.hasOwnProperty('connected')) proj.connected = false // 重置连接状态
      })
      projData.list = projList
      fs.writeFileSync(projDataUrl, JSON.stringify(projData, null, 2))
      return {err: 0}
    } catch (err) { console.log(err); return {err: 1, msg: '本地文件同步异常'} }
  })
  /* mqtt订阅+修改缓存 */
  ipcMain.handle('r:changeMqttCache', (_, payload) => {
    try {
      if (payload.mqttMode == "local") { mqttServer.subscribeTopic(payload.topic); return {err: 0} }
    }
    catch (err) { console.log(err); return {err: 1, msg: '订阅主题失败'} }
  })
  /* maqtt发布 */
  ipcMain.handle('r:publishMqtt', (_, payload) => {
    try {
      if (payload.mqttMode == "local") { mqttServer.publishTopic(payload.packet); return {err: 0} }
    } catch (err) { console.log(err); return {err: 1, msg: '发布主题失败'} }
  })

  /* 建立远程服务连接 */
  ipcMain.handle("r:connectRemoteMqtt", async (_, payload) => {

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
