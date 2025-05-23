import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import mqttServer from './core/mqtt-server'
import configUrl from '../../resources/conf/config.json?commonjs-external&asset'
import projDataUrl from '../../resources/conf/projData.json?commonjs-external&asset'
import fs from 'fs'

let config = {}, projData = {}
init() // 初始化

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 850,
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
      // console.log(projList)
      projData.list = projList
      fs.writeFileSync(projDataUrl, JSON.stringify(projData, null, 2))
      return {err: 0}
    } catch (err) { return {err: 1, msg: '本地文件同步异常'} }
  })
  /* mqtt订阅+修改缓存 */
  ipcMain.handle('r:changeMqttCache', (_, topic) => {
    try {mqttServer.subscribeTopic(topic); return {err: 0}}
    catch (err) { console.log(err); return {err: 1, msg: '订阅主题失败'} }
  })
  /* maqtt发布 */
  ipcMain.handle('r:publishMqtt', (_, packet) => {
    try {
      mqttServer.publishTopic(packet)
      return {err: 0}
    } catch (err) { console.log(err); return {err: 1, msg: '发布主题失败'} }
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })


  /* 🪟创建新的chart窗口 */
  let chartWindow = null;

  ipcMain.handle('r:createChartWindow', (_, proj) => {
    if (chartWindow && !chartWindow.isDestroyed()) {
      chartWindow.focus();
      return;
    }

    console.log('create chart window: ', proj);
    chartWindow = new BrowserWindow({
      width: 1300,
      height: 900,
      show: false,
      autoHideMenuBar: true,
      alwaysOnTop: true, // Ensure the window is always on top
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    });

    chartWindow.on('ready-to-show', () => {
      chartWindow.show();
    });

    chartWindow.on('closed', () => {
      chartWindow = null;
    });

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      chartWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/windows/chart.html');
    } else {
      chartWindow.loadFile(join(__dirname, '../renderer/windows/chart.html'));
    }
  });
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
      el.subTopics.forEach((item, index) => {
        mqttServer.subscribeTopic(item.topic) 
      })
    });
  } catch (err) { console.log('init error: ', err) }
}
