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
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const bcryptjs_1 = require("bcryptjs");
const audit_service_1 = require("../observability/audit.service");
let SubscriptionsService = class SubscriptionsService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    listPlans() {
        return this.prisma.plan.findMany({ orderBy: { name: 'asc' } });
    }
    async createPlan(data, operatorId) {
        const { name, bandwidthLimitGb, durationDays, concurrentDevices, regionFilters, nodeTags } = data;
        const res = await this.prisma.plan.create({
            data: {
                name,
                bandwidthLimitGb: Number(bandwidthLimitGb),
                durationDays: Number(durationDays),
                concurrentDevices: Number(concurrentDevices),
                regionFilters: regionFilters ?? [],
                nodeTags: nodeTags ?? [],
            },
        });
        if (operatorId) {
            await this.audit.recordAction(operatorId, 'CREATE_PLAN', 'Plan', res.id, { name: res.name });
        }
        return res;
    }
    async updatePlan(id, data, operatorId) {
        const res = await this.prisma.plan.update({ where: { id }, data });
        if (operatorId) {
            await this.audit.recordAction(operatorId, 'UPDATE_PLAN', 'Plan', id, data);
        }
        return res;
    }
    async deletePlan(id, operatorId) {
        const res = await this.prisma.plan.delete({ where: { id } });
        if (operatorId) {
            await this.audit.recordAction(operatorId, 'DELETE_PLAN', 'Plan', id);
        }
        return res;
    }
    listSubscriptions() {
        return this.prisma.subscription.findMany({
            include: {
                user: { select: { email: true, displayName: true } },
                plan: { select: { name: true, bandwidthLimitGb: true } },
            },
        });
    }
    async createSubscription(data, operatorId) {
        const plan = await this.prisma.plan.findUnique({
            where: { id: data.planId },
        });
        const duration = plan?.durationDays || 30;
        const res = await this.prisma.subscription.create({
            data: {
                ...data,
                usageGb: data.usageGb ?? 0,
                resetDay: data.resetDay ?? 1,
                expiresAt: data.expiresAt ??
                    new Date(Date.now() + 1000 * 60 * 60 * 24 * duration),
            },
        });
        if (operatorId) {
            await this.audit.recordAction(operatorId, 'CREATE_SUBSCRIPTION', 'Subscription', res.id, {
                userId: res.userId,
                planId: res.planId,
            });
        }
        return res;
    }
    async deleteSubscription(id, operatorId) {
        const res = await this.prisma.subscription.delete({ where: { id } });
        if (operatorId) {
            await this.audit.recordAction(operatorId, 'DELETE_SUBSCRIPTION', 'Subscription', id);
        }
        return res;
    }
    safeUserSelect = {
        id: true,
        email: true,
        displayName: true,
        role: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
    };
    listUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                categoryId: true,
                category: { select: { name: true } },
            },
        });
    }
    async createUser(data, currentUserRole, operatorId) {
        const { password, role, email, displayName, categoryId } = data;
        const assignedRole = (currentUserRole === 'super_admin' && role) ? role : 'user';
        const res = await this.prisma.user.create({
            data: {
                email,
                displayName,
                categoryId,
                role: assignedRole,
                passwordHash: (0, bcryptjs_1.hashSync)(password, 10),
            },
            select: this.safeUserSelect,
        });
        if (operatorId) {
            await this.audit.recordAction(operatorId, 'CREATE_USER', 'User', res.id, {
                email: res.email,
                role: res.role,
            });
        }
        return res;
    }
    async updateUser(id, data, currentUserRole, operatorId) {
        const { password, role, email, displayName, categoryId } = data;
        const updateData = {};
        if (email !== undefined)
            updateData.email = email;
        if (displayName !== undefined)
            updateData.displayName = displayName;
        if (categoryId !== undefined)
            updateData.categoryId = categoryId;
        if (password) {
            updateData.passwordHash = (0, bcryptjs_1.hashSync)(password, 10);
        }
        if (role && currentUserRole === 'super_admin') {
            updateData.role = role;
        }
        const res = await this.prisma.user.update({
            where: { id },
            data: updateData,
            select: this.safeUserSelect,
        });
        if (operatorId) {
            await this.audit.recordAction(operatorId, 'UPDATE_USER', 'User', id, { ...updateData, passwordHash: undefined });
        }
        return res;
    }
    async deleteUser(id, operatorId) {
        const res = await this.prisma.user.delete({
            where: { id },
            select: this.safeUserSelect,
        });
        if (operatorId) {
            await this.audit.recordAction(operatorId, 'DELETE_USER', 'User', id);
        }
        return res;
    }
    listCategories() {
        return this.prisma.userCategory.findMany({
            orderBy: { createdAt: 'asc' },
        });
    }
    async createCategory(data, operatorId) {
        const { name, baseRole, isSystem } = data;
        const res = await this.prisma.userCategory.create({
            data: {
                name,
                baseRole,
                isSystem: isSystem ?? false,
            },
        });
        if (operatorId) {
            await this.audit.recordAction(operatorId, 'CREATE_CATEGORY', 'UserCategory', res.id, { name: res.name });
        }
        return res;
    }
    async updateCategory(id, data, operatorId) {
        const { name, baseRole, isSystem } = data;
        const res = await this.prisma.userCategory.update({
            where: { id },
            data: {
                name,
                baseRole,
                isSystem,
            },
        });
        if (operatorId) {
            await this.audit.recordAction(operatorId, 'UPDATE_CATEGORY', 'UserCategory', id, { name, baseRole, isSystem });
        }
        return res;
    }
    async deleteCategory(id, operatorId) {
        const cat = await this.prisma.userCategory.findUnique({ where: { id } });
        if (cat?.isSystem) {
            throw new Error('System categories cannot be deleted');
        }
        const res = await this.prisma.userCategory.delete({ where: { id } });
        if (operatorId) {
            await this.audit.recordAction(operatorId, 'DELETE_CATEGORY', 'UserCategory', id);
        }
        return res;
    }
    async getUserProfile(user) {
        const subscriptions = await this.prisma.subscription.findMany({
            where: { userId: user.id, status: 'active' },
            include: { plan: true },
        });
        return { user, subscriptions };
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map