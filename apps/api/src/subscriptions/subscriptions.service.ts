import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { hashSync } from 'bcryptjs';
import { AuditService } from '../observability/audit.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  listPlans() {
    return this.prisma.plan.findMany({ orderBy: { name: 'asc' } });
  }

  async createPlan(data: any, operatorId?: string) {
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

  async updatePlan(id: string, data: any, operatorId?: string) {
    const res = await this.prisma.plan.update({ where: { id }, data });
    if (operatorId) {
      await this.audit.recordAction(operatorId, 'UPDATE_PLAN', 'Plan', id, data);
    }
    return res;
  }

  async deletePlan(id: string, operatorId?: string) {
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

  async createSubscription(data: any, operatorId?: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: data.planId },
    });
    const duration = plan?.durationDays || 30;

    const res = await this.prisma.subscription.create({
      data: {
        ...data,
        usageGb: data.usageGb ?? 0,
        resetDay: data.resetDay ?? 1,
        expiresAt:
          data.expiresAt ??
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

  async deleteSubscription(id: string, operatorId?: string) {
    const res = await this.prisma.subscription.delete({ where: { id } });
    if (operatorId) {
      await this.audit.recordAction(operatorId, 'DELETE_SUBSCRIPTION', 'Subscription', id);
    }
    return res;
  }

  // User Categories and Auth Safeguards
  private readonly safeUserSelect = {
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

  async createUser(data: any, currentUserRole?: string, operatorId?: string) {
    const { password, role, email, displayName, categoryId } = data;
    
    // Safety: Only super_admin can set roles or system permissions. Others default to 'user'.
    const assignedRole = (currentUserRole === 'super_admin' && role) ? role : 'user';

    const res = await this.prisma.user.create({
      data: {
        email,
        displayName,
        categoryId,
        role: assignedRole,
        passwordHash: hashSync(password, 10),
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

  async updateUser(id: string, data: any, currentUserRole?: string, operatorId?: string) {
    const { password, role, email, displayName, categoryId } = data;
    
    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (password) {
      updateData.passwordHash = hashSync(password, 10);
    }
    
    // Only super_admin can change roles
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

  async deleteUser(id: string, operatorId?: string) {
    const res = await this.prisma.user.delete({ 
      where: { id },
      select: this.safeUserSelect,
    });

    if (operatorId) {
      await this.audit.recordAction(operatorId, 'DELETE_USER', 'User', id);
    }

    return res;
  }

  // User Categories

  listCategories() {
    return this.prisma.userCategory.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async createCategory(data: any, operatorId?: string) {
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

  async updateCategory(id: string, data: any, operatorId?: string) {
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

  async deleteCategory(id: string, operatorId?: string) {
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
