import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { TelemetryService } from '../observability/telemetry.service';
export interface NodeListFilters {
    region?: string;
    tag?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}
export interface CreateNodeInput {
    providerId?: string;
    hostname: string;
    port: number;
    protocol: 'vmess' | 'vless' | 'trojan' | 'ss' | 'socks' | 'http';
    region: string;
    tags?: string[];
    active?: boolean;
    maxBandwidthMbps?: number;
}
export interface UpdateNodeInput {
    hostname?: string;
    port?: number;
    protocol?: 'vmess' | 'vless' | 'trojan' | 'ss' | 'socks' | 'http';
    region?: string;
    tags?: string[];
    active?: boolean;
    maxBandwidthMbps?: number | null;
}
export declare class NodesService {
    private readonly prisma;
    private readonly telemetry;
    constructor(prisma: PrismaService, telemetry: TelemetryService);
    list(filters: NodeListFilters): Promise<{
        data: {
            health: {
                latencyMs: number | null;
                packetLoss: number;
                updatedAt: string;
            } | undefined;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            tags: Prisma.JsonValue;
            port: number;
            providerId: string;
            hostname: string;
            protocol: import("@prisma/client").$Enums.NodeProtocol;
            region: string;
            maxBandwidthMbps: number | null;
            online: boolean;
            lastCheckedAt: Date | null;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getById(id: string): Promise<{
        health: {
            latencyMs: number | null;
            packetLoss: number;
            updatedAt: string;
        } | undefined;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        tags: Prisma.JsonValue;
        port: number;
        providerId: string;
        hostname: string;
        protocol: import("@prisma/client").$Enums.NodeProtocol;
        region: string;
        maxBandwidthMbps: number | null;
        online: boolean;
        lastCheckedAt: Date | null;
    }>;
    getMetrics(id: string): Promise<{
        id: string;
        createdAt: Date;
        nodeId: string;
        latencyMs: number | null;
        packetLoss: number;
        timestamp: Date;
    }[]>;
    listForUser(userId: string): Promise<{
        health: {
            latencyMs: number | null;
            packetLoss: number;
            updatedAt: string;
        } | undefined;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        tags: Prisma.JsonValue;
        port: number;
        providerId: string;
        hostname: string;
        protocol: import("@prisma/client").$Enums.NodeProtocol;
        region: string;
        maxBandwidthMbps: number | null;
        online: boolean;
        lastCheckedAt: Date | null;
    }[]>;
    create(data: CreateNodeInput): Promise<{
        health: {
            latencyMs: number | null;
            packetLoss: number;
            updatedAt: string;
        } | undefined;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        tags: Prisma.JsonValue;
        port: number;
        providerId: string;
        hostname: string;
        protocol: import("@prisma/client").$Enums.NodeProtocol;
        region: string;
        maxBandwidthMbps: number | null;
        online: boolean;
        lastCheckedAt: Date | null;
    }>;
    update(id: string, data: UpdateNodeInput): Promise<{
        health: {
            latencyMs: number | null;
            packetLoss: number;
            updatedAt: string;
        } | undefined;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        tags: Prisma.JsonValue;
        port: number;
        providerId: string;
        hostname: string;
        protocol: import("@prisma/client").$Enums.NodeProtocol;
        region: string;
        maxBandwidthMbps: number | null;
        online: boolean;
        lastCheckedAt: Date | null;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
