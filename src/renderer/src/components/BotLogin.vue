<script setup lang="ts">
import { ref, onMounted } from 'vue'

const qrcodeUrl = ref('')
const isLoggedIn = ref(false)
const userName = ref('')
const loading = ref(true)
const error = ref('')
const scanStatus = ref('')

const checkLoginStatus = async () => {
  try {
    const { loggedIn } = await window.api.bot.getStatus()
    isLoggedIn.value = loggedIn
    return loggedIn
  } catch (err) {
    console.error('Failed to check login status:', err)
    error.value = '检查登录状态失败'
    return false
  } finally {
    loading.value = false
  }
}

const startBot = async () => {
  try {
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
}

// 处理扫码事件
const handleScan = (data: { qrcode: string; status: string; url: string }) => {
  console.log('Received scan event:', data)
  qrcodeUrl.value = data.url
  loading.value = false

  // 更新扫码状态
  switch (data.status) {
    case 'SCAN_WAIT':
      scanStatus.value = '等待扫码'
      break
    case 'SCAN_READ':
      scanStatus.value = '已扫码，等待确认'
      break
    case 'SCAN_CONFIRM':
      scanStatus.value = '已确认，正在登录'
      break
    default:
      scanStatus.value = data.status
  }
}

// 处理登录事件
const handleLogin = (data: { name: string }) => {
  console.log('Received login event:', data)
  isLoggedIn.value = true
  userName.value = data.name
  qrcodeUrl.value = ''
  loading.value = false
  error.value = ''
  scanStatus.value = ''
}

onMounted(async () => {
  try {
    const isLoggedIn = await checkLoginStatus()
    if (!isLoggedIn) {
      await startBot()
    }

    // 注册事件监听
    window.api.bot.onScan(handleScan)
    window.api.bot.onLogin(handleLogin)
  } catch (err) {
    console.error('Error in component mount:', err)
    error.value = '初始化失败'
  }
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
</style>
