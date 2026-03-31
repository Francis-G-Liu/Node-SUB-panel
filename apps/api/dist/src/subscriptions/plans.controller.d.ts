import { SubscriptionsService } from './subscriptions.service';
export declare class PlansController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    list(): Promise<{
        id: string;
        name: string;
        limit: number;
        days: number;
        devices: number;
        rules: string;
    }[]>;
    create(data: any): Promise<{
        id: string;
        name: string;
        bandwidthLimitGb: number;
        durationDays: number;
        concurrentDevices: number;
        regionFilters: import("@prisma/client/runtime/library").JsonValue;
        nodeTags: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: any): import("@prisma/client").Prisma.Prisma__PlanClient<{
        id: string;
        name: string;
        bandwidthLimitGb: number;
        durationDays: number;
        concurrentDevices: number;
        regionFilters: import("@prisma/client/runtime/library").JsonValue;
        nodeTags: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__PlanClient<{
        id: string;
        name: string;
        bandwidthLimitGb: number;
        durationDays: number;
        concurrentDevices: number;
        regionFilters: import("@prisma/client/runtime/library").JsonValue;
        nodeTags: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
