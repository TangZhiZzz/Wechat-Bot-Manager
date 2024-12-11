import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

interface ScanData {
  qrcode: string
  status: string
  url: string
}

interface UserInfo {
  name: string
  id: string
  avatar: string
}

const botAPI = {
  start: () => ipcRenderer.invoke('bot:start'),
  stop: () => ipcRenderer.invoke('bot:stop'),
  getStatus: () => ipcRenderer.invoke('bot:status'),
  getQrcode: () => ipcRenderer.invoke('bot:qrcode'),
  onScan: (callback: (data: ScanData) => void) => {
    ipcRenderer.on('bot:scan', (_event, data: ScanData) => callback(data))
  },
  onLogin: (callback: (data: UserInfo) => void) => {
    ipcRenderer.on('bot:logged-in', (_event, data: UserInfo) => callback(data))
  },
  getStats: () => ipcRenderer.invoke('bot:getStats'),
  onStatsUpdate: (callback: (stats: any) => void) => {
    ipcRenderer.on('bot:stats-updated', (_event, stats) => callback(stats))
  }
}

// 更新 API 对象
const api = {
  bot: botAPI
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
