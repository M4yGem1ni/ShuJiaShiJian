# 浙江数字公益扶贫平台 — 系统指南

演示账号信息请参见 [docs/accounts.md](accounts.md)。服务端默认运行于 `http://localhost:3001`。

## 启动方式

### 开发模式

```bash
# 后端
cd backend
npm install
npm run db:push
npm run db:seed
npm run dev

# 前端
cd frontend
npm install
npm run dev
```

### 编译版（单文件可执行文件）

从 Release 页面下载对应平台的二进制文件，直接运行：

```bash
./shujiashijian-darwin-arm64
```

数据库自动创建在运行目录下的 `dev.db`。

## 注意事项

- 本系统为课程演示系统，不涉及真实资金交易和身份认证。
- 所有捐赠数据均为模拟数据，仅用于功能演示。

## 编译版数据库说明

编译版数据库文件存放在运行目录下的 `dev.db`。首次运行时会自动创建并初始化演示数据，无需手动操作。
