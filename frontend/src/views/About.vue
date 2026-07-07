<template>
  <div>
    <HeaderBar />
    <div class="main-container">
      <el-card>
        <h1 style="font-size:1.6rem;margin-bottom:20px;">关于浙江数字公益扶贫平台</h1>
        
        <h3>项目背景</h3>
        <p style="line-height:1.8;color:#606266;margin:12px 0 24px;">
          浙江省作为共同富裕示范区，在数字公益领域持续探索创新。本平台旨在通过数字化手段，解决线上公益募捐存在的信任不足、参与门槛高、资金流向不透明等问题，为浙江省推进数字公益与共同富裕提供技术解决方案。
        </p>

        <h3>平台特色</h3>
        <el-row :gutter="20" style="margin:16px 0 24px;">
          <el-col :span="8" v-for="f in features" :key="f.title">
            <el-card shadow="hover" style="margin-bottom:12px;">
              <h4>{{ f.title }}</h4>
              <p style="font-size:0.9rem;color:#606266;margin-top:8px;">{{ f.desc }}</p>
            </el-card>
          </el-col>
        </el-row>

        <h3>系统说明</h3>
        <p style="line-height:1.8;color:#909399;font-size:0.9rem;margin-top:8px;">
          本系统为课程演示系统，不涉及真实资金交易和身份认证。所有捐赠数据均为模拟数据，仅用于功能演示。
        </p>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import HeaderBar from '../components/HeaderBar.vue'

const features = [
  { title: '项目准入审核', desc: '每个项目需通过平台审核方可上线，确保项目真实可信' },
  { title: '资金流向透明', desc: '从募集到使用，每笔资金的流向都清晰可追溯' },
  { title: '效果反馈公开', desc: '项目进展和成果定期向社会公开，接受社会监督' },
  { title: '低门槛参与', desc: '10元起捐，人人都可参与公益事业' },
  { title: '多方角色协同', desc: '平台连接捐赠者、公益组织和政府监管，多方协作' },
  { title: '数据驱动运营', desc: '通过数据分析优化项目推荐和运营策略' },
]
</script>
