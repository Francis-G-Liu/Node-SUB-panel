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
    create(user: any, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        bandwidthLimitGb: number;
        durationDays: number;
        concurrentDevices: number;
        regionFilters: import("@prisma/client/runtime/library").JsonValue;
        nodeTags: import("@prisma/client/runtime/library").JsonValue;
    }>;
    update(user: any, id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        bandwidthLimitGb: number;
        durationDays: number;
        concurrentDevices: number;
        regionFilters: import("@prisma/client/runtime/library").JsonValue;
        nodeTags: import("@prisma/client/runtime/library").JsonValue;
    }>;
    remove(user: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        bandwidthLimitGb: number;
        durationDays: number;
        concurrentDevices: number;
        regionFilters: import("@prisma/client/runtime/library").JsonValue;
        nodeTags: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
