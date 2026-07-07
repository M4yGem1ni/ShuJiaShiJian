<template>
  <div v-loading="loading">
    <h2 style="margin-bottom:20px;">数据看板</h2>
    <el-row :gutter="16">
      <el-col :span="6" v-for="card in statCards" :key="card.label">
        <el-card shadow="hover" style="margin-bottom:16px;">
          <div style="text-align:center;">
            <div style="font-size:1.8rem;font-weight:bold;color:var(--primary-color);">{{ card.value }}</div>
            <div style="font-size:0.85rem;color:#909399;margin-top:4px;">{{ card.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card>
          <h3 style="margin-bottom:12px;">捐赠趋势</h3>
          <div ref="trendChartRef" style="height:300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <h3 style="margin-bottom:12px;">项目分类占比</h3>
          <div ref="pieChartRef" style="height:300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top:16px;">
      <el-col :span="12">
        <el-card>
          <h3 style="margin-bottom:12px;">地区分布</h3>
          <div ref="barChartRef" style="height:280px;"></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <h3 style="margin-bottom:12px;">待处理事项</h3>
          <div style="padding:16px 0;">
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ebeef5;">
              <span>待审核项目</span>
              <el-tag type="warning">{{ stats.pendingAudits }}</el-tag>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;">
              <span>待审核反馈</span>
              <el-tag type="warning">{{ stats.pendingFeedbacks }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <h3 style="margin-bottom:12px;">最新捐赠</h3>
          <div v-for="d in stats.recentDonations?.slice(0,4)" :key="d.id" style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:0.85rem;">
            <div style="display:flex;justify-content:space-between;">
              <span>{{ d.user?.name }}</span>
              <span style="color:var(--primary-color);">¥{{ d.amount }}</span>
            </div>
            <div style="color:#909399;font-size:0.78rem;">{{ d.project?.title }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { getAdminStats, getTrends } from '../../api'
import * as echarts from 'echarts'

const loading = ref(true)
const stats = ref<any>({ totalAmount: 0, totalProjects: 0, totalDonors: 0, pendingAudits: 0, pendingFeedbacks: 0, recentDonations: [], categoryStats: [], regions: [] })
const trendChartRef = ref<HTMLDivElement>()
const pieChartRef = ref<HTMLDivElement>()
const barChartRef = ref<HTMLDivElement>()

const statCards = ref([
  { label: '累计捐赠(元)', value: '0' },
  { label: '项目总数', value: '0' },
  { label: '参与人数', value: '0' },
  { label: '覆盖地区', value: '0' },
])

onMounted(async () => {
  try {
    const [s, t] = await Promise.all([getAdminStats(), getTrends()])
    stats.value = s
    statCards.value = [
      { label: '累计捐赠(元)', value: (s.totalAmount >= 10000 ? (s.totalAmount / 10000).toFixed(1) + '万' : s.totalAmount.toLocaleString()) },
      { label: '项目总数', value: s.totalProjects.toString() },
      { label: '参与人数', value: s.totalDonors.toString() },
      { label: '覆盖地区', value: (s.regions?.length || 0).toString() },
    ]

    nextTick(() => {
      if (trendChartRef.value && t?.length) {
        const chart = echarts.init(trendChartRef.value)
        chart.setOption({
          xAxis: { type: 'category', data: t.map((d: any) => d.date.slice(5)) },
          yAxis: { type: 'value' },
          series: [{ data: t.map((d: any) => d.amount), type: 'line', smooth: true, areaStyle: {} }],
          tooltip: { trigger: 'axis' },
          grid: { left: 40, right: 20, bottom: 30, top: 20 },
        })
      }

      if (pieChartRef.value && s.categoryStats?.length) {
        const chart = echarts.init(pieChartRef.value)
        chart.setOption({
          series: [{
            type: 'pie', radius: ['35%', '60%'],
            data: s.categoryStats.map((c: any) => ({ name: c.category, value: c._count.id })),
          }],
          tooltip: { trigger: 'item' },
        })
      }

      if (barChartRef.value && s.regions?.length) {
        const chart = echarts.init(barChartRef.value)
        chart.setOption({
          xAxis: { type: 'category', data: s.regions.map((r: any) => r.region) },
          yAxis: { type: 'value' },
          series: [{ data: s.regions.map((r: any) => r._count.id), type: 'bar', itemStyle: { color: '#2d6a9f' } }],
          tooltip: { trigger: 'axis' },
          grid: { left: 40, right: 20, bottom: 30, top: 20 },
        })
      }
    })
  } catch (e) {
    console.error(e)
  }
  loading.value = false
})
</script>
