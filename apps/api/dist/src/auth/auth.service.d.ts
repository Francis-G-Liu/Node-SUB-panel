import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import type { UserRole } from '../domain/entities';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private failedAttempts;
    private readonly MAX_ATTEMPTS;
    private readonly LOCK_TIME;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateToken(token?: string): Promise<{
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
    login(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
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
        };
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    issueTokens(userId: string, role: UserRole): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private verifyToken;
    private tryJwt;
}
