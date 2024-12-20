<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { QrCodeData, ScanStatus } from '../../../types'

const qrcodeUrl = ref('')
const isLoggedIn = ref(false)
const userName = ref('')
const loading = ref(true)
const error = ref('')
const scanStatus = ref('')
const refreshing = ref(false)

// 定义 emit
const emit = defineEmits<{
  login: [boolean]
}>()

// 添加刷新二维码方法
const refreshQrcode = async () => {
  try {
    refreshing.value = true
    error.value = ''
    await window.api.bot.refreshQrcode()
  } catch (err) {
    console.error('Failed to refresh qrcode:', err)
    error.value = '刷新二维码失败'
  } finally {
    refreshing.value = false
  }
}

// 处理扫码事件
const handleScan = (data: QrCodeData) => {
  qrcodeUrl.value = data.url
  loading.value = false
  refreshing.value = false

  // 更新扫码状态
  switch (data.status) {
    case ScanStatus.Waiting:
      scanStatus.value = '等待扫码'
      break
    case ScanStatus.Scanned:
      scanStatus.value = '已扫码，等待确认'
      break
    case ScanStatus.Confirmed:
      scanStatus.value = '已确认，正在登录'
      break
    case ScanStatus.Timeout:
      scanStatus.value = '二维码已过期，请刷新'
      break
    default:
      scanStatus.value = `扫码状态: ${data.status}`
  }
}

// 处理登录事件
const handleLogin = (loginStatus: boolean) => {
  isLoggedIn.value = loginStatus
  // 触发登录事件，传递完整的用户信息
  emit('login', loginStatus)
}

// 添加事件清理函数
const cleanupListeners = () => {
  window.api.bot.offScan?.(handleScan)
  window.api.bot.offLogin?.(handleLogin)
}

onMounted(async () => {
  try {
    // 先清理可能存在的旧监听器
    cleanupListeners()

    // 添加新的监听器
    window.api.bot.onScan(handleScan)
    window.api.bot.onLogin(handleLogin)

    // 启动机器人
    loading.value = true
    error.value = ''
    const { success, error: startError } = await window.api.bot.start()
    if (!success && startError) {
      error.value = `启动失败: ${startError}`
      console.error('Failed to start bot:', startError)
    }
  } catch (err) {
    console.error('Error starting bot:', err)
    error.value = '启动失败'
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  cleanupListeners()
})
</script>

<template>
  <div class="bot-login">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    <div v-else-if="isLoggedIn" class="login-status">
      <h2>已登录</h2>
      <p>用户名: {{ userName }}</p>
    </div>
    <div v-else class="login-container">
      <h2>请扫码登录</h2>
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>正在加载...</p>
      </div>
      <template v-else-if="qrcodeUrl">
        <img :src="qrcodeUrl" alt="Login QR Code" class="qrcode" />
        <p class="scan-status">{{ scanStatus }}</p>
        <button
          v-if="scanStatus.includes('过期')"
          class="refresh-btn"
          :disabled="refreshing"
          @click="refreshQrcode"
        >
          {{ refreshing ? '刷新中...' : '刷新二维码' }}
        </button>
      </template>
      <p v-else>正在获取二维码...</p>
    </div>
  </div>
</template>

<style scoped>
.bot-login {
  padding: 20px;
  text-align: center;
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.qrcode {
  width: 200px;
  height: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  background: white;
}

.login-status {
  padding: 20px;
  background: #f0f0f0;
  border-radius: 8px;
}

.error-message {
  color: #ff4444;
  padding: 10px;
  margin: 10px 0;
  background: #ffeeee;
  border-radius: 4px;
}

.loading {
  padding: 20px;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.scan-status {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.refresh-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #2980b9;
}

.refresh-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}
</style>
