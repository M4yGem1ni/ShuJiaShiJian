<template>
  <div>
    <div class="page-header"><h2>反馈管理</h2></div>
    <el-table :data="feedbacks" stripe v-loading="loading">
      <el-table-column prop="project?.title" label="项目" min-width="200" />
      <el-table-column prop="title" label="反馈标题" min-width="160" />
      <el-table-column prop="content" label="内容" min-width="250" show-overflow-tooltip />
      <el-table-column label="使用金额" width="120">
        <template #default="s">¥{{ s.row.usedAmount?.toLocaleString() }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="s">
          <el-tag :type="s.row.status === 'approved' ? 'success' : s.row.status === 'rejected' ? 'danger' : 'warning'" size="small">
            {{ s.row.status === 'approved' ? '已通过' : s.row.status === 'rejected' ? '已驳回' : '待审核' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="时间" width="120">
        <template #default="s">{{ new Date(s.row.createdAt).toLocaleDateString() }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120" v-if="hasPending">
        <template #default="scope">
          <el-button v-if="scope.row.status === 'pending'" size="small" type="success" @click="updateStatus(scope.row.id, 'approved')">通过</el-button>
          <el-button v-if="scope.row.status === 'pending'" size="small" type="danger" @click="updateStatus(scope.row.id, 'rejected')">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getAdminFeedbacks, updateFeedbackStatus } from '../../api'
import { ElMessage } from 'element-plus'

const feedbacks = ref<any[]>([])
const loading = ref(true)
const hasPending = computed(() => feedbacks.value.some(f => f.status === 'pending'))

onMounted(async () => {
  try { feedbacks.value = await getAdminFeedbacks() || [] }
  catch (e) { console.error(e) }
  loading.value = false
})

const updateStatus = async (id: number, status: string) => {
  try {
    await updateFeedbackStatus(id, status)
    ElMessage.success('操作成功')
    feedbacks.value = await getAdminFeedbacks() || []
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '操作失败')
  }
}
</script>
