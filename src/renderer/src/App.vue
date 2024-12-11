<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BotLogin from './components/BotLogin.vue'
import AdminLayout from './components/AdminLayout.vue'

interface UserInfo {
  name: string
  id: string
  avatar: string
}

const isLoggedIn = ref(false)
const userInfo = ref<UserInfo | null>(null)

// 从 localStorage 恢复登录状态
const restoreLoginState = () => {
  const savedState = localStorage.getItem('loginState')
  if (savedState) {
    const state = JSON.parse(savedState)
    isLoggedIn.value = state.loggedIn
    userInfo.value = state.userInfo
  }
}

// 保存登录状态到 localStorage
const saveLoginState = (loggedIn: boolean, info?: UserInfo) => {
  localStorage.setItem(
    'loginState',
    JSON.stringify({
      loggedIn,
      userInfo: info || null
    })
  )
}

const handleLoginStatusChange = (status: boolean, info?: UserInfo) => {
  isLoggedIn.value = status
  userInfo.value = info || null
  saveLoginState(status, info)
}

// 组件加载时恢复登录状态
onMounted(async () => {
  restoreLoginState()
  // 如果有存储的登录状态，验证是否真的登录了
  if (isLoggedIn.value) {
    try {
      const { loggedIn } = await window.api.bot.getStatus()
      if (!loggedIn) {
        // 如果实际未登录，清除存储的状态
        handleLoginStatusChange(false)
      }
    } catch (err) {
      console.error('Failed to verify login status:', err)
      handleLoginStatusChange(false)
    }
  }
})
</script>

<template>
  <BotLogin v-if="!isLoggedIn" @login="handleLoginStatusChange(true, $event)" />
  <AdminLayout
    v-else
    :userInfo="userInfo"
    :isLoggedIn="isLoggedIn"
    @logout="handleLoginStatusChange(false)"
  />
</template>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    'Open Sans', 'Helvetica Neue', sans-serif;
}

* {
  box-sizing: border-box;
}
</style>
