export type NodeProtocol = 'vmess' | 'vless' | 'trojan' | 'ss' | 'socks' | 'http';
export type UserRole = 'super_admin' | 'ops' | 'support' | 'auditor' | 'user';
export interface ProviderEntity {
    id: string;
    name: string;
    regionHint: string;
    syncIntervalMinutes: number;
    lastSyncAt?: string;
    tags: string[];
}
export interface NodeEntity {
    id: string;
    providerId: string;
    hostname: string;
    port: number;
    protocol: NodeProtocol;
    region: string;
    tags: string[];
    maxBandwidthMbps?: number;
    online: boolean;
    lastCheckedAt?: string;
}
export interface PlanEntity {
    id: string;
    name: string;
    bandwidthLimitGb: number;
    durationDays: number;
    concurrentDevices: number;
    regionFilters: string[];
    nodeTags: string[];
}
export interface SubscriptionEntity {
    id: string;
    userId: string;
    planId: string;
    status: 'active' | 'expired' | 'suspended';
    usageGb: number;
    resetDay: number;
    expiresAt: string;
}
export interface TicketEntity {
    id: string;
    userId: string;
    subject: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'pending' | 'resolved';
    nodeId?: string;
    createdAt: string;
    updatedAt: string;
    messages: Array<{
        id: string;
        sender: 'user' | 'admin';
        body: string;
        createdAt: string;
    }>;
}
export interface AlertRuleEntity {
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
export interface UserEntity {
    id: string;
    email: string;
    displayName: string;
    role: UserRole;
}
export interface TelemetrySampleEntity {
    nodeId: string;
    latencyMs: number | null;
    packetLoss: number;
    timestamp: string;
}
