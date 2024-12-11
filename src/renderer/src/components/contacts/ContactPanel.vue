<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import defaultAvatar from '@renderer/assets/avatar.png'

interface Contact {
  id: string
  name: string
  avatar: string
  type: 'friend' | 'group'
  lastMessage?: string
}

const searchQuery = ref('')
const contacts = ref<Contact[]>([])
const activeTab = ref<'friend' | 'group'>('friend')

const filteredContacts = computed(() => {
  return contacts.value.filter(
    (contact) =>
      contact.type === activeTab.value &&
      (searchQuery.value === '' ||
        contact.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

const fetchContacts = async () => {
  try {
    const friendList = await window.api.bot.getFriends()
    const groupList = await window.api.bot.getGroups()

    contacts.value = [
      ...friendList.map((friend) => ({
        id: friend.id,
        name: friend.name,
        // avatar: friend.avatar,
        avatar: '',
        type: 'friend' as const,
        lastMessage: friend.lastMessage
      })),
      ...groupList.map((group) => ({
        id: group.id,
        name: group.name,
        // avatar: group.avatar,
        avatar: '',
        type: 'group' as const,
        lastMessage: group.lastMessage
      }))
    ]
  } catch (err) {
    console.error('Failed to fetch contacts:', err)
  }
}

const handleAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = defaultAvatar
}

onMounted(fetchContacts)
</script>

<template>
  <div class="contacts">
    <div class="contacts-container">
      <div class="contacts-header">
        <div class="tabs">
          <button
            :class="['tab-btn', { active: activeTab === 'friend' }]"
            @click="activeTab = 'friend'"
          >
            好友
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'group' }]"
            @click="activeTab = 'group'"
          >
            群聊
          </button>
        </div>
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索联系人..."
            class="search-input"
          />
        </div>
      </div>

      <div class="contact-list">
        <template v-if="filteredContacts.length > 0">
          <div v-for="contact in filteredContacts" :key="contact.id" class="contact-item">
            <img
              :src="contact.avatar || defaultAvatar"
              alt="Avatar"
              class="contact-avatar"
              @error="handleAvatarError"
            />
            <div class="contact-info">
              <div class="contact-name">{{ contact.name }}</div>
              <div v-if="contact.lastMessage" class="contact-last-message">
                {{ contact.lastMessage }}
              </div>
            </div>
          </div>
        </template>
        <div v-else class="empty-state">
          {{ activeTab === 'friend' ? '暂无好友' : '暂无群聊' }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contacts-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.contacts-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
}

.tab-btn.active {
  background: #2c3e50;
  color: white;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.contact-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.contact-item:hover {
  background: #f8f9fa;
}

.contact-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.contact-info {
  flex: 1;
}

.contact-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.contact-last-message {
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
</style>
