<template>
  <div>
    <div class="page-header"><h2>资金流向</h2></div>
    <el-table :data="funds" stripe v-loading="loading">
      <el-table-column prop="project?.title" label="项目" min-width="200" />
      <el-table-column prop="title" label="节点" width="160" />
      <el-table-column label="金额" width="120">
        <template #default="s">¥{{ s.row.amount?.toLocaleString() }}</template>
      </el-table-column>
      <el-table-column prop="description" label="说明" min-width="200" />
      <el-table-column label="类型" width="100">
        <template #default="s">{{ ({ received: '募集', verified: '审核', allocated: '拨付', used: '使用' } as Record<string, string>)[s.row.type] || s.row.type }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="s">
          <el-tag :type="s.row.status === 'approved' ? 'success' : 'warning'" size="small">{{ s.row.status === 'approved' ? '已审核' : '待审核' }}</el-tag>
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
import { getAdminFunds } from '../../api'

const funds = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try { funds.value = await getAdminFunds() || [] }
  catch (e) { console.error(e) }
  loading.value = false
})
</script>
