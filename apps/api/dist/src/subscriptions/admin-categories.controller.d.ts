import { SubscriptionsService } from './subscriptions.service';
export declare class AdminCategoriesController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    list(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isSystem: boolean;
        baseRole: import("@prisma/client").$Enums.UserRole;
    }[]>;
    create(user: any, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isSystem: boolean;
        baseRole: import("@prisma/client").$Enums.UserRole;
    }>;
    update(user: any, id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isSystem: boolean;
        baseRole: import("@prisma/client").$Enums.UserRole;
    }>;
    delete(user: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isSystem: boolean;
        baseRole: import("@prisma/client").$Enums.UserRole;
    }>;
}
