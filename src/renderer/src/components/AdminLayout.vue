<script setup lang="ts">
import { onMounted, ref } from 'vue'
import DashboardPanel from './dashboard/DashboardPanel.vue'
import MessagePanel from './messages/MessagePanel.vue'
import ContactPanel from './contacts/ContactPanel.vue'
import SettingPanel from './settings/SettingPanel.vue'

import { UserInfo } from '../../../types'

const emit = defineEmits<{
  logout: [boolean]
}>()
const currentTab = ref('dashboard')
const currUserInfo = ref<UserInfo>()

const handleLogout = async () => {
  try {
    await window.api.bot.stop()
    // 触发父组件的登出处理
    emit('logout', false)
  } catch (err) {
    console.error('Failed to logout:', err)
  }
}

const handleAvatarError = (e: Event) => {
  // 如果头像加载失败，使用默认头像
  const img = e.target as HTMLImageElement
  img.src = '../assets/avatar.png'
}

onMounted(async () => {
  const userInfo = await window.api.bot.getUserInfo()
  currUserInfo.value = userInfo ?? undefined
})
</script>

<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <img
          :src="currUserInfo?.avatar || '../assets/avatar.png'"
          alt="Avatar"
          class="avatar"
          @error="handleAvatarError"
        />
        <div class="user-info">
          <h3>{{ currUserInfo?.name }}</h3>
        </div>
      </div>

      <nav class="nav-menu">
        <a
          href="#"
          :class="{ active: currentTab === 'dashboard' }"
          @click.prevent="currentTab = 'dashboard'"
        >
          <i class="icon">📊</i>
          仪表盘
        </a>
        <a
          href="#"
          :class="{ active: currentTab === 'messages' }"
          @click.prevent="currentTab = 'messages'"
        >
          <i class="icon">💬</i>
          消息记录
        </a>
        <a
          href="#"
          :class="{ active: currentTab === 'contacts' }"
          @click.prevent="currentTab = 'contacts'"
        >
          <i class="icon">👥</i>
          联系人
        </a>
        <a
          href="#"
          :class="{ active: currentTab === 'settings' }"
          @click.prevent="currentTab = 'settings'"
        >
          <i class="icon">⚙️</i>
          设置
        </a>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="handleLogout">
          <i class="icon">🚪</i>
          退出登录
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <div class="content-header">
        <h1>
          {{
            currentTab === 'dashboard'
              ? '仪表盘'
              : currentTab === 'messages'
                ? '消息记录'
                : currentTab === 'contacts'
                  ? '联系人'
                  : '设置'
          }}
        </h1>
      </div>

      <div class="content-body">
        <DashboardPanel v-if="currentTab === 'dashboard'" />
        <MessagePanel v-else-if="currentTab === 'messages'" />
        <ContactPanel v-else-if="currentTab === 'contacts'" />
        <SettingPanel v-else-if="currentTab === 'settings'" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #f5f5f5;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
}

.sidebar {
  width: 220px;
  background: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-header {
  padding: 16px;
  background: #243342;
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.user-info h3 {
  margin: 0;
  font-size: 14px;
  color: white;
}

.nav-menu {
  flex: 1;
  padding: 12px 0;
}

.nav-menu a {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  color: #a4b0be;
  text-decoration: none;
  transition: all 0.2s;
  gap: 8px;
  font-size: 14px;
}

.nav-menu a:hover,
.nav-menu a.active {
  background: #34495e;
  color: white;
}

.icon {
  font-size: 16px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #34495e;
}

.logout-btn {
  width: 100%;
  padding: 8px;
  border: none;
  background: #c0392b;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}

.logout-btn:hover {
  background: #e74c3c;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: 220px;
  width: calc(100vw - 220px);
  height: 100vh;
}

.content-header {
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 10;
}

.content-header h1 {
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
}

.content-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  height: calc(100vh - 60px);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #2c3e50;
  margin: 12px 0;
}

.chart-container {
  margin-top: 32px;
}

.chart-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a4b0be;
  border: 2px dashed #eee;
  border-radius: 8px;
  margin-top: 16px;
}

.messages-container,
.contacts-container,
.settings-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 100%;
  overflow: hidden;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #a4b0be;
  font-size: 14px;
}

.settings-group {
  padding: 20px;
}

.settings-group h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #2c3e50;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.setting-item label {
  color: #2c3e50;
  font-size: 14px;
}
</style>
