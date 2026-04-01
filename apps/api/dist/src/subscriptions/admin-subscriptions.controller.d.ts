import { SubscriptionsService } from './subscriptions.service';
export declare class AdminSubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    list(): Promise<{
        id: any;
        user: any;
        plan: any;
        status: any;
        used: any;
        total: any;
        expiry: any;
    }[]>;
    create(user: any, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        usageGb: number;
        resetDay: number;
        expiresAt: Date;
        userId: string;
        planId: string;
    }>;
    remove(user: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        usageGb: number;
        resetDay: number;
        expiresAt: Date;
        userId: string;
        planId: string;
    }>;
}
