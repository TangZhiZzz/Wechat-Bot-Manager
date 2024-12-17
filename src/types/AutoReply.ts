export interface AutoReply {
  id: string
  keywords: string[]
  exactMatch: boolean
  replyType: 'text'
  content: string
  enabled: boolean
}
