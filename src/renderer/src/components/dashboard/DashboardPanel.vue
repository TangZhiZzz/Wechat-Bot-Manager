<script setup lang="ts">
interface Props {
  stats: {
    messageCount: number
    activeContactsCount: number
    groupCount: number
  }
}

defineProps<Props>()
</script>

<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">💬</div>
        <h3>今日消息</h3>
        <div class="stat-value">{{ stats.messageCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <h3>活跃联系人</h3>
        <div class="stat-value">{{ stats.activeContactsCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <h3>群聊数量</h3>
        <div class="stat-value">{{ stats.groupCount }}</div>
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
