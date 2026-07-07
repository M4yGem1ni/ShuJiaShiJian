<template>
  <div>
    <HeaderBar />
    <div class="main-container" v-loading="loading">
      <template v-if="user">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card style="text-align:center;">
              <el-avatar :size="80" icon="UserFilled" />
              <h3 style="margin:12px 0 4px;">{{ user.name }}</h3>
              <el-tag size="small">{{ user.role === 'donor' ? '爱心用户' : user.role === 'organization' ? '公益组织' : '管理员' }}</el-tag>
              <el-divider />
              <div style="font-size:0.9rem;color:#606266;">
                <p>累计捐赠: <strong style="color:var(--primary-color);">¥{{ totalDonated.toLocaleString() }}</strong></p>
                <p style="margin-top:8px;">参与项目: {{ donations.length }} 个</p>
                <p style="margin-top:8px;">注册时间: {{ new Date(user.createdAt).toLocaleDateString() }}</p>
              </div>
            </el-card>
          </el-col>
          <el-col :span="18">
            <el-card>
              <h3 style="margin-bottom:16px;">捐赠记录</h3>
              <el-table :data="donations" style="width:100%" v-if="donations.length">
                <el-table-column prop="project.title" label="项目" min-width="180" />
                <el-table-column label="金额" width="120">
                  <template #default="scope">¥{{ scope.row.amount?.toLocaleString() }}</template>
                </el-table-column>
                <el-table-column prop="project.region" label="地区" width="100" />
                <el-table-column label="匿名" width="80">
                  <template #default="scope">{{ scope.row.isAnonymous ? '是' : '否' }}</template>
                </el-table-column>
                <el-table-column label="留言" min-width="150">
                  <template #default="scope">{{ scope.row.message || '-' }}</template>
                </el-table-column>
                <el-table-column label="时间" width="120">
                  <template #default="scope">{{ new Date(scope.row.createdAt).toLocaleDateString() }}</template>
                </el-table-column>
              </el-table>
              <el-empty v-else description="暂无捐赠记录" />
            </el-card>

            <el-card style="margin-top:20px;" v-if="donations.length">
              <h3 style="margin-bottom:16px;">公益证书</h3>
              <div style="border:2px solid #e6a23c;border-radius:8px;padding:32px;text-align:center;">
                <el-icon :size="40" color="#e6a23c"><TrophyBase /></el-icon>
                <h2 style="margin:12px 0;color:#e6a23c;">爱心公益证书</h2>
                <p>感谢 {{ user.name }} 在本平台累计捐赠 ¥{{ totalDonated.toLocaleString() }}</p>
                <p style="color:#909399;margin-top:8px;">您的每一份爱心都在改变世界</p>
                <p style="color:#909399;font-size:0.85rem;margin-top:16px;">浙江数字公益扶贫平台</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>
      <el-empty v-else description="请先登录" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getUserDonations } from '../api'
import { ElMessage } from 'element-plus'
import { TrophyBase } from '@element-plus/icons-vue'
import HeaderBar from '../components/HeaderBar.vue'

const user = ref<any>(null)
const donations = ref<any[]>([])
const loading = ref(true)
const totalDonated = computed(() => donations.value.reduce((s, d) => s + d.amount, 0))

onMounted(async () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    ElMessage.warning('请先登录')
    loading.value = false
    return
  }
  user.value = JSON.parse(userStr)
  try {
    donations.value = await getUserDonations(user.value.id)
  } catch (e) {
    console.error(e)
  }
  loading.value = false
})
</script>
