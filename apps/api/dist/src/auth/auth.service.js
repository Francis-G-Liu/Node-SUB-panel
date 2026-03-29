"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../database/prisma.service");
const bcryptjs_1 = require("bcryptjs");
let AuthService = class AuthService {
    prisma;
    jwtService;
    failedAttempts = new Map();
    MAX_ATTEMPTS = 5;
    LOCK_TIME = 5 * 60 * 1000;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async validateToken(token) {
        if (!token)
            throw new common_1.UnauthorizedException('Missing token');
        const normalized = token.replace(/^Bearer\s+/i, '').trim();
        if (!normalized)
            throw new common_1.UnauthorizedException('Invalid token');
        const jwtUser = await this.tryJwt(normalized);
        if (jwtUser)
            return jwtUser;
        const user = await this.prisma.user.findFirst({
            where: { apiToken: normalized },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid token');
        return user;
    }
    async login(email, password) {
        const now = Date.now();
        const attempts = this.failedAttempts.get(email);
        if (attempts && attempts.count >= this.MAX_ATTEMPTS) {
            if (now - attempts.lastAttempt < this.LOCK_TIME) {
                throw new common_1.UnauthorizedException('Account locked. Please try again later.');
            }
            else {
                this.failedAttempts.delete(email);
            }
        }
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || !(0, bcryptjs_1.compareSync)(password, user.passwordHash)) {
            const current = this.failedAttempts.get(email) || {
                count: 0,
                lastAttempt: 0,
            };
            this.failedAttempts.set(email, {
                count: current.count + 1,
                lastAttempt: now,
            });
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        this.failedAttempts.delete(email);
        const tokens = await this.issueTokens(user.id, user.role);
        return { user, ...tokens };
    }
    async refresh(refreshToken) {
        const payload = this.verifyToken(refreshToken, 'refresh');
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user || !user.refreshTokenHash)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        if (!(0, bcryptjs_1.compareSync)(refreshToken, user.refreshTokenHash))
            throw new common_1.UnauthorizedException('Invalid refresh token');
        return this.issueTokens(user.id, user.role);
    }
    async issueTokens(userId, role) {
        const accessToken = this.jwtService.sign({ sub: userId, role, type: 'access' }, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign({ sub: userId, role, type: 'refresh' }, { expiresIn: '7d' });
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshTokenHash: (0, bcryptjs_1.hashSync)(refreshToken, 10) },
        });
        return { accessToken, refreshToken };
    }
    verifyToken(token, type) {
        try {
            const payload = this.jwtService.verify(token);
            if (payload.type !== type)
                throw new common_1.UnauthorizedException('Invalid token type');
            return payload;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async tryJwt(token) {
        if (token.split('.').length !== 3)
            return null;
        try {
            const payload = this.jwtService.verify(token);
            if (payload.type !== 'access')
                return null;
            return await this.prisma.user.findUnique({ where: { id: payload.sub } });
        }
        catch {
            return null;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map