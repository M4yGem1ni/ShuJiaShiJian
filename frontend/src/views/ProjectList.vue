<template>
  <div>
    <HeaderBar />
    <div class="main-container">
      <div class="page-header">
        <h2>扶贫项目</h2>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <el-select v-model="filters.region" placeholder="地区" clearable style="width:120px;" @change="loadProjects">
            <el-option v-for="r in regions" :key="r" :label="r" :value="r" />
          </el-select>
          <el-select v-model="filters.category" placeholder="类型" clearable style="width:120px;" @change="loadProjects">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
          <el-select v-model="filters.status" placeholder="状态" clearable style="width:120px;" @change="loadProjects">
            <el-option label="募集中" value="fundraising" />
            <el-option label="执行中" value="executing" />
            <el-option label="已完成" value="completed" />
            <el-option label="待审核" value="pending" />
          </el-select>
          <el-input v-model="filters.search" placeholder="搜索项目" clearable style="width:200px;" @change="loadProjects" />
        </div>
      </div>

      <el-row :gutter="20" v-if="projects.length">
        <el-col :xs="24" :sm="12" :md="8" v-for="project in projects" :key="project.id" style="margin-bottom: 20px;">
          <div class="project-card" @click="$router.push(`/projects/${project.id}`)">
            <div class="card-body">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <el-tag :type="statusType(project.status)" size="small">{{ statusLabel(project.status) }}</el-tag>
                <span style="font-size:0.8rem;color:#909399;">{{ project.organization?.name }}</span>
              </div>
              <h3>{{ project.title }}</h3>
              <div class="summary">{{ project.summary }}</div>
              <div style="margin-bottom:8px;font-size:0.82rem;color:#909399;">
                <el-icon><Location /></el-icon> {{ project.region }}
                <span style="margin-left:12px;">{{ project.category }}</span>
              </div>
              <el-progress :percentage="Math.round(project.raisedAmount / project.targetAmount * 100)" :stroke-width="8" />
              <div style="display:flex;justify-content:space-between;font-size:0.82rem;color:#606266;margin-top:6px;">
                <span>已筹 ¥{{ project.raisedAmount?.toLocaleString() }}</span>
                <span>目标 ¥{{ project.targetAmount?.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-empty v-else description="暂无项目" />
      
      <div style="text-align:center;margin-top:24px;" v-if="total > pageSize">
        <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="total" @current-change="onPageChange" layout="prev, pager, next" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getProjects } from '../api'
import type { Project } from '../api'
import { Location } from '@element-plus/icons-vue'
import HeaderBar from '../components/HeaderBar.vue'

const projects = ref<Project[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(9)
const filters = ref({ region: '', category: '', status: '', search: '' })
const regions = ['丽水', '衢州', '温州', '杭州', '舟山', '金华', '绍兴']
const categories = ['教育帮扶', '医疗救助', '产业扶持', '困难家庭救助']

const loadProjects = async () => {
  try {
    const cleanFilters: any = {}
    Object.entries(filters.value).forEach(([k, v]) => { if (v) cleanFilters[k] = v })
    const res = await getProjects({ ...cleanFilters, page: currentPage.value, pageSize: pageSize.value })
    projects.value = res.data || []
    total.value = res.total || 0
  } catch (e) {
    console.error(e)
  }
}

const onPageChange = (p: number) => { currentPage.value = p; loadProjects() }

const statusType = (s: string) => {
  const map: Record<string, string> = { pending: 'info', fundraising: 'warning', executing: 'primary', completed: 'success', rejected: 'danger' }
  return map[s] || 'info'
}
const statusLabel = (s: string) => {
  const map: Record<string, string> = { pending: '待审核', fundraising: '募集中', executing: '执行中', completed: '已完成', rejected: '已驳回' }
  return map[s] || s
}

onMounted(loadProjects)
</script>
