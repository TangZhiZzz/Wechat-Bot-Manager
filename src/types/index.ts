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
  messageCount: number
  activeContacts: Set<string>
  groupCount: number
  friendCount: number
  contactCount: number
}

export interface MessageData {
  id: string
  content: string
  sender: string
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
