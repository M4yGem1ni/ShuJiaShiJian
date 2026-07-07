<template>
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#2d6a9f,#1b4d6e);">
    <el-card style="width:400px;">
      <h2 style="text-align:center;margin-bottom:24px;">后台管理登录</h2>
      <el-form :model="form" label-width="0">
        <el-form-item>
          <el-input v-model="form.phone" placeholder="管理员账号: admin" size="large" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码: 123456" size="large" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" @click="handleLogin" :loading="loading" style="width:100%">登录</el-button>
        </el-form-item>
      </el-form>
      <div style="text-align:center;">
        <el-button text @click="$router.push('/')">返回首页</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../../api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const form = ref({ phone: 'admin', password: '123456' })
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  try {
    const res = await login(form.value.phone, form.value.password)
    if (res.user.role !== 'admin') {
      ElMessage.error('非管理员账号无法登录后台')
      return
    }
    localStorage.setItem('user', JSON.stringify(res.user))
    localStorage.setItem('token', res.token)
    ElMessage.success('登录成功')
    router.push('/admin/dashboard')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '登录失败')
  }
  loading.value = false
}
</script>
