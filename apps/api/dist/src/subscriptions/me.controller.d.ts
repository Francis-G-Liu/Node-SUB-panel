import { SubscriptionsService } from './subscriptions.service';
import type { UserEntity } from '../domain/entities';
export declare class MeController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    profile(user: UserEntity): Promise<{
        user: {
            id: string;
            email: string;
            displayName: string;
            role: string;
        };
        subscriptions: ({
            plan: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                bandwidthLimitGb: number;
                durationDays: number;
                concurrentDevices: number;
                regionFilters: import("@prisma/client/runtime/library").JsonValue;
                nodeTags: import("@prisma/client/runtime/library").JsonValue;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.SubscriptionStatus;
            usageGb: number;
            resetDay: number;
            expiresAt: Date;
            userId: string;
            planId: string;
        })[];
    }>;
}
