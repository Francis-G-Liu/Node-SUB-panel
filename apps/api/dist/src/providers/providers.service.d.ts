import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../observability/audit.service';
export declare class ProvidersService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    list(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        regionHint: string;
        syncIntervalMinutes: number;
        lastSyncAt: Date | null;
        subscriptionUrl: string;
        tags: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    getById(id: string): import("@prisma/client").Prisma.Prisma__ProviderClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        regionHint: string;
        syncIntervalMinutes: number;
        lastSyncAt: Date | null;
        subscriptionUrl: string;
        tags: import("@prisma/client/runtime/library").JsonValue;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    create(payload: {
        name: string;
        regionHint: string;
        subscriptionUrl: string;
        syncIntervalMinutes: number;
        tags?: string[];
    }, operatorId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        regionHint: string;
        syncIntervalMinutes: number;
        lastSyncAt: Date | null;
        subscriptionUrl: string;
        tags: import("@prisma/client/runtime/library").JsonValue;
    }>;
    update(id: string, payload: {
        name?: string;
        regionHint?: string;
        subscriptionUrl?: string;
        syncIntervalMinutes?: number;
        tags?: string[];
    }, operatorId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        regionHint: string;
        syncIntervalMinutes: number;
        lastSyncAt: Date | null;
        subscriptionUrl: string;
        tags: import("@prisma/client/runtime/library").JsonValue;
    }>;
    delete(id: string, operatorId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        regionHint: string;
        syncIntervalMinutes: number;
        lastSyncAt: Date | null;
        subscriptionUrl: string;
        tags: import("@prisma/client/runtime/library").JsonValue;
    }>;
    sync(providerId: string, operatorId?: string): Promise<{
        provider: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            regionHint: string;
            syncIntervalMinutes: number;
            lastSyncAt: Date | null;
            subscriptionUrl: string;
            tags: import("@prisma/client/runtime/library").JsonValue;
        };
        imported: number;
    }>;
}
