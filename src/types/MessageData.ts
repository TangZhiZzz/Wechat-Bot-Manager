export interface MessageData {
  id: string
  content: string
  sender: string
  room: string | null
  timestamp: number
  type: 'text' | 'image' | 'file' | 'other'
}
