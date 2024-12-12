import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { ScanData, UserInfo, Stats, MessageData } from '../types'

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
  getRooms: () => ipcRenderer.invoke('bot:getRooms'),
  offScan: (callback: (data: ScanData) => void) => {
    ipcRenderer.removeListener('bot:scan', (_event, data: ScanData) => callback(data))
  },
  offLogin: (callback: (data: UserInfo) => void) => {
    ipcRenderer.removeListener('bot:logged-in', (_event, data: UserInfo) => callback(data))
  },
  refreshFriends: () => ipcRenderer.invoke('bot:refreshFriends'),
  refreshRooms: () => ipcRenderer.invoke('bot:refreshRooms')
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
