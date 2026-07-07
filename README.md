# 浙江数字公益扶贫平台

## 项目简介

本项目是一个面向浙江省的线上扶贫募捐平台原型系统。系统围绕浙江省数字公益与共同富裕主题，模拟政府、公益组织、捐赠用户、受助对象和平台管理员等多方角色，展示从扶贫项目发布、用户浏览捐赠、资金流向追踪、项目进展反馈到后台审核管理的完整闭环。

### 核心要点

- **信任不足** → 平台审核、预算公开、资金追溯
- **参与门槛高** → 便捷捐赠、模拟支付、多角色路径
- **资金不透明** → 资金流向时间线、凭证公开
- **可持续运营** → 项目反馈、数据看板、激励机制

## 下载可执行文件

从 [GitHub Releases](https://github.com/M4yGem1ni/ShuJiaShiJian/releases) 页面下载对应平台的可执行文件：

- `shujiashijian-linux-x64` — Linux x86_64
- `shujiashijian-linux-arm64` — Linux ARM64
- `shujiashijian-win-x64.exe` — Windows x86_64
- `shujiashijian-darwin-arm64` — macOS Apple Silicon

下载后直接运行：

```bash
chmod +x shujiashijian-*   # Linux/macOS
./shujiashijian-*          # 或双击运行
```

浏览器打开 http://localhost:3001 即可使用。

首次运行会自动创建 SQLite 数据库并初始化演示数据。如需重置，删除运行目录下的 `dev.db` 后重启即可。

## 开发环境

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

演示账号信息请参见 [docs/accounts.md](docs/accounts.md).

## 项目结构

```
ShuJiaShiJian/
  ├── frontend/          # 前端项目（Vue 3 + Vite + TypeScript）
  ├── backend/           # 后端项目（Express + Prisma + SQLite）
  ├── docs/              # 文档
  └── .github/workflows/ci.yml  # CI 配置
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

## 信任机制设计

- **项目准入**: 管理员审核上线
- **资金透明**: 资金流向时间线公开
- **反馈闭环**: 公益组织发布 → 管理员审核 → 用户可见
- **用户激励**: 累计捐赠、公益证书
- **风险提示**: 异常项目标记

## CI / CD

本项目使用 GitHub Actions 自动构建可执行文件。每次推送到 `main` 分支时，CI 会自动执行：

1. **build** — 验证前后端编译通过
2. **package** — 使用 `pkg` 在各平台编译独立可执行文件
3. **release** — 将产物发布到 GitHub Releases

构建产物可在 [Releases 页面](https://github.com/M4yGem1ni/ShuJiaShiJian/releases) 下载。
