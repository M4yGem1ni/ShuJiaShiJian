<template>
  <div>
    <header class="site-header">
      <div class="header-inner">
        <div class="logo" @click="$router.push('/')">
          <el-icon :size="24"><TrendCharts /></el-icon>
          <span>浙江数字公益扶贫平台</span>
        </div>
        <nav>
          <el-menu mode="horizontal" :ellipsis="false" router>
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/projects">扶贫项目</el-menu-item>
            <el-menu-item index="/about">平台介绍</el-menu-item>
          </el-menu>
        </nav>
        <div class="header-actions">
          <el-button size="small" @click="$router.push('/')">返回首页</el-button>
        </div>
      </div>
    </header>

    <div class="register-container">
      <el-card style="width:420px;">
        <h2 style="text-align:center;margin-bottom:24px;">注册账号</h2>
        <el-form :model="form" label-width="80px">
          <el-form-item label="昵称">
            <el-input v-model="form.name" placeholder="请输入昵称" size="large" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="form.phone" placeholder="请输入手机号" size="large" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="form.password" type="password" placeholder="请设置密码" size="large" show-password />
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" size="large" show-password />
          </el-form-item>
        </el-form>
        <el-button type="primary" size="large" @click="handleRegister" :loading="loading" style="width:100%;margin-top:8px;">
          注册
        </el-button>
        <div style="text-align:center;margin-top:16px;">
          <span style="font-size:0.85rem;color:#909399;">已有账号？</span>
          <el-button text size="small" @click="$router.push('/')">立即登录</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register as apiRegister } from '../api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const form = ref({ name: '', phone: '', password: '', confirmPassword: '' })
const loading = ref(false)

const handleRegister = async () => {
  const { name, phone, password, confirmPassword } = form.value
  if (!name || !phone || !password) {
    ElMessage.warning('请填写所有必填字段')
    return
  }
  if (password.length < 6) {
    ElMessage.warning('密码至少6位')
    return
  }
  if (password !== confirmPassword) {
    ElMessage.warning('两次密码输入不一致')
    return
  }
  loading.value = true
  try {
    const res = await apiRegister(name, phone, password)
    localStorage.setItem('user', JSON.stringify(res.user))
    localStorage.setItem('token', res.token)
    ElMessage.success('注册成功')
    router.push('/')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '注册失败')
  }
  loading.value = false
}
</script>

<style scoped>
.site-header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: var(--header-height);
}
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 1.05rem;
  color: var(--primary-color);
  cursor: pointer;
}
.header-actions {
  display: flex;
  gap: 8px;
}
:deep(.el-menu--horizontal) {
  border-bottom: none;
}
:deep(.el-menu--horizontal .el-menu-item) {
  border-bottom: none !important;
}
.register-container {
  min-height: calc(100vh - var(--header-height));
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
}
</style>
