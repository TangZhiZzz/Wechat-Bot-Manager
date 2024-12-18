<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Stats } from '../../../../types'

const stats = ref<Stats>({
  groupCount: 0,
  friendCount: 0,
  contactCount: 0,
  autoReplyCount: 0
})

// 更新统计信息
const updateStats = (newStats: Stats) => {
  stats.value = newStats
}

onMounted(async () => {
  try {
    // 获取初始统计数据
    const initialStats = await window.api.bot.getStats()
    stats.value = initialStats

    // 监听统计更新
    window.api.bot.onStatsUpdate(updateStats)
  } catch (err) {
    console.error('Failed to fetch stats:', err)
  }
})
</script>

<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <h3>群聊数量</h3>
        <div class="stat-value">{{ stats.groupCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <h3>好友数量</h3>
        <div class="stat-value">{{ stats.friendCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <h3>联系人数量</h3>
        <div class="stat-value">{{ stats.contactCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <h3>自动回复数量</h3>
        <div class="stat-value">{{ stats.autoReplyCount }}</div>
      </div>
    </div>

    <div class="chart-container">
      <div class="chart-card">
        <h3>消息趋势</h3>
        <div class="chart-placeholder">图表开发中...</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.stat-card h3 {
  color: #2c3e50;
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
</style>
