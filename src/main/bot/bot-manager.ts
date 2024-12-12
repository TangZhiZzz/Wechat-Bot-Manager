import { Wechaty, WechatyBuilder, Contact, Message as WechatyMessage } from 'wechaty'
import { EventEmitter } from 'events'
import * as QRCode from 'qrcode'
import { join } from 'path'
import { app } from 'electron'
import type { MessageData, ContactInfo, RoomInfo, Stats, AutoReply } from '../../types'
import store from '../store'

export class BotManager extends EventEmitter {
  private bot: Wechaty
  private static instance: BotManager
  private qrcode: string = ''
  private initialized: boolean = false
  private stats: Stats = {
    groupCount: 0,
    friendCount: 0,
    contactCount: 0,
    autoReplyCount: 0
  }
  private messages: MessageData[] = []
  private friends: ContactInfo[] = []
  private rooms: RoomInfo[] = []
  private autoReplies: AutoReply[] = []
  private userName: string = ''

  private constructor() {
    super()
    const userDataPath = app.getPath('userData')
    const memoryCardPath = join(userDataPath, 'memory-card.json')

    this.bot = WechatyBuilder.build({
      name: 'wechaty-bot',
      puppet: 'wechaty-puppet-wechat4u',
      puppetOptions: {
        memory: {
          path: memoryCardPath
        }
      }
    })

    this.friends = store.get('friends', []) as ContactInfo[]
    this.rooms = store.get('rooms', []) as RoomInfo[]
    this.autoReplies = store.get('autoReplies', []) as AutoReply[]

    this.stats.friendCount = this.friends.filter((friend) => friend.friend).length
    this.stats.contactCount = this.friends.length
    this.stats.groupCount = this.rooms.length
    this.stats.autoReplyCount = this.autoReplies.length

    this.initEventHandlers()
  }

  public static getInstance(): BotManager {
    if (!BotManager.instance) {
      BotManager.instance = new BotManager()
    }
    return BotManager.instance
  }

  private initEventHandlers(): void {
    this.bot
      .on('scan', async (qrcode, status) => {
        this.qrcode = qrcode
        try {
          const qrcodeImageUrl = await QRCode.toDataURL(qrcode)
          this.emit('scan', {
            qrcode,
            status,
            url: qrcodeImageUrl
          })
        } catch (error) {
          console.error('Failed to generate QR code:', error)
        }
      })
      .on('login', async (user: Contact) => {
        try {
          const avatarFilebox = await user.avatar()
          const avatarDataUrl = await avatarFilebox.toDataURL()

          const userInfo = {
            name: user.name(),
            id: user.id,
            avatar: avatarDataUrl
          }
          this.userName = user.name()
          this.emit('login', userInfo)
        } catch (error) {
          console.error('Error processing avatar:', error)
          // 如果处理头像失败，发送没有头像的用户信息
          this.emit('login', {
            name: user.name(),
            id: user.id,
            avatar: ''
          })
        }
      })
      .on('ready', async () => {
        this.initialized = true
        this.emitStats()
        this.emit('ready')
      })
      .on('message', async (message: WechatyMessage) => {
        console.log(`Message: ${message}`)
        const content = message.text() // 消息内容

        // 过滤空消息
        if (message.text() === '') return
        // 过滤未知消息
        if (message.type() === this.bot.Message.Type.Unknown) return

        // 记录活跃联系人
        const sender = message.talker()
        const room = message.room() // 是否是群消息
        const roomName = (await room?.topic()) || null // 群名称
        // 存储消息
        const messageData: MessageData = {
          id: message.id,
          content: content,
          sender: sender.name(),
          room: roomName,
          timestamp: message.date().getTime(),
          type: message.type() === this.bot.Message.Type.Text ? 'text' : 'other'
        }
        this.messages.unshift(messageData)
        // 限制消息数量
        if (this.messages.length > 100) {
          this.messages = this.messages.slice(0, 100)
        }

        // 群聊只有被@时才自动回复
        if (room && content.includes('@' + this.userName)) {
          const question = (await message.mentionText()) || content.replace(`@${this.userName}`, '') // 去掉艾特的消息主体
          const matchedRule = this.matchAutoReply(question)
          if (matchedRule) {
            try {
              if (matchedRule.replyType === 'text') {
                await message.say(matchedRule.content)
                // 自动回复的消息也要加到messagesData
                const autoReplyMessageData: MessageData = {
                  id: Date.now().toString(),
                  content:
                    '自动回复: ' +
                    sender.name() +
                    ':' +
                    message.text() +
                    ' -> ' +
                    matchedRule.content,
                  sender: 'auto-reply',
                  room: roomName,
                  timestamp: Date.now(),
                  type: 'text'
                }
                this.messages.unshift(autoReplyMessageData)
                this.emit('message', this.serializeMessage(autoReplyMessageData))
              }
            } catch (error) {
              console.error('Failed to send auto reply:', error)
            }
          }
        } else {
          const matchedRule = this.matchAutoReply(content)

          if (matchedRule) {
            try {
              if (matchedRule.replyType === 'text') {
                await message.say(matchedRule.content)
                // 自动回复的消息也要加到messagesData
                const autoReplyMessageData: MessageData = {
                  id: Date.now().toString(),
                  content:
                    '自动回复: ' +
                    sender.name() +
                    ':' +
                    message.text() +
                    ' -> ' +
                    matchedRule.content,
                  sender: 'auto-reply',
                  room: roomName,
                  timestamp: Date.now(),
                  type: 'text'
                }
                this.messages.unshift(autoReplyMessageData)
                this.emit('message', this.serializeMessage(autoReplyMessageData))
              }
            } catch (error) {
              console.error('Failed to send auto reply:', error)
            }
          }
        }

        // 发送消息事件
        this.emit('message', this.serializeMessage(messageData))
        // 发送统计更新
        this.emitStats()
      })
      .on('logout', (user: Contact, reason?: string) => {
        this.emit('logout', { name: user.name(), reason })
        console.log(`User ${user} logout, reason: ${reason}`)
      })
  }

  // 发送统计信息
  private emitStats() {
    this.emit('stats', this.stats)
  }

  // 重置统计数据
  public resetStats() {
    this.stats = {
      groupCount: 0,
      friendCount: 0,
      contactCount: 0,
      autoReplyCount: 0
    }
    this.emitStats()
  }

  // 获取当前统计数据
  public getStats() {
    return this.stats
  }

  public async start(): Promise<void> {
    try {
      console.log('Starting bot...')
      await this.bot.start()
      this.initialized = true

      console.log('Bot started successfully')
    } catch (error) {
      console.error('Failed to start bot:', error)
      throw error
    }
  }

  public async stop(): Promise<void> {
    try {
      await this.bot.stop()
      this.initialized = false
      if (this.bot.currentUser) {
        this.emit('logout', {
          name: this.bot.currentUser.name(),
          reason: 'user_action'
        })
      }
      console.log('Bot stopped successfully')
    } catch (error) {
      console.error('Failed to stop bot:', error)
      throw error
    }
  }

  public isLoggedIn(): boolean {
    if (!this.initialized) {
      return false
    }
    try {
      const loggedIn = this.bot.isLoggedIn
      if (loggedIn && this.bot.currentUser) {
        return true
      }
      return false
    } catch (error) {
      console.error('Error checking login status:', error)
      return false
    }
  }

  public getQrcode(): string {
    return this.qrcode
  }

  private serializeMessage(message: MessageData): MessageData {
    return {
      id: message.id,
      content: message.content,
      sender: message.sender,
      room: message.room,
      timestamp: message.timestamp,
      type: message.type
    }
  }

  public getMessages(): MessageData[] {
    // 返回序列化后的消息
    return this.messages.map((msg) => this.serializeMessage(msg))
  }

  public async refreshQrcode(): Promise<void> {
    try {
      // 重新调用登录流程
      await this.bot.logout()
      await this.bot.start()
    } catch (error) {
      console.error('Failed to refresh qrcode:', error)
      throw error
    }
  }

  public async getFriends(): Promise<ContactInfo[]> {
    try {
      return this.friends
    } catch (error) {
      console.error('Error getting friends:', error)
      return []
    }
  }

  public async getRooms(): Promise<RoomInfo[]> {
    try {
      return this.rooms
    } catch (error) {
      console.error('Error getting rooms:', error)
      return []
    }
  }

  public async refreshFriends(): Promise<ContactInfo[]> {
    try {
      const thisFriends = await this.bot.Contact.findAll()
      this.friends = await Promise.all(
        thisFriends.map(async (friend) => ({
          id: friend.id,
          name: friend.name(),
          friend: friend.friend() ?? false,
          alias: (await friend.alias()) ?? '',
          signature: friend.payload?.signature ?? '',
          gender: friend.gender() === 1 ? 'male' : 'female'
        }))
      )
      this.stats.friendCount = this.friends.filter((friend) => friend.friend).length
      this.stats.contactCount = this.friends.length
      store.set('friends', this.friends)
      this.emitStats()
      return this.friends
    } catch (error) {
      console.error('Error refreshing friends:', error)
      return []
    }
  }

  public async refreshRooms(): Promise<RoomInfo[]> {
    try {
      const thisRooms = await this.bot.Room.findAll()
      this.rooms = thisRooms.map((room) => ({
        id: room.id,
        name: room.payload?.topic ?? '',
        members: room.payload?.memberIdList ?? []
      }))
      this.stats.groupCount = this.rooms.length

      store.set('rooms', this.rooms)
      this.emitStats()
      return this.rooms
    } catch (error) {
      console.error('Error refreshing rooms:', error)
      return []
    }
  }

  // 添加自动回复规则
  public addAutoReply(rule: AutoReply): void {
    const newRule = {
      ...rule,
      keywords: [...rule.keywords] // 创建关键词数组的副本
    }
    this.autoReplies.push(newRule)
    this.stats.autoReplyCount = this.autoReplies.length
    this.saveAutoReplies()
    this.emitStats()
  }

  // 删除自动回复规则
  public deleteAutoReply(id: string): void {
    this.autoReplies = this.autoReplies.filter((rule) => rule.id !== id)
    this.stats.autoReplyCount = this.autoReplies.length
    this.saveAutoReplies()
    this.emitStats()
  }

  // 更新自动回复规则
  public updateAutoReply(id: string, enabled: boolean): void {
    const rule = this.autoReplies.find((r) => r.id === id)
    if (rule) {
      rule.enabled = enabled
      this.saveAutoReplies()
      this.emitStats()
    }
  }

  // 保存自动回复规则到存储
  private saveAutoReplies(): void {
    store.set('autoReplies', this.autoReplies)
  }

  // 获取所有自动回复规则
  public getAutoReplies(): AutoReply[] {
    return this.autoReplies
  }

  // 检查消息是否匹配规则
  private matchAutoReply(text: string): AutoReply | undefined {
    return this.autoReplies.find((rule) => {
      if (!rule.enabled) return false

      return rule.keywords.some((keyword) => {
        if (rule.exactMatch) {
          return text === keyword
        } else {
          return text.includes(keyword)
        }
      })
    })
  }
}
