# 浙江数字公益扶贫平台

## 项目简介

本项目是一个面向浙江省的线上扶贫募捐平台原型系统，作为课程小组作业展示使用。系统围绕浙江省数字公益与共同富裕主题，模拟政府、公益组织、捐赠用户、受助对象和平台管理员等多方角色，展示从扶贫项目发布、用户浏览捐赠、资金流向追踪、项目进展反馈到后台审核管理的完整闭环。

### 核心要点

- **信任不足** → 平台审核、预算公开、资金追溯
- **参与门槛高** → 便捷捐赠、模拟支付、多角色路径
- **资金不透明** → 资金流向时间线、凭证公开
- **可持续运营** → 项目反馈、数据看板、激励机制

## 技术栈

| 层次 | 技术 |
|------|------|
| 前端 | Vue 3 + Vite + TypeScript + Element Plus + ECharts |
| 后端 | Node.js + Express + TypeScript + Prisma |
| 数据库 | SQLite |
| CI | GitHub Actions |

## 项目结构

```
ShuJiaShiJian/
├── frontend/          # Vue 3 前端项目
│   ├── src/
│   │   ├── views/     # 页面组件
│   │   ├── router/    # 路由配置
│   │   ├── api/       # API 客户端
│   │   └── stores/    # Pinia 状态管理
│   └── ...
├── backend/           # Express 后端项目
│   ├── src/
│   │   ├── routes/    # API 路由
│   │   ├── controllers/
│   │   └── services/
│   ├── prisma/        # 数据模型 & 种子数据
│   └── ...
├── plan.md            # 实施计划
├── goal.md            # 项目目标
├── release.sh         # 本地打包发布脚本
└── .github/workflows/ci.yml  # CI 配置
```

## 快速开始

### 环境要求

- Node.js 20+
- npm 9+

### 启动开发环境

```bash
# 后端
cd backend
npm install
cp .env.example .env
npx prisma db push
npx tsx prisma/seed.ts
npm run dev   # http://localhost:3001

# 前端（新开终端）
cd frontend
npm install
npm run dev   # http://localhost:5173
```

### 演示账号

| 角色 | 账号 | 密码 |
|------|------|------|
| 捐赠用户 | donor | 123456 |
| 公益组织 | org | 123456 |
| 管理员 | admin | 123456 |

### 打包发布

```bash
# 本地打包
./release.sh
# 输出: shujiashijian-release.tar.gz
```

### 运行生产版本

```bash
tar -xzf shujiashijian-release.tar.gz
cd shujiashijian-release
./start.sh
# 访问 http://localhost:3001
```

## 功能模块

### 前台
- **首页**: 平台介绍、关键数据、推荐项目
- **项目列表**: 按地区/类型/状态筛选
- **项目详情**: 项目背景、筹款进度、资金流向时间线、项目反馈
- **模拟捐赠**: 即时捐赠流程
- **用户中心**: 捐赠记录、公益证书
- **平台介绍**: About 页面

### 后台
- **数据看板**: 捐赠趋势、项目分布、待审核事项
- **项目管理**: 项目 CRUD、审核状态切换
- **捐赠记录**: 查看所有捐赠明细
- **资金流向**: 资金追溯管理
- **反馈管理**: 项目反馈审核
- **审核管理**: 统一审核入口

## 演示流程（推荐）

1. 打开首页，介绍平台目标与核心数据
2. 进入项目列表，展示筛选功能
3. 进入项目详情，展示筹款进度、资金流向、项目反馈
4. 完成一笔模拟捐赠，展示即时反馈
5. 查看用户中心，展示捐赠记录
6. 进入后台，展示数据看板和项目审核流程

## 信任机制设计

- **项目准入**: 管理员审核上线
- **资金透明**: 资金流向时间线公开
- **反馈闭环**: 公益组织发布 → 管理员审核 → 用户可见
- **用户激励**: 累计捐赠、公益证书
- **风险提示**: 异常项目标记

## License

课程项目，仅用于教学演示。
