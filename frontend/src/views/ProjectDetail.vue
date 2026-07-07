<template>
  <div>
    <HeaderBar />
    <div class="main-container" v-loading="loading">
      <el-button text @click="$router.back()" style="margin-bottom:16px;">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>

      <template v-if="project">
        <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:12px;">
          <div>
            <h1 style="font-size:1.5rem;">{{ project.title }}</h1>
            <div style="margin:12px 0;display:flex;gap:12px;flex-wrap:wrap;">
              <el-tag :type="statusType(project.status)" size="small">{{ statusLabel(project.status) }}</el-tag>
              <el-tag type="info" size="small">{{ project.region }}</el-tag>
              <el-tag type="info" size="small">{{ project.category }}</el-tag>
              <el-tag type="success" size="plain">平台审核通过</el-tag>
            </div>
          </div>
          <el-button type="danger" size="large" @click="showDonate = true" :disabled="project.status !== 'fundraising'">
            我要捐赠
          </el-button>
        </div>

        <el-row :gutter="24" style="margin-top:24px;">
          <el-col :span="16">
            <el-card>
              <h3>项目详情</h3>
              <p style="line-height:1.8;color:#606266;margin-top:12px;">{{ project.description }}</p>
              <el-divider />
              <h3>项目反馈</h3>
              <div v-if="project.feedbacks?.length">
                <div v-for="fb in project.feedbacks" :key="fb.id" style="padding:16px 0;border-bottom:1px solid #ebeef5;">
                  <div style="display:flex;justify-content:space-between;">
                    <strong>{{ fb.title }}</strong>
                    <el-tag :type="fb.status === 'approved' ? 'success' : 'info'" size="small">{{ fb.status === 'approved' ? '已审核' : '待审核' }}</el-tag>
                  </div>
                  <p style="font-size:0.9rem;color:#606266;margin:8px 0;">{{ fb.content }}</p>
                  <div style="font-size:0.82rem;color:#909399;">
                    <span>使用金额: ¥{{ fb.usedAmount?.toLocaleString() }}</span>
                    <span style="margin-left:16px;">{{ new Date(fb.createdAt).toLocaleDateString() }}</span>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无反馈" :image-size="80" />
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card style="margin-bottom:16px;">
              <h3 style="margin-bottom:12px;">筹款进度</h3>
              <el-progress :percentage="Math.round(project.raisedAmount / project.targetAmount * 100)" :stroke-width="12" />
              <div style="margin-top:12px;font-size:0.9rem;">
                <p>目标金额: <strong>¥{{ project.targetAmount?.toLocaleString() }}</strong></p>
                <p>已筹金额: <strong style="color:var(--primary-color);">¥{{ project.raisedAmount?.toLocaleString() }}</strong></p>
                <p>发起组织: {{ project.organization?.name }}</p>
                <p v-if="project.startDate">开始日期: {{ new Date(project.startDate).toLocaleDateString() }}</p>
                <p v-if="project.endDate">截止日期: {{ new Date(project.endDate).toLocaleDateString() }}</p>
              </div>
            </el-card>

            <el-card>
              <h3 style="margin-bottom:12px;">资金流向</h3>
              <el-timeline v-if="project.fundFlows?.length">
                <el-timeline-item v-for="flow in project.fundFlows" :key="flow.id" :timestamp="new Date(flow.createdAt).toLocaleDateString()" :type="flow.status === 'approved' ? 'primary' : 'info'">
                  <p style="font-weight:500;">{{ flow.title }}</p>
                  <p style="font-size:0.85rem;color:#606266;">{{ flow.description }}</p>
                  <p style="font-size:0.85rem;color:var(--primary-color);">¥{{ flow.amount?.toLocaleString() }}</p>
                </el-timeline-item>
              </el-timeline>
              <el-empty v-else description="暂无资金流向" :image-size="60" />
            </el-card>
          </el-col>
        </el-row>
      </template>
    </div>

    <el-dialog v-model="showDonate" title="模拟捐赠" width="420px">
      <el-form label-width="80px">
        <el-form-item label="捐赠金额">
          <el-radio-group v-model="donateAmount">
            <el-radio-button label="10">10元</el-radio-button>
            <el-radio-button label="50">50元</el-radio-button>
            <el-radio-button label="100">100元</el-radio-button>
            <el-radio-button label="other">其他</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="donateAmount === 'other'" label="自定义">
          <el-input-number v-model="customAmount" :min="1" :max="100000" />
        </el-form-item>
        <el-form-item label="匿名">
          <el-switch v-model="isAnonymous" />
        </el-form-item>
        <el-form-item label="留言">
          <el-input v-model="message" placeholder="留下你的祝福..." maxlength="100" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDonate=false">取消</el-button>
        <el-button type="danger" @click="handleDonate" :loading="donating">确认捐赠</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getProjectDetail, createDonation } from '../api'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import HeaderBar from '../components/HeaderBar.vue'

const route = useRoute()
const loading = ref(true)
const project = ref<any>(null)
const showDonate = ref(false)
const donating = ref(false)
const donateAmount = ref('50')
const customAmount = ref(50)
const isAnonymous = ref(false)
const message = ref('')

const amount = computed(() => donateAmount.value === 'other' ? customAmount.value : parseInt(donateAmount.value))

onMounted(async () => {
  try {
    project.value = await getProjectDetail(parseInt(route.params.id as string))
  } catch (e) {
    ElMessage.error('获取项目详情失败')
  }
  loading.value = false
})

const statusType = (s: string) => {
  const map: Record<string, string> = { pending: 'info', fundraising: 'warning', executing: 'primary', completed: 'success', rejected: 'danger' }
  return map[s] || 'info'
}
const statusLabel = (s: string) => {
  const map: Record<string, string> = { pending: '待审核', fundraising: '募集中', executing: '执行中', completed: '已完成', rejected: '已驳回' }
  return map[s] || s
}

const handleDonate = async () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    ElMessage.warning('请先登录')
    return
  }
  const user = JSON.parse(userStr)
  donating.value = true
  try {
    await createDonation({
      userId: user.id,
      projectId: project.value.id,
      amount: amount.value,
      isAnonymous: isAnonymous.value,
      message: message.value || undefined,
    })
    ElMessage.success(`捐赠成功！感谢您的爱心捐赠 ¥${amount.value}`)
    showDonate.value = false
    project.value = await getProjectDetail(parseInt(route.params.id as string))
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '捐赠失败')
  }
  donating.value = false
}
</script>
