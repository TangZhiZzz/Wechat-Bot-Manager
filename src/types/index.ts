export interface UserInfo {
  name: string
  id: string
  avatar: string
}

export interface Stats {
  groupCount: number
  friendCount: number
  contactCount: number
  autoReplyCount: number
}

export interface MessageData {
  id: string
  content: string
  sender: string
  room: string | null
  timestamp: number
  type: 'text' | 'image' | 'file' | 'other'
}

export interface ContactInfo {
  id: string
  name: string
  friend: boolean
  alias: string
  signature: string
  gender: 'male' | 'female'
}

export interface RoomInfo {
  id: string
  name: string
  members: string[]
}

export interface AutoReply {
  id: string
  keywords: string[]
  exactMatch: boolean
  replyType: 'text'
  content: string
  enabled: boolean
}
export enum ScanStatus {
  Unknown = 0,
  Cancel = 1,
  Waiting = 2,
  Scanned = 3,
  Confirmed = 4,
  Timeout = 5
}
export interface QrCodeData {
  qrcode: string
  status: ScanStatus
  url: string
}
