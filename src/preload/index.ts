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

interface Stats {
  messageCount: number
  activeContactsCount: number
  groupCount: number
}

interface MessageData {
  id: string
  content: string
  sender: string
  timestamp: number
  type: 'text' | 'image' | 'file' | 'other'
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
  onStatsUpdate: (callback: (stats: Stats) => void) => {
    ipcRenderer.on('bot:stats-updated', (_event, stats: Stats) => callback(stats))
  },
  getMessages: () => ipcRenderer.invoke('bot:getMessages'),
  onMessage: (callback: (message: MessageData) => void) => {
    ipcRenderer.on('bot:new-message', (_event, message: MessageData) => callback(message))
  },
  offMessage: (callback: (message: MessageData) => void) => {
    ipcRenderer.removeListener('bot:new-message', (_event, message: MessageData) =>
      callback(message)
    )
  },
  getFriends: () => ipcRenderer.invoke('bot:getFriends'),
  getGroups: () => ipcRenderer.invoke('bot:getGroups')
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
