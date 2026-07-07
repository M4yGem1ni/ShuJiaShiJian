<template>
  <header class="site-header">
    <div class="header-inner">
      <div class="logo" @click="$router.push('/')">
        <el-icon :size="22"><TrendCharts /></el-icon>
        <span>浙江数字公益扶贫平台</span>
      </div>
      <nav>
        <el-menu mode="horizontal" :ellipsis="false" router>
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/projects">扶贫项目</el-menu-item>
          <el-menu-item index="/about">平台介绍</el-menu-item>
          <el-menu-item index="/user" v-if="currentUser">个人中心</el-menu-item>
        </el-menu>
      </nav>
      <div class="header-actions">
        <template v-if="currentUser">
          <el-tag type="success" size="small" v-if="currentUser.role === 'admin'">管理员</el-tag>
          <el-tag type="warning" size="small" v-else-if="currentUser.role === 'organization'">组织</el-tag>
          <span style="margin:0 8px;font-size:0.9rem;">{{ currentUser.name }}</span>
          <el-button size="small" @click="logout">退出</el-button>
          <el-button size="small" @click="$router.push('/admin/dashboard')" v-if="currentUser.role === 'admin'">后台管理</el-button>
        </template>
        <template v-else>
          <el-button size="small" @click="emitLogin">登录 / 注册</el-button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const emit = defineEmits(['login'])
const currentUser = ref<any>(null)

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) currentUser.value = JSON.parse(userStr)
})

const emitLogin = () => emit('login')

const logout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  currentUser.value = null
  router.push('/')
}
</script>

<style scoped>
.site-header { background: white; border-bottom: 1px solid #e4e7ed; position: sticky; top: 0; z-index: 100; }
.header-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; height: var(--header-height); }
.logo { display: flex; align-items: center; gap: 8px; font-weight: bold; font-size: 1.05rem; color: var(--primary-color); cursor: pointer; }
.header-actions { display: flex; align-items: center; gap: 8px; }
:deep(.el-menu--horizontal) { border-bottom: none; }
:deep(.el-menu--horizontal .el-menu-item) { border-bottom: none !important; }
</style>
