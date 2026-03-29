import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { hashSync } from 'bcryptjs';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    // 确保系统分类存在 (Ensure system categories exist)
    const adminCat = await this.prisma.userCategory.upsert({
      where: { name: '管理员' },
      update: {},
      create: { name: '管理员', isSystem: true, baseRole: 'super_admin' },
    });

    const userCat = await this.prisma.userCategory.upsert({
      where: { name: '用户' },
      update: {},
      create: { name: '用户', isSystem: true, baseRole: 'user' },
    });

    const existing = await this.prisma.user.findFirst();
    if (existing) return;

    const adminPassword = process.env.SEED_ADMIN_PASSWORD;
    if (!adminPassword) {
      throw new Error(
        'FATAL: SEED_ADMIN_PASSWORD must be defined in environmental variables for security.',
      );
    }
    const opsPassword = process.env.SEED_OPS_PASSWORD ?? 'ops1234';
    const userPassword = process.env.SEED_USER_PASSWORD ?? 'user1234';

    const admin = await this.prisma.user.create({
      data: {
        email: 'admin@airport.dev',
        displayName: 'Super Admin',
        role: 'super_admin',
        passwordHash: hashSync(adminPassword, 10),
        apiToken: 'admin-token',
        categoryId: adminCat.id,
      },
    });

    await this.prisma.user.create({
      data: {
        email: 'ops@airport.dev',
        displayName: 'Ops Lead',
        role: 'ops',
        passwordHash: hashSync(opsPassword, 10),
        apiToken: 'ops-token',
        categoryId: adminCat.id,
      },
    });

    await this.prisma.user.create({
      data: {
        email: 'service@airport.dev',
        displayName: 'Worker Service',
        role: 'ops',
        passwordHash: hashSync('service1234', 10),
        apiToken: 'service-token',
        categoryId: adminCat.id,
      },
    });

    await this.prisma.user.create({
      data: {
        email: 'support@airport.dev',
        displayName: 'Support Crew',
        role: 'support',
        passwordHash: hashSync('support1234', 10),
        apiToken: 'support-token',
        categoryId: adminCat.id,
      },
    });

    const user = await this.prisma.user.create({
      data: {
        email: 'pilot@customer.dev',
        displayName: 'Alpha Pilot',
        role: 'user',
        passwordHash: hashSync(userPassword, 10),
        apiToken: 'user-token',
        categoryId: userCat.id,
      },
    });

    const planPremium = await this.prisma.plan.create({
      data: {
        name: 'Global Premium',
        bandwidthLimitGb: 500,
        durationDays: 30,
        concurrentDevices: 5,
        regionFilters: ['Hong Kong', 'Japan', 'United States'],
        nodeTags: ['premium', 'gamer'],
      },
    });

    await this.prisma.plan.create({
      data: {
        name: 'Standard 200G',
        bandwidthLimitGb: 200,
        durationDays: 30,
        concurrentDevices: 3,
        regionFilters: ['Hong Kong', 'United States'],
        nodeTags: ['standard'],
      },
    });

    await this.prisma.subscription.create({
      data: {
        userId: user.id,
        planId: planPremium.id,
        status: 'active',
        usageGb: 120,
        resetDay: 1,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
      },
    });

    const provider = await this.prisma.provider.create({
      data: {
        name: 'HK Metro CN2',
        regionHint: 'Hong Kong',
        syncIntervalMinutes: 15,
        subscriptionUrl: 'https://example.com/subscription',
        tags: ['cn2', 'iepl'],
      },
    });

    await this.prisma.node.createMany({
      data: [
        {
          providerId: provider.id,
          hostname: 'hkg-01.example.net',
          port: 443,
          protocol: 'trojan',
          region: 'Hong Kong',
          tags: ['premium', 'cn2'],
          maxBandwidthMbps: 1000,
          online: true,
        },
        {
          providerId: provider.id,
          hostname: 'hkg-02.example.net',
          port: 8443,
          protocol: 'vmess',
          region: 'Hong Kong',
          tags: ['standard'],
          maxBandwidthMbps: 500,
          online: false,
        },
      ],
    });

    await this.prisma.alertRule.createMany({
      data: [
        {
          name: 'HK packet loss',
          channel: 'telegram',
          severity: 'warning',
          target: '@airport_ops',
          regionFilter: 'Hong Kong',
          thresholdPacketLoss: 0.2,
        },
        {
          name: 'Premium outage',
          channel: 'email',
          severity: 'critical',
          target: 'noc@airport.dev',
          tagFilter: 'premium',
          thresholdLatencyMs: 300,
        },
      ],
    });

    await this.prisma.ticket.create({
      data: {
        userId: user.id,
        subject: '游戏节点延迟高',
        priority: 'high',
        status: 'open',
        messages: {
          createMany: {
            data: [
              {
                sender: 'user',
                body: '东京节点今晚延迟 250ms。',
                userId: user.id,
              },
              {
                sender: 'admin',
                body: '我们已调度备用线路，请再次测试。',
                userId: admin.id,
              },
            ],
          },
        },
      },
    });

    this.logger.log('Seed data created.');
  }
}
