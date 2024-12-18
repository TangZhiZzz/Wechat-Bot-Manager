<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BotLogin from './components/BotLogin.vue'
import AdminLayout from './components/AdminLayout.vue'

const isLoggedIn = ref(false)

const handleLoginStatusChange = (LoginStatus: boolean) => {
  isLoggedIn.value = LoginStatus
}

// 组件加载时恢复登录状态
onMounted(async () => {
  const { loggedIn } = await window.api.bot.getIsLoggedIn()
  isLoggedIn.value = loggedIn
})
</script>

<template>
  <BotLogin v-if="!isLoggedIn" @login="handleLoginStatusChange(true)" />
  <AdminLayout v-else @logout="handleLoginStatusChange(false)" />
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
