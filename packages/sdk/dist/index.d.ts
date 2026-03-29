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
export declare class AirportApiClient {
    private readonly baseUrl;
    private readonly defaultHeaders;
    private readonly tokenProvider?;
    constructor(options: ApiClientOptions);
    private resolveToken;
    protected request<TResponse>(options: RequestOptions): Promise<TResponse>;
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
    filters?: {
        region?: string;
        tag?: string;
    };
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
export declare class AdminApi extends AirportApiClient {
    listNodes(query?: {
        region?: string;
        tag?: string;
        search?: string;
        page?: number;
        pageSize?: number;
    }): Promise<PaginatedResult<NodeEndpoint>>;
    getNodeMetrics(id: string): Promise<{
        nodeId: string;
        samples: Array<{
            latencyMs: number | null;
            packetLoss: number;
            timestamp: string;
        }>;
    }>;
    listProviders(): Promise<ProviderSummary[]>;
    syncProvider(providerId: string): Promise<void>;
    listPlans(): Promise<PlanSummary[]>;
    createPlan(data: Omit<PlanSummary, 'id'>): Promise<PlanSummary>;
    updatePlan(id: string, data: Partial<Omit<PlanSummary, 'id'>>): Promise<PlanSummary>;
    deletePlan(id: string): Promise<void>;
    listSubscriptions(): Promise<SubscriptionSummary[]>;
    createSubscription(data: Omit<SubscriptionSummary, 'id' | 'status' | 'usageGb' | 'expiresAt'>): Promise<SubscriptionSummary>;
    updateSubscription(id: string, data: Partial<Omit<SubscriptionSummary, 'id'>>): Promise<SubscriptionSummary>;
    deleteSubscription(id: string): Promise<void>;
    listUsers(query?: {
        search?: string;
        page?: number;
        pageSize?: number;
    }): Promise<PaginatedResult<UserSummary>>;
    listTickets(query?: {
        status?: string;
    }): Promise<PaginatedResult<TicketSummary>>;
    listAlerts(): Promise<AlertRuleSummary[]>;
    triggerAlert(id: string, message: string): Promise<unknown>;
    getMe(): Promise<{
        id: string;
        email: string;
        displayName: string;
        role: string;
    }>;
    listAuditLogs(query?: {
        page?: number;
        pageSize?: number;
    }): Promise<PaginatedResult<AuditLogSummary>>;
    listCategories(): Promise<CategorySummary[]>;
    replyTicket(id: string, content: string): Promise<void>;
}
export declare class AppApi extends AirportApiClient {
    me(): Promise<{
        user: {
            id: string;
            email: string;
            displayName: string;
            role: string;
        };
        subscriptions: SubscriptionSummary[];
        plans: PlanSummary[];
    }>;
    listAvailableNodes(): Promise<NodeEndpoint[]>;
    listTickets(): Promise<TicketSummary[]>;
    createTicket(payload: {
        subject: string;
        body: string;
        nodeId?: string;
        priority?: TicketSummary['priority'];
    }): Promise<unknown>;
}
export type { PaginatedResult as Paged };
//# sourceMappingURL=index.d.ts.map