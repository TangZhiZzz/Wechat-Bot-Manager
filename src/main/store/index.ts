import Store from 'electron-store'

// 存储数据，数据会持久化到本地

const store = new Store({
  name: 'wechat-bot-data'
})

export default store
