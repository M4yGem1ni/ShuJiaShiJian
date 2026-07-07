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
            <el-menu-item index="/user" v-if="currentUser">个人中心</el-menu-item>
          </el-menu>
        </nav>
        <div class="header-actions">
          <template v-if="currentUser">
            <el-button type="primary" size="small" @click="$router.push('/user')">{{ currentUser.name }}</el-button>
            <el-button size="small" @click="logout">退出</el-button>
          </template>
          <template v-else>
            <el-button size="small" @click="showLogin=true">登录</el-button>
            <el-button type="primary" size="small" @click="showLogin=true">注册</el-button>
          </template>
        </div>
      </div>
    </header>

    <div class="hero-section">
      <h1>汇聚爱心 · 助力浙江乡村振兴</h1>
      <p>透明、可信、低门槛的线上公益募捐平台，让每一份爱心都能精准传递</p>
    </div>

    <div class="main-container">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="value">{{ formatAmount(stats.totalAmount) }}</div>
          <div class="label">累计捐赠金额 (元)</div>
        </div>
        <div class="stat-card">
          <div class="value">{{ stats.totalProjects }}</div>
          <div class="label">帮扶项目数</div>
        </div>
        <div class="stat-card">
          <div class="value">{{ stats.totalDonors }}</div>
          <div class="label">参与人数</div>
        </div>
        <div class="stat-card">
          <div class="value">{{ stats.regions?.length || 0 }}</div>
          <div class="label">覆盖地区数</div>
        </div>
      </div>

      <div class="section-title">推荐扶贫项目</div>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" v-for="project in featuredProjects" :key="project.id" style="margin-bottom: 20px;">
          <div class="project-card" @click="$router.push(`/projects/${project.id}`)">
            <div class="card-body">
              <el-tag :type="statusType(project.status)" size="small" style="margin-bottom: 8px;">
                {{ statusLabel(project.status) }}
              </el-tag>
              <h3>{{ project.title }}</h3>
              <div class="summary">{{ project.summary }}</div>
              <div style="margin-bottom: 8px; font-size: 0.8rem; color: #909399;">
                <span>{{ project.region }}</span>
                <span style="margin-left: 12px;">{{ project.category }}</span>
              </div>
              <el-progress :percentage="Math.round(project.raisedAmount / project.targetAmount * 100)" :stroke-width="8" />
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; color: #606266; margin-top: 6px;">
                <span>已筹 ¥{{ formatAmount(project.raisedAmount) }}</span>
                <span>目标 ¥{{ formatAmount(project.targetAmount) }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <div style="text-align: center; margin: 32px 0;">
        <el-button type="primary" size="large" @click="$router.push('/projects')">查看全部项目</el-button>
      </div>

      <div class="trust-section" style="background: white; border-radius: 8px; padding: 40px; box-shadow: var(--card-shadow); margin: 40px 0;">
        <div class="section-title" style="text-align: center; margin-top: 0;">平台信任机制</div>
        <el-row :gutter="30">
          <el-col :span="6" v-for="item in trustFeatures" :key="item.title">
            <div style="text-align: center; padding: 20px;">
              <el-icon :size="36" :color="item.color"><component :is="item.icon" /></el-icon>
              <h4 style="margin: 12px 0 8px;">{{ item.title }}</h4>
              <p style="font-size: 0.85rem; color: #606266;">{{ item.desc }}</p>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <footer class="footer">
      <p>© 2026 浙江数字公益扶贫平台 - 课程设计项目</p>
      <p style="margin-top: 8px; font-size: 0.78rem;">本系统为课程演示系统，不涉及真实资金交易</p>
    </footer>

    <el-dialog v-model="showLogin" title="登录" width="400px">
      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="手机号">
          <el-input v-model="loginForm.phone" placeholder="演示账号: donor / org / admin" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="统一密码: 123456" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showLogin=false">取消</el-button>
        <el-button type="primary" @click="handleLogin">登录</el-button>
      </template>
      <div style="padding: 12px; background: #f5f7fa; border-radius: 4px; font-size: 0.82rem; color: #909399;">
        <p>演示账号：donor / org / admin</p>
        <p>统一密码：123456</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProjects, getAdminStats, login as apiLogin } from '../api'
import type { Project, AdminStats } from '../api'

const router = useRouter()
const showLogin = ref(false)
const loginForm = ref({ phone: 'donor', password: '123456' })
const currentUser = ref<any>(null)
const featuredProjects = ref<Project[]>([])
const stats = ref<AdminStats>({
  totalAmount: 0, totalProjects: 0, totalDonors: 0,
  regions: [], categoryStats: [],
  recentDonations: [], pendingAudits: 0, pendingFeedbacks: 0,
})

const trustFeatures = [
  { title: '项目准入审核', desc: '每个项目需通过平台审核方可上线', icon: 'Check', color: '#67c23a' },
  { title: '资金流向透明', desc: '每笔捐赠和资金使用均可追溯', icon: 'TrendCharts', color: '#2d6a9f' },
  { title: '效果反馈公开', desc: '项目进展和成果定期向社会公开', icon: 'Document', color: '#e6a23c' },
  { title: '低门槛参与', desc: '10元起捐，人人都可参与公益', icon: 'Hand', color: '#f56c6c' },
]

onMounted(async () => {
  const userStr = localStorage.getItem('user')
  if (userStr) currentUser.value = JSON.parse(userStr)

  try {
    const [projRes, statsRes] = await Promise.all([
      getProjects({ pageSize: 6 }),
      getAdminStats(),
    ])
    featuredProjects.value = projRes.data || []
    stats.value = statsRes
  } catch (e) {
    console.error('Failed to load data', e)
  }
})

const formatAmount = (v: number) => {
  if (v >= 10000) return (v / 10000).toFixed(1) + '万'
  return v?.toLocaleString() || '0'
}

const statusType = (s: string) => {
  const map: Record<string, string> = { pending: 'info', fundraising: 'warning', executing: 'primary', completed: 'success', rejected: 'danger' }
  return map[s] || 'info'
}
const statusLabel = (s: string) => {
  const map: Record<string, string> = { pending: '待审核', fundraising: '募集中', executing: '执行中', completed: '已完成', rejected: '已驳回' }
  return map[s] || s
}

const handleLogin = async () => {
  try {
    const res = await apiLogin(loginForm.value.phone, loginForm.value.password)
    currentUser.value = res.user
    localStorage.setItem('user', JSON.stringify(res.user))
    localStorage.setItem('token', res.token)
    showLogin.value = false
    ElMessage.success('登录成功')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '登录失败')
  }
}

const logout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  currentUser.value = null
  router.push('/')
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
</style>
