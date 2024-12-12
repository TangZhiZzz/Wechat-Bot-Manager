<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface MessageData {
  id: string
  content: string
  sender: string
  room: string | null
  timestamp: number
  type: 'text' | 'image' | 'file' | 'other'
}

const searchQuery = ref('')
const messages = ref<MessageData[]>([])

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

// 添加消息过滤功能
const filteredMessages = computed(() => {
  return messages.value.filter(
    (msg) =>
      searchQuery.value === '' ||
      msg.content.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      msg.sender.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 添加消息获取功能
const fetchMessages = async () => {
  try {
    const messageList = await window.api.bot.getMessages()
    messages.value = messageList
  } catch (err) {
    console.error('Failed to fetch messages:', err)
  }
}

// 添加消息监听
const handleNewMessage = (message: MessageData) => {
  messages.value.unshift(message)
}

onMounted(() => {
  fetchMessages()
  window.api.bot.onMessage(handleNewMessage)
})

onUnmounted(() => {
  // 清理消息监听
  window.api.bot.offMessage(handleNewMessage)
})
</script>

<template>
  <div class="messages">
    <div class="messages-container">
      <div class="messages-header">
        <div class="search-box">
          <input v-model="searchQuery" type="text" placeholder="搜索消息..." class="search-input" />
        </div>
      </div>
      <div class="message-list">
        <template v-if="filteredMessages.length > 0">
          <div v-for="message in filteredMessages" :key="message.id" class="message-item">
            <div class="message-sender">
              {{ message.sender + (message.room ? `----群聊(${message.room})` : '') }}
            </div>
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </template>
        <div v-else class="empty-state">暂无消息记录</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.messages {
  height: 100%;
}

.messages-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.messages-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.search-box {
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  height: 0;
}

.message-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 8px;
}

.message-sender {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.message-content {
  color: #34495e;
  margin-bottom: 4px;
  word-break: break-all;
}

.message-time {
  font-size: 12px;
  color: #7f8c8d;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #a4b0be;
  font-size: 14px;
}
</style>
