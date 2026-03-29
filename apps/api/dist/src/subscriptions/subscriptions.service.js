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
let SubscriptionsService = class SubscriptionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    listPlans() {
        return this.prisma.plan.findMany({ orderBy: { name: 'asc' } });
    }
    async createPlan(data) {
        return this.prisma.plan.create({
            data: {
                ...data,
                nodeTags: data.nodeTags ?? [],
            },
        });
    }
    updatePlan(id, data) {
        return this.prisma.plan.update({ where: { id }, data });
    }
    deletePlan(id) {
        return this.prisma.plan.delete({ where: { id } });
    }
    listSubscriptions() {
        return this.prisma.subscription.findMany({
            include: {
                user: { select: { email: true, displayName: true } },
                plan: { select: { name: true, bandwidthLimitGb: true } },
            },
        });
    }
    async createSubscription(data) {
        const plan = await this.prisma.plan.findUnique({
            where: { id: data.planId },
        });
        const duration = plan?.durationDays || 30;
        return this.prisma.subscription.create({
            data: {
                ...data,
                usageGb: data.usageGb ?? 0,
                resetDay: data.resetDay ?? 1,
                expiresAt: data.expiresAt ??
                    new Date(Date.now() + 1000 * 60 * 60 * 24 * duration),
            },
        });
    }
    deleteSubscription(id) {
        return this.prisma.subscription.delete({ where: { id } });
    }
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
    async createUser(data) {
        const { password, ...userData } = data;
        return this.prisma.user.create({
            data: {
                ...userData,
                passwordHash: (0, bcryptjs_1.hashSync)(password, 10),
            },
        });
    }
    async updateUser(id, data) {
        const { password, ...userData } = data;
        const updateData = { ...userData };
        if (password) {
            updateData.passwordHash = (0, bcryptjs_1.hashSync)(password, 10);
        }
        return this.prisma.user.update({
            where: { id },
            data: updateData,
        });
    }
    async deleteUser(id) {
        return this.prisma.user.delete({ where: { id } });
    }
    listCategories() {
        return this.prisma.userCategory.findMany({
            orderBy: { createdAt: 'asc' },
        });
    }
    createCategory(data) {
        return this.prisma.userCategory.create({ data });
    }
    updateCategory(id, data) {
        return this.prisma.userCategory.update({
            where: { id },
            data,
        });
    }
    async deleteCategory(id) {
        const cat = await this.prisma.userCategory.findUnique({ where: { id } });
        if (cat?.isSystem) {
            throw new Error('System categories cannot be deleted');
        }
        return this.prisma.userCategory.delete({ where: { id } });
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map