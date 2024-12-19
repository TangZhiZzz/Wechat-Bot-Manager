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
export enum MessageType {
  Unknown = 0,

  Attachment = 1, // Attach(6),
  Audio = 2, // Audio(1), Voice(34)
  Contact = 3, // ShareCard(42)
  ChatHistory = 4, // ChatHistory(19)
  Emoticon = 5, // Sticker: Emoticon(15), Emoticon(47)
  Image = 6, // Img(2), Image(3)
  Text = 7, // Text(1)
  Location = 8, // Location(48)
  MiniProgram = 9, // MiniProgram(33)
  GroupNote = 10, // GroupNote(53)
  Transfer = 11, // Transfers(2000)
  RedEnvelope = 12, // RedEnvelopes(2001)
  Recalled = 13, // Recalled(10002)
  Url = 14, // Url(5)
  Video = 15, // Video(4), Video(43)
  Post = 16 // Moment, Channel, Tweet, etc
}
export interface MessageData {
  id: string
  content: string
  sender: string
  room: string | null
  timestamp: number
  type: MessageType
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
