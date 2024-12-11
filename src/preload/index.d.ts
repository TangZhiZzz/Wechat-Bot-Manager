import { ElectronAPI } from '@electron-toolkit/preload'
import type { UserInfo, Stats, ContactInfo, RoomInfo, Message } from '../types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      bot: {
        start: () => Promise<{ success: boolean; error?: string }>
        stop: () => Promise<{ success: boolean; error?: string }>
        getStatus: () => Promise<{ loggedIn: boolean; error?: string }>
        getQrcode: () => Promise<{ qrcode: string }>
        onScan: (callback: (data: { qrcode: string; status: string; url: string }) => void) => void
        onLogin: (callback: (data: UserInfo) => void) => void
        getLoginInfo: () => Promise<{
          name?: string
          lastLoginTime?: number
        }>
        currentUser: () => Promise<UserInfo | null>
        getStats: () => Promise<Stats>
        onStatsUpdate: (callback: (stats: Stats) => void) => void
        getFriends: () => Promise<ContactInfo[]>
        getRooms: () => Promise<RoomInfo[]>
        getMessages: () => Promise<Message[]>
        onMessage: (callback: (message: Message) => void) => void
        offMessage: (callback: (message: Message) => void) => void
        refreshQrcode: () => Promise<{ success: boolean; error?: string }>
        offScan: (callback: (data: { qrcode: string; status: string; url: string }) => void) => void
        offLogin: (callback: (data: UserInfo) => void) => void
      }
    }
  }
}
