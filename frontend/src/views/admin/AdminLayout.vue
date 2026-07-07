<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="logo">公益平台管理后台</div>
      <el-menu :default-active="route.path" router background-color="#1b4d6e" text-color="rgba(255,255,255,0.8)" active-text-color="#fff">
        <el-menu-item index="/admin/dashboard"><el-icon><DataAnalysis /></el-icon>数据看板</el-menu-item>
        <el-menu-item index="/admin/projects"><el-icon><List /></el-icon>项目管理</el-menu-item>
        <el-menu-item index="/admin/audits"><el-icon><Check /></el-icon>审核管理</el-menu-item>
        <el-menu-item index="/admin/donations"><el-icon><Money /></el-icon>捐赠记录</el-menu-item>
        <el-menu-item index="/admin/funds"><el-icon><Coin /></el-icon>资金流向</el-menu-item>
        <el-menu-item index="/admin/feedbacks"><el-icon><ChatDotRound /></el-icon>反馈管理</el-menu-item>
        <el-menu-item index="/" @click="handleExit"><el-icon><HomeFilled /></el-icon>返回前台</el-menu-item>
      </el-menu>
    </aside>
    <div class="admin-main">
      <header class="admin-header">
        <span>欢迎回来，{{ user?.name }}</span>
        <div>
          <el-button text @click="handleExit">退出登录</el-button>
        </div>
      </header>
      <div class="admin-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DataAnalysis, List, Check, Money, Coin, ChatDotRound, HomeFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const user = ref<any>(null)

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    router.push('/admin/login')
    return
  }
  user.value = JSON.parse(userStr)
  if (user.value.role !== 'admin') {
    router.push('/admin/login')
  }
})

const handleExit = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  router.push('/')
}
</script>
