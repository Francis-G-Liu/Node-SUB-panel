import { PrismaService } from '../database/prisma.service';
export declare class SubscriptionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listPlans(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        bandwidthLimitGb: number;
        durationDays: number;
        concurrentDevices: number;
        regionFilters: import("@prisma/client/runtime/library").JsonValue;
        nodeTags: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    createPlan(data: any): Promise<{
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
    updatePlan(id: string, data: any): import("@prisma/client").Prisma.Prisma__PlanClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        bandwidthLimitGb: number;
        durationDays: number;
        concurrentDevices: number;
        regionFilters: import("@prisma/client/runtime/library").JsonValue;
        nodeTags: import("@prisma/client/runtime/library").JsonValue;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    deletePlan(id: string): import("@prisma/client").Prisma.Prisma__PlanClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        bandwidthLimitGb: number;
        durationDays: number;
        concurrentDevices: number;
        regionFilters: import("@prisma/client/runtime/library").JsonValue;
        nodeTags: import("@prisma/client/runtime/library").JsonValue;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    listSubscriptions(): import("@prisma/client").Prisma.PrismaPromise<({
        user: {
            email: string;
            displayName: string;
        };
        plan: {
            name: string;
            bandwidthLimitGb: number;
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
    })[]>;
    createSubscription(data: any): Promise<{
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
    deleteSubscription(id: string): import("@prisma/client").Prisma.Prisma__SubscriptionClient<{
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
    listUsers(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        email: string;
        displayName: string;
        role: import("@prisma/client").$Enums.UserRole;
        categoryId: string | null;
        category: {
            name: string;
        } | null;
    }[]>;
    createUser(data: any): Promise<{
        id: string;
        email: string;
        displayName: string;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        apiToken: string | null;
        refreshTokenHash: string | null;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string | null;
    }>;
    updateUser(id: string, data: any): Promise<{
        id: string;
        email: string;
        displayName: string;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        apiToken: string | null;
        refreshTokenHash: string | null;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string | null;
    }>;
    deleteUser(id: string): Promise<{
        id: string;
        email: string;
        displayName: string;
        role: import("@prisma/client").$Enums.UserRole;
        passwordHash: string;
        apiToken: string | null;
        refreshTokenHash: string | null;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string | null;
    }>;
    listCategories(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isSystem: boolean;
        baseRole: import("@prisma/client").$Enums.UserRole;
    }[]>;
    createCategory(data: any): import("@prisma/client").Prisma.Prisma__UserCategoryClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isSystem: boolean;
        baseRole: import("@prisma/client").$Enums.UserRole;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateCategory(id: string, data: any): import("@prisma/client").Prisma.Prisma__UserCategoryClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isSystem: boolean;
        baseRole: import("@prisma/client").$Enums.UserRole;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    deleteCategory(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isSystem: boolean;
        baseRole: import("@prisma/client").$Enums.UserRole;
    }>;
    getUserProfile(user: {
        id: string;
        email: string;
        displayName: string;
        role: string;
    }): Promise<{
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
