# @airport/sdk 🛠️ [EN/ZH]

Shared API client for NodeAdmin Pro admin and application surfaces. Aligned with the standardized `/api/:resource` REST architecture.
NodeAdmin Pro 管理面板与应用的共享 API 客户端。全面对接标准化的 `/api/:resource` REST 架构。

---

## 📦 Features | 功能

- **Standardized Client**: Unified `AirportApiClient` with JWT and error handling.
  **标准客户端**：内建 JWT 鉴权与错误处理的统一 `AirportApiClient`。
- **Admin & App APIs**: Pre-mapped endpoints for Nodes, Providers, Plans, Subscriptions, and Audit Logs.
  **管理与应用 API**：预设了节点、提供商、套餐、订阅及审计日志的端点映射。
- **Type Safety**: Full TypeScript interfaces for all database entities and response objects.
  **类型安全**：为所有数据库实体和响应对象提供完整的 TypeScript 接口。

---

## 🚀 Usage | 使用方法

### Installation | 安装
As a local monorepo package | 作为本地 monorepo 包使用:
```json
"@airport/sdk": "workspace:*"
```

### Basic Example | 基础示例
```typescript
import { AdminApi } from '@airport/sdk';

const sdk = new AdminApi({
  baseUrl: 'http://localhost:3000',
  tokenProvider: () => localStorage.getItem('token') || ''
});

// Fetch all nodes | 获取所有节点
const { data, total } = await sdk.listNodes({ page: 1, pageSize: 20 });
```

---

## 🛠️ API Coverage | API 覆盖范围

The SDK provides methods for the following resources | SDK 提供以下资源的访问方法：
- **Nodes**: `listNodes`, `getNodeMetrics`
- **Providers**: `listProviders`, `syncProvider`, `deleteProvider`
- **Plans**: `listPlans`, `createPlan`, `updatePlan`, `deletePlan`
- **Audit Logs**: `listAuditLogs`
- **Alerts**: `listAlerts`, `triggerAlert`

---
© 2026 Airport.dev. All rights reserved.
