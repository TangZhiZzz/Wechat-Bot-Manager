import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { ScanData, UserInfo, Stats, MessageData, AutoReply } from '../types'

const botAPI = {
  start: () => ipcRenderer.invoke('bot:start'),
  stop: () => ipcRenderer.invoke('bot:stop'),
  getIsLoggedIn: () => ipcRenderer.invoke('bot:isLoggedIn'),
  onScan: (callback: (data: ScanData) => void) => {
    ipcRenderer.on('bot:scan', (_event, data: ScanData) => callback(data))
  },
  onLogin: (callback: (loginStatus: boolean) => void) => {
    ipcRenderer.on('bot:logged-in', (_event, loginStatus: boolean) => callback(loginStatus))
  },
  getUserInfo: () => ipcRenderer.invoke('bot:getUserInfo'),
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
  refreshContacts: () => ipcRenderer.invoke('bot:refreshContacts'),
  refreshRooms: () => ipcRenderer.invoke('bot:refreshRooms'),
  getAutoReplies: () => ipcRenderer.invoke('bot:getAutoReplies'),
  addAutoReply: (rule: AutoReply) => ipcRenderer.invoke('bot:addAutoReply', rule),
  deleteAutoReply: (id: string) => ipcRenderer.invoke('bot:deleteAutoReply', id),
  updateAutoReply: (id: string, enabled: boolean) =>
    ipcRenderer.invoke('bot:updateAutoReply', { id, enabled })
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
