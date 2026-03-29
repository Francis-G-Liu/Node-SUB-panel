import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { hashSync } from 'bcryptjs';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  listPlans() {
    return this.prisma.plan.findMany({ orderBy: { name: 'asc' } });
  }

  async createPlan(data: any) {
    return this.prisma.plan.create({
      data: {
        ...data,
        nodeTags: data.nodeTags ?? [],
      },
    });
  }

  updatePlan(id: string, data: any) {
    return this.prisma.plan.update({ where: { id }, data });
  }

  deletePlan(id: string) {
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

  async createSubscription(data: any) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: data.planId },
    });
    const duration = plan?.durationDays || 30;

    return this.prisma.subscription.create({
      data: {
        ...data,
        usageGb: data.usageGb ?? 0,
        resetDay: data.resetDay ?? 1,
        expiresAt:
          data.expiresAt ??
          new Date(Date.now() + 1000 * 60 * 60 * 24 * duration),
      },
    });
  }

  deleteSubscription(id: string) {
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

  async createUser(data: any) {
    const { password, ...userData } = data;
    return this.prisma.user.create({
      data: {
        ...userData,
        passwordHash: hashSync(password, 10),
      },
    });
  }

  async updateUser(id: string, data: any) {
    const { password, ...userData } = data;
    const updateData: any = { ...userData };
    if (password) {
      updateData.passwordHash = hashSync(password, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  // User Categories
  listCategories() {
    return this.prisma.userCategory.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  createCategory(data: any) {
    return this.prisma.userCategory.create({ data });
  }

  updateCategory(id: string, data: any) {
    return this.prisma.userCategory.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    const cat = await this.prisma.userCategory.findUnique({ where: { id } });
    if (cat?.isSystem) {
      throw new Error('System categories cannot be deleted');
    }
    return this.prisma.userCategory.delete({ where: { id } });
  }

  async getUserProfile(user: {
    id: string;
    email: string;
    displayName: string;
    role: string;
  }) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId: user.id, status: 'active' },
      include: { plan: true },
    });
    return { user, subscriptions };
  }
}
