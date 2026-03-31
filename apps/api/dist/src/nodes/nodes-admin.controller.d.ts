import { NodesService } from './nodes.service';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
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
    create(body: CreateNodeDto): Promise<{
        health: {
            latencyMs: number | null;
            packetLoss: number;
            updatedAt: string;
        } | undefined;
        id: string;
        providerId: string;
        hostname: string;
        port: number;
        protocol: import("@prisma/client").$Enums.NodeProtocol;
        region: string;
        tags: import("@prisma/client/runtime/library").JsonValue;
        maxBandwidthMbps: number | null;
        online: boolean;
        active: boolean;
        lastCheckedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, body: UpdateNodeDto): Promise<{
        health: {
            latencyMs: number | null;
            packetLoss: number;
            updatedAt: string;
        } | undefined;
        id: string;
        providerId: string;
        hostname: string;
        port: number;
        protocol: import("@prisma/client").$Enums.NodeProtocol;
        region: string;
        tags: import("@prisma/client/runtime/library").JsonValue;
        maxBandwidthMbps: number | null;
        online: boolean;
        active: boolean;
        lastCheckedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
