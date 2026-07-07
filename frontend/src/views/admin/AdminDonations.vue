<template>
  <div>
    <div class="page-header"><h2>捐赠记录</h2></div>
    <el-table :data="donations" stripe v-loading="loading">
      <el-table-column label="捐赠人" width="120">
        <template #default="s">{{ s.row.isAnonymous ? '匿名用户' : s.row.user?.name }}</template>
      </el-table-column>
      <el-table-column prop="project?.title" label="项目" min-width="200" />
      <el-table-column label="金额" width="120">
        <template #default="s">¥{{ s.row.amount?.toLocaleString() }}</template>
      </el-table-column>
      <el-table-column prop="message" label="留言" min-width="160">
        <template #default="s">{{ s.row.message || '-' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="s">
          <el-tag :type="s.row.status === 'success' ? 'success' : 'info'" size="small">{{ s.row.status === 'success' ? '成功' : '已退款' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="时间" width="120">
        <template #default="s">{{ new Date(s.row.createdAt).toLocaleDateString() }}</template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAdminDonations } from '../../api'

const donations = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try { const res = await getAdminDonations({ pageSize: 100 }); donations.value = res.data || [] }
  catch (e) { console.error(e) }
  loading.value = false
})
</script>
