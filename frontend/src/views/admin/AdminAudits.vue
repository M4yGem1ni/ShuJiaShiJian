<template>
  <div v-loading="loading">
    <div class="page-header">
      <h2>审核管理</h2>
    </div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="待审核项目" name="projects">
        <el-table :data="pendingProjects" stripe>
          <el-table-column prop="title" label="项目名称" min-width="200" />
          <el-table-column prop="organization?.name" label="发起组织" width="160" />
          <el-table-column prop="region" label="地区" width="90" />
          <el-table-column prop="targetAmount" label="目标金额" width="120">
            <template #default="s">¥{{ s.row.targetAmount?.toLocaleString() }}</template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template #default="scope">
              <el-button size="small" type="success" @click="approveProject(scope.row.id)">通过</el-button>
              <el-button size="small" type="danger" @click="rejectProject(scope.row.id)">驳回</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="!pendingProjects.length" description="暂无待审核项目" />
      </el-tab-pane>
      <el-tab-pane label="待审核反馈" name="feedbacks">
        <el-table :data="pendingFeedbacks" stripe>
          <el-table-column prop="project?.title" label="所属项目" min-width="180" />
          <el-table-column prop="title" label="反馈标题" min-width="160" />
          <el-table-column prop="usedAmount" label="使用金额" width="120">
            <template #default="s">¥{{ s.row.usedAmount?.toLocaleString() }}</template>
          </el-table-column>
          <el-table-column label="时间" width="120">
            <template #default="s">{{ new Date(s.row.createdAt).toLocaleDateString() }}</template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template #default="scope">
              <el-button size="small" type="success" @click="approveFeedback(scope.row.id)">通过</el-button>
              <el-button size="small" type="danger" @click="rejectFeedback(scope.row.id)">驳回</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="!pendingFeedbacks.length" description="暂无待审核反馈" />
      </el-tab-pane>
      <el-tab-pane label="审计日志" name="logs">
        <el-table :data="auditLogs" stripe>
          <el-table-column prop="action" label="操作" width="160" />
          <el-table-column prop="detail" label="详情" min-width="300" />
          <el-table-column prop="project?.title" label="相关项目" width="180" />
          <el-table-column label="时间" width="120">
            <template #default="s">{{ new Date(s.row.createdAt).toLocaleDateString() }}</template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAdminProjects, updateProjectStatus, getAdminFeedbacks, updateFeedbackStatus, getAuditLogs } from '../../api'
import { ElMessage } from 'element-plus'

const loading = ref(true)
const activeTab = ref('projects')
const pendingProjects = ref<any[]>([])
const pendingFeedbacks = ref<any[]>([])
const auditLogs = ref<any[]>([])

onMounted(async () => {
  try {
    const [projRes, fbRes, logsRes] = await Promise.all([
      getAdminProjects({ status: 'pending', pageSize: 50 }),
      getAdminFeedbacks(),
      getAuditLogs(),
    ])
    pendingProjects.value = projRes.data || []
    pendingFeedbacks.value = (fbRes || []).filter((f: any) => f.status === 'pending')
    auditLogs.value = logsRes || []
  } catch (e) { console.error(e) }
  loading.value = false
})

const approveProject = async (id: number) => {
  try { await updateProjectStatus(id, 'fundraising'); ElMessage.success('项目已通过审核'); await loadProjects() }
  catch (e: any) { ElMessage.error(e?.response?.data?.message || '操作失败') }
}
const rejectProject = async (id: number) => {
  try { await updateProjectStatus(id, 'rejected'); ElMessage.success('项目已驳回'); await loadProjects() }
  catch (e: any) { ElMessage.error(e?.response?.data?.message || '操作失败') }
}
const approveFeedback = async (id: number) => {
  try { await updateFeedbackStatus(id, 'approved'); ElMessage.success('反馈已通过审核'); await loadFeedbacks() }
  catch (e: any) { ElMessage.error(e?.response?.data?.message || '操作失败') }
}
const rejectFeedback = async (id: number) => {
  try { await updateFeedbackStatus(id, 'rejected'); ElMessage.success('反馈已驳回'); await loadFeedbacks() }
  catch (e: any) { ElMessage.error(e?.response?.data?.message || '操作失败') }
}

const loadProjects = async () => {
  const res = await getAdminProjects({ status: 'pending', pageSize: 50 })
  pendingProjects.value = res.data || []
}
const loadFeedbacks = async () => {
  const res = await getAdminFeedbacks()
  pendingFeedbacks.value = (res || []).filter((f: any) => f.status === 'pending')
}
</script>
