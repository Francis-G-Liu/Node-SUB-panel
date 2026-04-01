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
    createUser(currentUser: any, data: any): Promise<{
        id: string;
        email: string;
        displayName: string;
        role: import("@prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string | null;
    }>;
    updateUser(currentUser: any, id: string, data: any): Promise<{
        id: string;
        email: string;
        displayName: string;
        role: import("@prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string | null;
    }>;
    deleteUser(currentUser: any, id: string): Promise<{
        id: string;
        email: string;
        displayName: string;
        role: import("@prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string | null;
    }>;
}
