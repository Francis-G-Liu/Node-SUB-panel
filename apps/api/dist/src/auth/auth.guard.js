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
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const graphql_1 = require("@nestjs/graphql");
const auth_service_1 = require("./auth.service");
const roles_decorator_1 = require("./roles.decorator");
const public_decorator_1 = require("./public.decorator");
let AuthGuard = class AuthGuard {
    authService;
    reflector;
    constructor(authService, reflector) {
        this.authService = authService;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic)
            return true;
        const request = this.resolveRequest(context);
        const authHeader = request.headers['authorization'];
        const queryToken = request.query?.token
            ? `Bearer ${request.query.token}`
            : undefined;
        const user = await this.authService.validateToken(authHeader || queryToken);
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [context.getHandler(), context.getClass()]);
        if (requiredRoles && !requiredRoles.includes(user.role)) {
            throw new common_1.ForbiddenException('Insufficient role');
        }
        request.user = {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
        };
        return true;
    }
    resolveRequest(context) {
        const type = context.getType();
        if (type === 'http') {
            return context.switchToHttp().getRequest();
        }
        if (type === 'graphql') {
            const gqlCtx = graphql_1.GqlExecutionContext.create(context);
            return gqlCtx.getContext().req;
        }
        throw new common_1.UnauthorizedException('Unsupported context');
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        core_1.Reflector])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map