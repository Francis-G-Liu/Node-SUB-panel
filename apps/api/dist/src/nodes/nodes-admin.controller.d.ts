import { NodesService } from './nodes.service';
interface CreateNodeBody {
    providerId?: string;
    hostname: string;
    port: number | string;
    protocol: 'vmess' | 'vless' | 'trojan' | 'ss' | 'socks' | 'http';
    region: string;
    tags?: string[];
    active?: boolean;
    maxBandwidthMbps?: number;
}
interface UpdateNodeBody {
    hostname?: string;
    port?: number | string;
    protocol?: 'vmess' | 'vless' | 'trojan' | 'ss' | 'socks' | 'http';
    region?: string;
    tags?: string[];
    active?: boolean;
    maxBandwidthMbps?: number | null;
}
export declare class NodesAdminController {
    private readonly nodesService;
    constructor(nodesService: NodesService);
    list(region?: string, tag?: string, search?: string, page?: string, pageSize?: string): Promise<{
        data: {
            id: any;
            protocol: any;
            host: any;
            port: any;
            region: any;
            status: string;
            active: any;
            latency: any;
            packetLoss: any;
            tags: any;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    findOne(id: string): Promise<{
        id: string;
        protocol: import("@prisma/client").$Enums.NodeProtocol;
        host: string;
        port: number;
        region: string;
        status: string;
        active: boolean;
        latency: number;
        packetLoss: number;
        tags: import("@prisma/client/runtime/library").JsonValue;
    } | null>;
    metrics(id: string): Promise<{
        nodeId: string;
        samples: {
            id: string;
            createdAt: Date;
            nodeId: string;
            latencyMs: number | null;
            packetLoss: number;
            timestamp: Date;
        }[];
    }>;
    create(body: CreateNodeBody): Promise<{
        health: {
            latencyMs: number | null;
            packetLoss: number;
            updatedAt: string;
        } | undefined;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        tags: import("@prisma/client/runtime/library").JsonValue;
        port: number;
        providerId: string;
        hostname: string;
        protocol: import("@prisma/client").$Enums.NodeProtocol;
        region: string;
        maxBandwidthMbps: number | null;
        online: boolean;
        lastCheckedAt: Date | null;
    }>;
    update(id: string, body: UpdateNodeBody): Promise<{
        health: {
            latencyMs: number | null;
            packetLoss: number;
            updatedAt: string;
        } | undefined;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        tags: import("@prisma/client/runtime/library").JsonValue;
        port: number;
        providerId: string;
        hostname: string;
        protocol: import("@prisma/client").$Enums.NodeProtocol;
        region: string;
        maxBandwidthMbps: number | null;
        online: boolean;
        lastCheckedAt: Date | null;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
export {};
