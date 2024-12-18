import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  UserInfo,
  Stats,
  ContactInfo,
  RoomInfo,
  Message,
  AutoReply,
  QrCodeData
} from '../types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      bot: {
        start: () => Promise<{ success: boolean; error?: string }>
        stop: () => Promise<{ success: boolean; error?: string }>
        getIsLoggedIn: () => Promise<{ loggedIn: boolean; error?: string }>
        onScan: (callback: (data: QrCodeData) => void) => void
        onLogin: (callback: (loginStatus: boolean) => void) => void
        getLoginInfo: () => Promise<{
          name?: string
          lastLoginTime?: number
        }>
        getUserInfo: () => Promise<UserInfo | null>
        getStats: () => Promise<Stats>
        onStatsUpdate: (callback: (stats: Stats) => void) => void
        getFriends: () => Promise<ContactInfo[]>
        getRooms: () => Promise<RoomInfo[]>
        getMessages: () => Promise<Message[]>
        onMessage: (callback: (message: Message) => void) => void
        offMessage: (callback: (message: Message) => void) => void
        refreshQrcode: () => Promise<{ success: boolean; error?: string }>
        offScan: (callback: (data: QrCodeData) => void) => void
        offLogin: (callback: (loginStatus: boolean) => void) => void
        refreshContacts: () => Promise<ContactInfo[]>
        refreshRooms: () => Promise<RoomInfo[]>
        getAutoReplies: () => Promise<AutoReply[]>
        addAutoReply: (rule: AutoReply) => Promise<{ success: boolean; error?: string }>
        deleteAutoReply: (id: string) => Promise<{ success: boolean; error?: string }>
        updateAutoReply: (
          id: string,
          enabled: boolean
        ) => Promise<{ success: boolean; error?: string }>
      }
    }
  }
}
