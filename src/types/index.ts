export interface ScanData {
  qrcode: string
  status: string
  url: string
}

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
