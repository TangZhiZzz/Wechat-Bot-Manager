import Store from 'electron-store'
import { MessageData, ContactInfo, RoomInfo, Stats } from '../../types'

interface StoreSchema {
  messages: MessageData[]
  friends: ContactInfo[]
  rooms: RoomInfo[]
  stats: Stats
}

const store = new Store<StoreSchema>({
  name: 'wechat-bot-data',
  defaults: {
    messages: [],
    friends: [],
    rooms: [],
    stats: {}
  }
})
export default store
