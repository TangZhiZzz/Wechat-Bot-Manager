<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { AutoReply } from '../../../../types'

const autoReplies = ref<AutoReply[]>([])
const showAddForm = ref(false)
const newReply = ref<AutoReply>({
  id: '',
  keyword: '',
  exactMatch: false,
  replyType: 'text',
  content: '',
  enabled: true
})

const addAutoReply = async () => {
  if (!newReply.value.keyword || !newReply.value.content) return

  const rule = {
    ...newReply.value,
    id: Date.now().toString()
  }

  try {
    await window.api.bot.addAutoReply(rule)
    autoReplies.value.push(rule)

    // 重置表单
    newReply.value = {
      id: '',
      keyword: '',
      exactMatch: false,
      replyType: 'text',
      content: '',
      enabled: true
    }
    showAddForm.value = false
  } catch (err) {
    console.error('Failed to add auto reply:', err)
  }
}

const deleteAutoReply = async (id: string) => {
  try {
    await window.api.bot.deleteAutoReply(id)
    autoReplies.value = autoReplies.value.filter((reply) => reply.id !== id)
  } catch (err) {
    console.error('Failed to delete auto reply:', err)
  }
}

const toggleAutoReply = async (id: string) => {
  const reply = autoReplies.value.find((r) => r.id === id)
  if (reply) {
    try {
      await window.api.bot.updateAutoReply(id, !reply.enabled)
      reply.enabled = !reply.enabled
    } catch (err) {
      console.error('Failed to update auto reply:', err)
    }
  }
}

// 加载自动回复规则
onMounted(async () => {
  try {
    const rules = await window.api.bot.getAutoReplies()
    autoReplies.value = rules
  } catch (err) {
    console.error('Failed to fetch auto replies:', err)
  }
})
</script>

<template>
  <div class="settings">
    <div class="settings-container">
      <div class="settings-group">
        <div class="group-header">
          <h3>自动回复管理</h3>
          <button v-if="!showAddForm" class="add-btn" @click="showAddForm = true">添加规则</button>
        </div>

        <!-- 添加表单 -->
        <div v-if="showAddForm" class="add-form">
          <div class="form-group">
            <label>关键词</label>
            <input v-model="newReply.keyword" type="text" placeholder="输入触发关键词" />
          </div>

          <div class="form-group">
            <label>匹配方式</label>
            <label class="checkbox-label">
              <input v-model="newReply.exactMatch" type="checkbox" />
              完全匹配
            </label>
          </div>

          <div class="form-group">
            <label>回复类型</label>
            <select v-model="newReply.replyType">
              <option value="text">文本</option>
            </select>
          </div>

          <div class="form-group">
            <label>回复内容</label>
            <textarea
              v-model="newReply.content"
              :placeholder="newReply.replyType === 'text' ? '输入回复内容' : '输入图片URL'"
            ></textarea>
          </div>

          <div class="form-actions">
            <button class="cancel-btn" @click="showAddForm = false">取消</button>
            <button class="submit-btn" @click="addAutoReply">添加</button>
          </div>
        </div>

        <!-- 规则列表 -->
        <div class="reply-list">
          <div v-if="autoReplies.length === 0" class="empty-state">暂无自动回复规则</div>
          <div v-for="reply in autoReplies" v-else :key="reply.id" class="reply-item">
            <div class="reply-content">
              <div class="reply-header">
                <span class="keyword">{{ reply.keyword }}</span>
                <span class="badge" :class="reply.exactMatch ? 'exact' : 'fuzzy'">
                  {{ reply.exactMatch ? '完全匹配' : '模糊匹配' }}
                </span>
                <span class="badge" :class="reply.replyType">
                  {{ reply.replyType === 'text' ? '文本' : '图片' }}
                </span>
              </div>
              <div class="reply-body">{{ reply.content }}</div>
            </div>
            <div class="reply-actions">
              <label class="switch">
                <input
                  type="checkbox"
                  :checked="reply.enabled"
                  @change="toggleAutoReply(reply.id)"
                />
                <span class="slider"></span>
              </label>
              <button class="delete-btn" @click="deleteAutoReply(reply.id)">删除</button>
            </div>
          </div>
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
  overflow: auto;
}

.settings-group {
  padding: 20px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.group-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.add-btn {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
}

.form-group input[type='text'],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.submit-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
}

.submit-btn {
  background: #2ecc71;
  color: white;
}

.reply-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.keyword {
  font-weight: 500;
  color: #2c3e50;
}

.badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.badge.exact {
  background: #3498db;
  color: white;
}

.badge.fuzzy {
  background: #95a5a6;
  color: white;
}

.badge.text {
  background: #2ecc71;
  color: white;
}

.badge.image {
  background: #9b59b6;
  color: white;
}

.reply-body {
  color: #7f8c8d;
  font-size: 14px;
}

.reply-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2ecc71;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.delete-btn {
  padding: 4px 8px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #95a5a6;
}
</style>
