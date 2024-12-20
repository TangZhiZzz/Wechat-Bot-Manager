<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import defaultAvatar from '@renderer/assets/avatar.png'
import type { ContactInfo, RoomInfo } from '../../../../types'

const searchQuery = ref('')
const rooms = ref<RoomInfo[]>([])
const contacts = ref<ContactInfo[]>([])
const loading = ref(false)

const filteredRooms = computed(() => {
  const list = rooms.value
  return list.filter(
    (room) =>
      searchQuery.value === '' || room.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const handleTabChange = async () => {
  try {
    loading.value = true
    const list = await window.api.bot.getRooms()
    rooms.value = list
  } catch (err) {
    console.error(`Failed to fetch :`, err)
  } finally {
    loading.value = false
  }
}

const getRoomName = (id: string) => {
  const room = rooms.value.find((room) => room.id === id)
  const newName = room?.members.map((member) => {
    const room = contacts.value.find((room) => room.id === member)
    return room?.name
  })
  return newName?.join('，')
}

const loadData = async () => {
  rooms.value = await window.api.bot.getRooms()
  contacts.value = await window.api.bot.getContacts()
}

// 初始加载好友列表
onMounted(() => {
  loadData()
  handleTabChange()
})
</script>

<template>
  <div class="rooms">
    <div class="rooms-container">
      <div class="room-list">
        <div class="search-box">
          <div class="search-input-wrapper">
            <i class="search-icon">🔍</i>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="'搜索群聊...'"
              class="search-input"
            />
            <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">✕</button>
          </div>
        </div>

        <div v-if="loading" class="loading-state">加载中...</div>

        <div v-else class="room-section">
          <template v-if="filteredRooms.length > 0">
            <div v-for="room in filteredRooms" :key="room.id" class="room-item">
              <img :src="defaultAvatar" alt="Avatar" class="room-avatar" />
              <div class="room-info">
                <div class="room-name">
                  {{ room.name === '' ? getRoomName(room.id) : room.name }}
                </div>
              </div>
            </div>
          </template>
          <div v-else class="empty-state">暂无群聊</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rooms-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.rooms-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.tabs {
  display: flex;
  gap: 8px;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  font-weight: 500;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #2c3e50;
  color: white;
  transform: translateY(1px);
}

.search-box {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 0 12px;
  transition: all 0.2s;
}

.search-input-wrapper:focus-within {
  background: white;
  box-shadow: 0 0 0 2px #2c3e50;
}

.search-icon {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 0;
  font-size: 14px;
  color: #2c3e50;
  outline: none;
}

.search-input::placeholder {
  color: #999;
}

.clear-btn {
  background: none;
  border: none;
  padding: 4px;
  color: #999;
  cursor: pointer;
  font-size: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #e0e0e0;
  color: #666;
}

.room-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.room-item:hover {
  background: #f8f9fa;
  transform: translateX(4px);
}

.room-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.room-info {
  flex: 1;
}

.room-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.room-last-message {
  font-size: 12px;
  color: #7f8c8d;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #a4b0be;
  font-size: 14px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #a4b0be;
  font-size: 14px;
}

.room-section {
  margin-top: 16px;
}

.refresh-btn {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: auto;
}

.refresh-btn:hover:not(:disabled) {
  background: #2980b9;
}

.refresh-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}
</style>
