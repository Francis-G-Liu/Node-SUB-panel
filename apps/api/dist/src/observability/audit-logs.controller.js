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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const roles_decorator_1 = require("../auth/roles.decorator");
let AuditLogsController = class AuditLogsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(page = '1', pageSize = '20') {
        const skip = (Number(page) - 1) * Number(pageSize);
        const take = Number(pageSize);
        const [total, logs] = await Promise.all([
            this.prisma.auditLog.count(),
            this.prisma.auditLog.findMany({
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { email: true } } },
            }),
        ]);
        return {
            total,
            data: logs.map((log) => ({
                id: log.id,
                user: log.user?.email || 'System',
                action: log.action,
                targetType: log.targetType,
                targetId: log.targetId,
                time: log.createdAt,
            })),
        };
    }
};
exports.AuditLogsController = AuditLogsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuditLogsController.prototype, "list", null);
exports.AuditLogsController = AuditLogsController = __decorate([
    (0, common_1.Controller)('audit-logs'),
    (0, roles_decorator_1.Roles)('super_admin', 'auditor'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogsController);
//# sourceMappingURL=audit-logs.controller.js.map