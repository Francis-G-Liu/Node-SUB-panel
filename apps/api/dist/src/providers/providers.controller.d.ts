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
    create(dto: CreateProviderDto): Promise<{
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
    update(id: string, dto: UpdateProviderDto): import("@prisma/client").Prisma.Prisma__ProviderClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        regionHint: string;
        syncIntervalMinutes: number;
        lastSyncAt: Date | null;
        subscriptionUrl: string;
        tags: import("@prisma/client/runtime/library").JsonValue;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    delete(id: string): Promise<{
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
    sync(id: string): Promise<{
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
