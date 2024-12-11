import { ElectronAPI } from '@electron-toolkit/preload'

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

interface ContactInfo {
  id: string
  name: string
  avatar: string
  lastMessage?: string
}

interface Message {
  id: string
  content: string
  sender: string
  timestamp: number
  type: 'text' | 'image' | 'file' | 'other'
}

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
        getGroups: () => Promise<ContactInfo[]>
        getMessages: () => Promise<Message[]>
        onMessage: (callback: (message: Message) => void) => void
        offMessage: (callback: (message: Message) => void) => void
        refreshQrcode: () => Promise<{ success: boolean; error?: string }>
      }
    }
  }
}
