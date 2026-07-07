<template>
  <div>
    <div class="page-header">
      <h2>项目管理</h2>
      <el-select v-model="statusFilter" placeholder="全部状态" clearable @change="loadProjects" style="width:130px;">
        <el-option label="待审核" value="pending" />
        <el-option label="募集中" value="fundraising" />
        <el-option label="执行中" value="executing" />
        <el-option label="已完成" value="completed" />
      </el-select>
    </div>

    <el-table :data="projects" stripe v-loading="loading" style="width:100%">
      <el-table-column prop="title" label="项目名称" min-width="200" />
      <el-table-column prop="region" label="地区" width="90" />
      <el-table-column prop="category" label="类型" width="100" />
      <el-table-column label="目标金额" width="120">
        <template #default="s">¥{{ s.row.targetAmount?.toLocaleString() }}</template>
      </el-table-column>
      <el-table-column label="已筹" width="120">
        <template #default="s">¥{{ s.row.raisedAmount?.toLocaleString() }}</template>
      </el-table-column>
      <el-table-column label="进度" width="150">
        <template #default="s">
          <el-progress :percentage="s.row.targetAmount ? Math.round(s.row.raisedAmount / s.row.targetAmount * 100) : 0" :stroke-width="6" />
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="s">
          <el-tag :type="s.row.status === 'pending' ? 'info' : s.row.status === 'fundraising' ? 'warning' : s.row.status === 'executing' ? 'primary' : s.row.status === 'completed' ? 'success' : 'danger'" size="small">
            {{ s.row.status === 'pending' ? '待审核' : s.row.status === 'fundraising' ? '募集中' : s.row.status === 'executing' ? '执行中' : s.row.status === 'completed' ? '已完成' : '已驳回' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="$router.push('/projects/' + scope.row.id)">查看</el-button>
          <el-button v-if="scope.row.status === 'pending'" size="small" type="success" @click="changeStatus(scope.row.id, 'fundraising')">通过</el-button>
          <el-button v-if="scope.row.status === 'fundraising'" size="small" type="primary" @click="changeStatus(scope.row.id, 'executing')">执行中</el-button>
          <el-button v-if="scope.row.status === 'executing'" size="small" type="success" @click="changeStatus(scope.row.id, 'completed')">完成</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="text-align:center;margin-top:16px;">
      <el-pagination v-model:current-page="page" :page-size="pageSize" :total="total" @current-change="handlePageChange" layout="prev, pager, next" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAdminProjects, updateProjectStatus } from '../../api'
import { ElMessage } from 'element-plus'

const projects = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(15)
const total = ref(0)
const statusFilter = ref('')

const loadProjects = async () => {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize: pageSize.value }
    if (statusFilter.value) params.status = statusFilter.value
    const res = await getAdminProjects(params)
    projects.value = res.data || []
    total.value = res.total || 0
  } catch (e) { console.error(e) }
  loading.value = false
}

const handlePageChange = (p: number) => {
  page.value = p
  loadProjects()
}

const changeStatus = async (id: number, status: string) => {
  try {
    await updateProjectStatus(id, status)
    ElMessage.success('状态更新成功')
    loadProjects()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '操作失败')
  }
}

onMounted(loadProjects)
</script>
