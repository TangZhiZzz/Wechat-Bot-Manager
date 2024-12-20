import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { BotManager } from './bot/bot-manager'
import type { AutoReply } from '../types'

function createWindow(): BrowserWindow {
  //Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: true
      //devTools: false
    }
  })

  mainWindow.removeMenu()
  //禁用键盘快捷键
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key === 'I')) {
      event.preventDefault()
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.webContents.openDevTools()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  //HMR for renderer base on electron-vite cli.
  //Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

//This method will be called when Electron has finished
//initialization and is ready to create browser windows.
//Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  //Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  //Default open or close DevTools by F12 in development
  //and ignore CommandOrControl + R in production.
  //see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  //IPC test
  ipcMain.on('ping', () => console.log('pong'))

  const mainWindow = createWindow()
  const botManager = BotManager.getInstance()

  //监听扫码事件
  botManager.on('scan', (data) => {
    mainWindow.webContents.send('bot:scan', data)
  })
  //监听登录事件
  botManager.on('login', (data) => {
    mainWindow.webContents.send('bot:logged-in', data)
  })

  //启动服务
  ipcMain.handle('bot:start', async () => {
    try {
      await botManager.start()
      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })
  //停止服务
  ipcMain.handle('bot:stop', async () => {
    try {
      await botManager.stop()
      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  //获取是否登录
  ipcMain.handle('bot:isLoggedIn', () => {
    try {
      return { loggedIn: botManager.isLoggedIn() }
    } catch (error: unknown) {
      console.error('Error getting status:', error)
      return { loggedIn: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('bot:getUserInfo', () => {
    return botManager.getUserInfo()
  })

  //添加统计相关的 IPC 处理
  ipcMain.handle('bot:getStats', () => {
    return botManager.getStats()
  })

  //添加获取联系人的 IPC 处理
  ipcMain.handle('bot:getContacts', async () => {
    return botManager.getContacts()
  })

  ipcMain.handle('bot:getRooms', async () => {
    return botManager.getRooms()
  })

  //添加消息相关的 IPC 处理
  ipcMain.handle('bot:getMessages', () => {
    return botManager.getMessages()
  })

  //添加刷新二维码的 IPC 处理
  ipcMain.handle('bot:refreshQrcode', async () => {
    try {
      await botManager.refreshQrcode()
      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  //添加刷新联系人
  ipcMain.handle('bot:refreshContacts', async () => {
    return botManager.refreshContacts()
  })
  //刷新群组
  ipcMain.handle('bot:refreshRooms', async () => {
    return botManager.refreshRooms()
  })

  //获取自动回复
  ipcMain.handle('bot:getAutoReplies', () => {
    return botManager.getAutoReplies()
  })
  //添加自动回复
  ipcMain.handle('bot:addAutoReply', (_event, rule: AutoReply) => {
    return botManager.addAutoReply(rule)
  })

  ipcMain.handle('bot:deleteAutoReply', (_event, id: string) => {
    return botManager.deleteAutoReply(id)
  })

  ipcMain.handle(
    'bot:updateAutoReply',
    (_event, { id, enabled }: { id: string; enabled: boolean }) => {
      return botManager.updateAutoReply(id, enabled)
    }
  )

  //监听消息事件并转发到渲染进程
  botManager.on('message', (message) => {
    mainWindow.webContents.send('bot:new-message', message)
  })

  //监听统计更新并转发到渲染进程
  botManager.on('stats', (stats) => {
    mainWindow.webContents.send('bot:stats-updated', stats)
  })

  app.on('activate', function () {
    //On macOS it's common to re-create a window in the app when the
    //dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

//Quit when all windows are closed, except on macOS. There, it's common
//for applications and their menu bar to stay active until the user quits
//explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

//In this file you can include the rest of your app"s specific main process
//code. You can also put them in separate files and require them here.
