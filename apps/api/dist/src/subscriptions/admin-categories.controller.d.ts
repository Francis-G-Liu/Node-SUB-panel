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
    create(data: any): import("@prisma/client").Prisma.Prisma__UserCategoryClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isSystem: boolean;
        baseRole: import("@prisma/client").$Enums.UserRole;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, data: any): import("@prisma/client").Prisma.Prisma__UserCategoryClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isSystem: boolean;
        baseRole: import("@prisma/client").$Enums.UserRole;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isSystem: boolean;
        baseRole: import("@prisma/client").$Enums.UserRole;
    }>;
}
