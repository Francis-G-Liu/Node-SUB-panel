export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiClientOptions {
  baseUrl: string;
  tokenProvider?: string | (() => Promise<string> | string);
  defaultHeaders?: Record<string, string>;
}

export interface RequestOptions<TBody = unknown> {
  path: string;
  method?: HttpMethod;
  body?: TBody;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}

export interface PaginatedResult<TData> {
  data: TData[];
  total: number;
  page: number;
  pageSize: number;
}

const encodeQuery = (query: RequestOptions['query']) => {
  if (!query) return '';
  const search = Object.entries(query)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return search ? `?${search}` : '';
};

export class AirportApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly tokenProvider?: string | (() => Promise<string> | string);

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.defaultHeaders = options.defaultHeaders ?? {};
    this.tokenProvider = options.tokenProvider;
  }

  private async resolveToken(): Promise<string | undefined> {
    if (typeof this.tokenProvider === 'string') return this.tokenProvider;
    if (typeof this.tokenProvider === 'function') return this.tokenProvider();
    return undefined;
  }

  protected async request<TResponse>(options: RequestOptions): Promise<TResponse> {
    const token = await this.resolveToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.defaultHeaders,
      ...options.headers,
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${this.baseUrl}${options.path}${encodeQuery(options.query)}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text();
      const error = new Error(`Request failed ${response.status}: ${text}`) as any;
      error.status = response.status;
      error.statusCode = response.status;
      throw error;
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    return (await response.json()) as TResponse;
  }
}

export interface NodeEndpoint {
  id: string;
  providerId: string;
  hostname: string;
  port: number;
  protocol: 'vmess' | 'vless' | 'trojan' | 'ss' | 'socks' | 'http';
  region: string;
  tags: string[];
  online?: boolean;
  maxBandwidthMbps?: number;
  lastCheckedAt?: string;
  health?: {
    latencyMs?: number | null;
    packetLoss?: number;
    updatedAt: string;
  };
}

export interface PlanSummary {
  id: string;
  name: string;
  bandwidthLimitGb: number;
  durationDays: number;
  concurrentDevices: number;
  regionFilters: string[];
  nodeTags: string[];
}

export interface SubscriptionSummary {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'expired' | 'suspended';
  usageGb: number;
  resetDay: number;
  expiresAt: string;
}

export interface TicketSummary {
  id: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'pending' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface ProviderSummary {
  id: string;
  name: string;
  regionHint: string;
  syncIntervalMinutes: number;
  lastSyncAt?: string;
  tags: string[];
}

export interface AlertRuleSummary {
  id: string;
  name: string;
  channel: 'telegram' | 'email';
  severity: 'warning' | 'critical';
  target: string;
  filters?: { region?: string; tag?: string };
}

export interface UserSummary {
  id: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'ops' | 'support' | 'auditor' | 'user';
  createdAt: string;
}

export interface AuditLogSummary {
  id: string;
  user: string;
  action: string;
  targetType: string;
  targetId: string;
  time: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export class AdminApi extends AirportApiClient {
  listNodes(query?: { region?: string; tag?: string; search?: string; page?: number; pageSize?: number }): Promise<PaginatedResult<NodeEndpoint>> {
    return this.request({ path: '/api/nodes', query });
  }

  getNodeMetrics(id: string) {
    return this.request<{ nodeId: string; samples: Array<{ latencyMs: number | null; packetLoss: number; timestamp: string }> }>(
      { path: `/api/nodes/${id}/metrics` },
    );
  }

  listProviders(): Promise<ProviderSummary[]> {
    return this.request({ path: '/api/providers' });
  }

  syncProvider(providerId: string) {
    return this.request<void>({ path: `/api/providers/${providerId}/sync`, method: 'POST' });
  }

  // --- Plans ---
  listPlans(): Promise<PlanSummary[]> {
    return this.request({ path: '/api/plans' });
  }

  createPlan(data: Omit<PlanSummary, 'id'>): Promise<PlanSummary> {
    return this.request({ path: '/api/plans', method: 'POST', body: data });
  }

  updatePlan(id: string, data: Partial<Omit<PlanSummary, 'id'>>): Promise<PlanSummary> {
    return this.request({ path: `/api/plans/${id}`, method: 'PATCH', body: data });
  }

  deletePlan(id: string): Promise<void> {
    return this.request({ path: `/api/plans/${id}`, method: 'DELETE' });
  }

  // --- Subscriptions ---
  listSubscriptions(): Promise<SubscriptionSummary[]> {
    return this.request({ path: '/api/subscriptions' });
  }

  createSubscription(data: Omit<SubscriptionSummary, 'id' | 'status' | 'usageGb' | 'expiresAt'>): Promise<SubscriptionSummary> {
    return this.request({ path: '/api/subscriptions', method: 'POST', body: data });
  }

  updateSubscription(id: string, data: Partial<Omit<SubscriptionSummary, 'id'>>): Promise<SubscriptionSummary> {
    return this.request({ path: `/api/subscriptions/${id}`, method: 'PATCH', body: data });
  }

  deleteSubscription(id: string): Promise<void> {
    return this.request({ path: `/api/subscriptions/${id}`, method: 'DELETE' });
  }

  listUsers(query?: { search?: string; page?: number; pageSize?: number }): Promise<PaginatedResult<UserSummary>> {
    return this.request({ path: '/api/users', query });
  }

  listTickets(query?: { status?: string }): Promise<PaginatedResult<TicketSummary>> {
    return this.request({ path: '/api/tickets', query });
  }

  listAlerts(): Promise<AlertRuleSummary[]> {
    return this.request({ path: '/api/alerts' });
  }

  triggerAlert(id: string, message: string) {
    return this.request({ path: `/api/alerts/${id}/trigger`, method: 'POST', body: { message } });
  }
  getMe(): Promise<{ id: string; email: string; displayName: string; role: string }> {
    return this.request({ path: '/api/me' });
  }

  listAuditLogs(query?: { page?: number; pageSize?: number }): Promise<PaginatedResult<AuditLogSummary>> {
    return this.request({ path: '/api/audit-logs', query });
  }

  listCategories(): Promise<CategorySummary[]> {
    return this.request({ path: '/api/categories' });
  }

  replyTicket(id: string, content: string): Promise<void> {
    return this.request({ path: `/api/tickets/${id}/reply`, method: 'POST', body: { content } });
  }
}

export class AppApi extends AirportApiClient {
  me() {
    return this.request<{ user: { id: string; email: string; displayName: string; role: string }; subscriptions: SubscriptionSummary[]; plans: PlanSummary[] }>(
      { path: '/api/me' },
    );
  }

  listAvailableNodes(): Promise<NodeEndpoint[]> {
    return this.request({ path: '/api/user/nodes' });
  }

  listTickets(): Promise<TicketSummary[]> {
    return this.request({ path: '/api/user/tickets' });
  }

  createTicket(payload: { subject: string; body: string; nodeId?: string; priority?: TicketSummary['priority'] }) {
    return this.request({ path: '/api/user/tickets', method: 'POST', body: payload });
  }
}

export type { PaginatedResult as Paged };
