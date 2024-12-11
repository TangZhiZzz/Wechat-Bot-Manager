<script setup lang="ts">
interface Props {
  userName: string
  isLoggedIn: boolean
}

const props = defineProps<Props>()

const handleLogout = async () => {
  try {
    await window.api.bot.stop()
  } catch (err) {
    console.error('Failed to logout:', err)
  }
}
</script>

<template>
  <div class="bot-dashboard">
    <div class="status-card">
      <div class="status-header">
        <h2>机器人状态</h2>
        <span :class="['status-badge', props.isLoggedIn ? 'online' : 'offline']">
          {{ props.isLoggedIn ? '在线' : '离线' }}
        </span>
      </div>

      <div v-if="props.isLoggedIn" class="user-info">
        <img src="../assets/avatar.png" alt="Avatar" class="avatar" />
        <div class="user-details">
          <h3>{{ props.userName }}</h3>
          <p>当前登录账号</p>
        </div>
      </div>

      <div class="actions">
        <button v-if="props.isLoggedIn" class="action-button logout" @click="handleLogout">
          退出登录
        </button>
      </div>
    </div>

    <div class="stats-cards">
      <div class="stat-card">
        <h3>消息统计</h3>
        <div class="stat-value">0</div>
        <p>今日消息数</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bot-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.status-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.status-header h2 {
  margin: 0;
  color: #333;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-badge.online {
  background: #e6f7e6;
  color: #2e7d32;
}

.status-badge.offline {
  background: #ffebee;
  color: #c62828;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 15px;
}

.user-details h3 {
  margin: 0;
  color: #333;
}

.user-details p {
  margin: 5px 0 0;
  color: #666;
  font-size: 14px;
}

.actions {
  padding-top: 20px;
  display: flex;
  gap: 10px;
}

.action-button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-button.logout {
  background: #ffebee;
  color: #c62828;
}

.action-button.logout:hover {
  background: #ffcdd2;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #333;
  margin: 10px 0;
}

.stat-card p {
  margin: 0;
  color: #666;
  font-size: 14px;
}
</style>
