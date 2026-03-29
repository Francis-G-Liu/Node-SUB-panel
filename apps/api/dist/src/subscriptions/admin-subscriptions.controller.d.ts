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
    create(data: any): Promise<{
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
    remove(id: string): import("@prisma/client").Prisma.Prisma__SubscriptionClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        usageGb: number;
        resetDay: number;
        expiresAt: Date;
        userId: string;
        planId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
