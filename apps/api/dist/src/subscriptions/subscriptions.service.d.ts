import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../observability/audit.service';
export declare class SubscriptionsService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
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
    createPlan(data: any, operatorId?: string): Promise<{
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
    updatePlan(id: string, data: any, operatorId?: string): Promise<{
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
    deletePlan(id: string, operatorId?: string): Promise<{
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
    createSubscription(data: any, operatorId?: string): Promise<{
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
    deleteSubscription(id: string, operatorId?: string): Promise<{
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
    private readonly safeUserSelect;
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
    createUser(data: any, currentUserRole?: string, operatorId?: string): Promise<{
        id: string;
        email: string;
        displayName: string;
        role: import("@prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string | null;
    }>;
    updateUser(id: string, data: any, currentUserRole?: string, operatorId?: string): Promise<{
        id: string;
        email: string;
        displayName: string;
        role: import("@prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string | null;
    }>;
    deleteUser(id: string, operatorId?: string): Promise<{
        id: string;
        email: string;
        displayName: string;
        role: import("@prisma/client").$Enums.UserRole;
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
    createCategory(data: any, operatorId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isSystem: boolean;
        baseRole: import("@prisma/client").$Enums.UserRole;
    }>;
    updateCategory(id: string, data: any, operatorId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isSystem: boolean;
        baseRole: import("@prisma/client").$Enums.UserRole;
    }>;
    deleteCategory(id: string, operatorId?: string): Promise<{
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
