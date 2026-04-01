import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
export declare class ProvidersController {
    private readonly providersService;
    constructor(providersService: ProvidersService);
    list(): Promise<{
        id: string;
        name: string;
        url: string;
        region: string;
        interval: number;
        lastSync: Date | null;
        tags: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        url: string;
        region: string;
        interval: number;
        lastSync: Date | null;
        tags: import("@prisma/client/runtime/library").JsonValue;
    } | null>;
    create(user: any, dto: CreateProviderDto): Promise<{
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
    update(user: any, id: string, dto: UpdateProviderDto): Promise<{
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
    delete(user: any, id: string): Promise<{
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
    sync(user: any, id: string): Promise<{
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
