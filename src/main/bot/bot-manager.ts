import { Wechaty, WechatyBuilder, Contact, Message } from 'wechaty'
import { EventEmitter } from 'events'
import { BOT_CONFIG } from './config'
import * as QRCode from 'qrcode'
import { join } from 'path'
import { app } from 'electron'

interface MessageData {
  id: string
  content: string
  sender: string
  timestamp: number
  type: 'text' | 'image' | 'file' | 'other'
}

export class BotManager extends EventEmitter {
  private bot: Wechaty
  private static instance: BotManager
  private qrcode: string = ''
  private initialized: boolean = false
  private messageCount: number = 0
  private activeContacts: Set<string> = new Set()
  private groupCount: number = 0
  private messages: MessageData[] = []

  private constructor() {
    super()
    const userDataPath = app.getPath('userData')
    const memoryCardPath = join(userDataPath, 'memory-card.json')

    this.bot = WechatyBuilder.build({
      name: BOT_CONFIG.name,
      puppet: 'wechaty-puppet-wechat4u',
      puppetOptions: {
        memory: {
          path: memoryCardPath
        }
      }
    })

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
          console.log('New QR Code:', { status })
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
          console.log('user', user)
          const avatarFilebox = await user.avatar()
          const avatarDataUrl = await avatarFilebox.toDataURL()

          const userInfo = {
            name: user.name(),
            id: user.id,
            avatar: avatarDataUrl
          }
          this.emit('login', userInfo)
          console.log(`User ${user.name()} logged in`)
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
        // 获取群聊数量
        const rooms = await this.bot.Room.findAll()
        this.groupCount = rooms.length
        this.emitStats()
        this.emit('ready')
      })
      .on('message', async (message: Message) => {
        console.log(`Message: ${message}`)
        if (message.type() === this.bot.Message.Type.Unknown) {
          return
        }
        // 更新消息统计
        this.messageCount++
        // 记录活跃联系人
        const sender = message.talker()
        this.activeContacts.add(sender.id)

        // 存储消息
        const messageData = {
          id: message.id,
          content: message.text(),
          sender: sender.name(),
          timestamp: message.date().getTime(),
          type: message.type() === this.bot.Message.Type.Text ? 'text' : 'other'
        } as MessageData
        this.messages.unshift(messageData)
        // 限制消息数量
        if (this.messages.length > 100) {
          this.messages = this.messages.slice(0, 100)
        }

        // 发送消息事件
        this.emit('message', messageData)
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
    this.emit('stats', {
      messageCount: this.messageCount,
      activeContactsCount: this.activeContacts.size,
      groupCount: this.groupCount
    })
  }

  // 重置统计数据
  public resetStats() {
    this.messageCount = 0
    this.activeContacts.clear()
    this.emitStats()
  }

  // 获取当前统计数据
  public getStats() {
    return {
      messageCount: this.messageCount,
      activeContactsCount: this.activeContacts.size,
      groupCount: this.groupCount
    }
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

  public async getFriends() {
    if (!this.isLoggedIn()) {
      return []
    }
    try {
      const friends = await this.bot.Contact.findAll()
      console.log('friends', friends)
      return Promise.all(
        friends
          .filter((friend) => friend.type() === this.bot.Contact.Type.Individual)
          .map(async (friend) => ({
            id: friend.id,
            name: friend.name(),
            // avatar: await friend
            //   .avatar()
            //   .then((box) => box.toDataURL())
            //   .catch(() => ''),
            avatar: '',
            lastMessage: '' // TODO: 获取最后一条消息
          }))
      )
    } catch (error) {
      console.error('Failed to get friends:', error)
      return []
    }
  }

  public async getGroups() {
    if (!this.isLoggedIn()) {
      return []
    }
    try {
      const rooms = await this.bot.Room.findAll()
      return Promise.all(
        rooms.map(async (room) => ({
          id: room.id,
          name: await room.topic(),
          // avatar: await room.avatar().then((box) => box.toDataURL()),
          avatar: '',
          lastMessage: '' // TODO: 获取最后一条消息
        }))
      )
    } catch (error) {
      console.error('Failed to get groups:', error)
      return []
    }
  }

  public getMessages(): MessageData[] {
    return this.messages
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
}
