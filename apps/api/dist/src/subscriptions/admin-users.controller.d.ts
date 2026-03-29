import { SubscriptionsService } from './subscriptions.service';
export declare class AdminUsersController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    listUsers(): Promise<{
        data: {
            id: any;
            email: any;
            nickname: any;
            role: any;
            status: string;
        }[];
        total: number;
    }>;
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
}
