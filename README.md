# NodeAdmin Pro 🌐 [EN/ZH]

Enterprise-grade Node and Subscription Management System built with a modern Monorepo architecture. Highly optimized for high-performance VPN and "Airport" service operations.
基于现代 Monorepo 架构构建的企业级节点与订阅管理系统。专为高性能 VPN 和“机场”业务运营而深度优化。

---

## 🚀 Key Features | 核心功能

- **Full-Scale Dashboard**: A professional, dark-mode first UI for comprehensive infrastructure management.
  **全方位仪表盘**：专业级暗黑模式优先的 UI，提供全面的基础设施管理视图。
- **Node Management & Monitoring**: Real-time status, latency, and packet loss tracking across global clusters.
  **节点管理与监控**：实时追踪全球集群的状态、延迟和丢包率。
- **Standardized RESTful API**: Clean `/api/:resource` structure for easy integration.
  **标准 RESTful API**：纯净的 `/api/:resource` 架构，易于扩展与集成。
- **YAML Node Import**: Support for bulk-importing node configurations via YAML files or direct text input with automatic parsing.
  **YAML 节点导入**：支持通过 YAML 文件或直接文本输入批量导入节点配置，具备自动解析功能。
- **Provider Aggregation**: Automated synchronization from multiple upstream subscription sources.
  **提供商聚合**：支持从多个上游订阅源自动同步节点数据。
- **Subscription Engine**: Bandwidth-limited packages with automated resets, expiry tracking, and user allocation.
  **订阅引擎**：支持限速限流套餐，具备自动重置、到期追踪和用户分配功能。
- **Role-Based Access (RBAC)**: Fine-grained permissions (Super Admin, Ops, Support, User, Auditor).
  **权限控制 (RBAC)**：精细化的权限管理（级管、运维、客服、用户、审计）。

---

## 📁 Architecture | 项目架构

NodeAdmin Pro uses a **Monorepo** structure managed by Turbo.
项目采用由 Turbo 管理的 **Monorepo** 架构。

```text
├── apps/
│   ├── api/           # NestJS Backend (Prisma, SQLite/PostgreSQL) | 后端应用
│   ├── web/           # React Frontend (Vite, Tailwind CSS, Lucide) | 前端应用
│   └── worker/        # Background health checks & sync workers | 后台任务与同步
├── packages/
│   └── sdk/           # Shared TypeScript SDK & API Client | 共享 SDK 与 API 客户端
└── node_modules/      # Workspace dependencies | 工作区依赖
```

---

## 🛠️ Quick Start | 快速启动

### 1. Prerequisites | 前置条件
- Node.js 18+
- npm / pnpm / yarn
- (Optional) PostgreSQL (Defaults to SQLite | 默认为 SQLite)

### 2. Installation | 安装
From the root directory | 在根目录下运行:
```bash
npm install
```

### 3. Environment Configuration | 环境变量配置
Navigate to `apps/api/` and copy `.env.example` to `.env`:
进入 `apps/api/` 目录并复制配置文件：
```bash
cp .env.example .env
```
**Important**: Configure `SEED_ADMIN_PASSWORD` in the `.env` file before initial startup.
**重要**：在首次启动前，请在 `.env` 文件中配置管理员初始密码。

### 4. Running for Development | 启动开发环境
Use the root script to start all services simultaneously:
使用根目录脚本同时启动所有服务：
```bash
npm run dev
```

- **Frontend | 前端**: `http://localhost:5173`
- **Backend | 后端**: `http://localhost:3000/api`

---

## 🔐 Default Credentials | 默认凭据

Initial setup seeds the database with the following default accounts.
初始环境预设了以下默认账号：

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@airport.dev` | `admin123456` |
| **Ops Lead** | `ops@airport.dev` | `ops123456` |
| **Support** | `support@airport.dev` | `support1234` |
| **Auditor** | `audit@airport.dev` | `audit123456` |
| **User** | `pilot@customer.dev` | `user123456` |

---

## 🛠️ API Standards | API 标准

The project now uses a standardized **non-versioned** API path structure:
项目现已全面采用**非版本化**的标准 API 路径结构：

- **Auth**: `POST /api/login`
- **Nodes**: `GET /api/nodes`, `GET /api/nodes/:id/metrics`
- **Providers**: `GET/POST/PATCH/DELETE /api/providers`, `POST /api/providers/:id/sync`
- **Tickets**: `GET/POST /api/tickets`, `POST /api/tickets/:id/reply`
- **Audit Logs**: `GET /api/audit-logs`

---

## 🤝 Contributing | 参与开发

Ensure all new API calls are added to `@airport/sdk` before using them in the `web` frontend.
在前端调用新接口前，请确保已将其添加到 `@airport/sdk` 中以保证类型安全。

---
© 2026 Airport.dev. All rights reserved. Professional Node Management Solutions.
