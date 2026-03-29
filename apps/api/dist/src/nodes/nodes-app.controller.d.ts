import { NodesService } from './nodes.service';
import type { UserEntity } from '../domain/entities';
export declare class NodesAppController {
    private readonly nodesService;
    constructor(nodesService: NodesService);
    list(user: UserEntity): Promise<{
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
    }[]>;
}
