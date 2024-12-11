<template>
  <div class="settings">
    <div class="settings-container">
      <div class="settings-group">
        <h3>基本设置</h3>
        <div class="setting-item">
          <label>自动回复</label>
          <input type="checkbox" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 100%;
  overflow: hidden;
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
