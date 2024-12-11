import { Wechaty, WechatyBuilder, Contact, Message } from 'wechaty'
import { EventEmitter } from 'events'
import { BOT_CONFIG } from './config'
import * as QRCode from 'qrcode'
import { join } from 'path'
import { app } from 'electron'

export class BotManager extends EventEmitter {
  private bot: Wechaty
  private static instance: BotManager
  private qrcode: string = ''
  private initialized: boolean = false
  private messageCount: number = 0
  private activeContacts: Set<string> = new Set()
  private groupCount: number = 0

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
        // 更新消息统计
        this.messageCount++
        // 记录活跃联系人
        const sender = message.talker()
        this.activeContacts.add(sender.id)
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
}
