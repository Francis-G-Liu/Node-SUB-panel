import { AuthService } from './auth.service';
import { RefreshDto } from './dto/refresh.dto';
import type { UserEntity } from '../domain/entities';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: {
        username: string;
        password: string;
    }): Promise<{
        success: boolean;
        user: {
            id: string;
            email: string;
            nickname: string;
            role: import("@prisma/client").$Enums.UserRole;
            status: string;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(dto: RefreshDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    me(user: UserEntity): {
        id: string;
        email: string;
        displayName: string;
        role: import("../domain/entities").UserRole;
    };
}
