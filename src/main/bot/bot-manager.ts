import { Wechaty, WechatyBuilder, Contact, Message } from 'wechaty'
import { EventEmitter } from 'events'
import { BOT_CONFIG } from './config'
import * as QRCode from 'qrcode'
import { KnowledgeBase } from './knowledge-base'

export class BotManager extends EventEmitter {
  private bot: Wechaty
  private static instance: BotManager
  private qrcode: string = ''
  private initialized: boolean = false
  private knowledgeBase: KnowledgeBase

  private constructor() {
    super()
    this.bot = WechatyBuilder.build({
      name: BOT_CONFIG.name
    })
    this.knowledgeBase = KnowledgeBase.getInstance()
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
      .on('login', (user: Contact) => {
        const name = user.name()
        this.emit('login', { name })
        console.log(`User ${name} logged in`)
      })
      .on('ready', () => {
        this.initialized = true
        this.emit('ready')
      })
      .on('message', async (message: Message) => {
        console.log(`Message: ${message}`)

        if (message.type() === this.bot.Message.Type.Text) {
          const text = message.text()
          const answer = this.knowledgeBase.findAnswer(text)

          if (answer) {
            await message.say(answer)
          }
        }
      })
      .on('logout', (user: Contact, reason?: string) => {
        this.emit('logout', { name: user.name(), reason })
        console.log(`User ${user} logout, reason: ${reason}`)
      })
  }

  public async start(): Promise<void> {
    try {
      console.log('Starting bot...')
      await this.bot.start()
      this.initialized = true

      if (this.isLoggedIn()) {
        const user = this.bot.currentUser
        if (user) {
          this.emit('login', { name: user.name() })
        }
      }

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
      return this.bot.isLoggedIn
    } catch (error) {
      console.error('Error checking login status:', error)
      return false
    }
  }

  public getQrcode(): string {
    return this.qrcode
  }
}
