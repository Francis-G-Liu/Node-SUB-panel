# NodeAdmin API 🛠️ [EN/ZH]

High-performance NestJS backend for NodeAdmin Pro. Standardized RESTful API for global node management and subscription orchestration.
NodeAdmin Pro 的高性能 NestJS 后端。为全球节点管理和订阅编排提供标准化的 RESTful API。

---

## 🚀 Features | 功能

- **Standardized REST**: All endpoints follow the `/api/:resource` pattern.
  **标准 REST**: 所有端点均遵循 `/api/:resource` 模式。
- **Prisma ORM**: Robust data modeling with SQLite (dev) and PostgreSQL support.
  **Prisma ORM**: 强大的数据建模，支持 SQLite (开发) 和 PostgreSQL。
- **JWT Auth**: Secure RBAC with access and refresh token rotation.
  **JWT 鉴权**: 安全的角色访问控制 (RBAC)，支持访问令牌与刷新令牌轮换。
- **SSE Streaming**: Real-time node status and alert updates via Server-Sent Events.
  **SSE 流式传输**: 通过服务端发送事件 (SSE) 实时更新节点状态和告警。

---

## 🛠️ Setup | 设置

### Prerequisites | 前置要求
- Node.js 18+
- Prisma CLI (`npm install -g prisma`)

### Quick Start | 快速启动
```bash
# Install dependencies | 安装依赖
npm install

# Database setup | 数据库设置
npx prisma generate
npx prisma db push
npm run seed  # Seed default accounts | 预设默认账号

# Start Server | 启动服务
npm run start:dev
```

---

## 🔐 API Reference | API 参考

- **Auth**: `/api/login`, `/api/refresh`
- **Resources**: `/api/nodes`, `/api/providers`, `/api/plans`, `/api/subscriptions`, `/api/users`, `/api/tickets`
- **Observability**: `/api/audit-logs`, `/api/stream/nodes`

---
© 2026 Airport.dev. All rights reserved.
