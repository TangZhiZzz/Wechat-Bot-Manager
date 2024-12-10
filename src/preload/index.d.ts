import { ElectronAPI } from '@electron-toolkit/preload'

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
        onLogin: (callback: (data: { name: string }) => void) => void
        getLoginInfo: () => Promise<{
          name?: string
          lastLoginTime?: number
        }>
      }
    }
  }
}
