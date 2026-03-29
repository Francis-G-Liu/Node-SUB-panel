import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findFirst();
  if (existing) return;

  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123456';
  const opsPassword = process.env.SEED_OPS_PASSWORD ?? 'ops1234';
  const userPassword = process.env.SEED_USER_PASSWORD ?? 'user1234';

  // Fix E: read API tokens from env vars; hardcoded fallbacks are for local dev ONLY.
  // In production set SEED_ADMIN_API_TOKEN / SEED_OPS_API_TOKEN / SEED_SERVICE_API_TOKEN etc.
  const isProd = process.env.NODE_ENV === 'production';
  const adminApiToken   = process.env.SEED_ADMIN_API_TOKEN   ?? (isProd ? (() => { throw new Error('SEED_ADMIN_API_TOKEN must be set in production'); })() : 'admin-token');
  const opsApiToken     = process.env.SEED_OPS_API_TOKEN     ?? (isProd ? (() => { throw new Error('SEED_OPS_API_TOKEN must be set in production'); })()   : 'ops-token');
  const serviceApiToken = process.env.SEED_SERVICE_API_TOKEN ?? (isProd ? (() => { throw new Error('SEED_SERVICE_API_TOKEN must be set in production'); })() : 'service-token');
  const supportApiToken = process.env.SEED_SUPPORT_API_TOKEN ?? (isProd ? (() => { throw new Error('SEED_SUPPORT_API_TOKEN must be set in production'); })() : 'support-token');
  const userApiToken    = process.env.SEED_USER_API_TOKEN    ?? (isProd ? (() => { throw new Error('SEED_USER_API_TOKEN must be set in production'); })()   : 'user-token');

  if (!isProd) {
    console.warn('[seed] WARNING: Using hardcoded API tokens. Set SEED_*_API_TOKEN env vars in production!');
  }

  const admin = await prisma.user.create({
    data: {
      email: 'admin@airport.dev',
      displayName: 'Super Admin',
      role: 'super_admin',
      passwordHash: hashSync(adminPassword, 10),
      apiToken: adminApiToken,
    },
  });

  await prisma.user.create({
    data: {
      email: 'ops@airport.dev',
      displayName: 'Ops Lead',
      role: 'ops',
      passwordHash: hashSync(opsPassword, 10),
      apiToken: opsApiToken,
    },
  });

  await prisma.user.create({
    data: {
      email: 'service@airport.dev',
      displayName: 'Worker Service',
      role: 'ops',
      passwordHash: hashSync('service1234', 10),
      apiToken: serviceApiToken,
    },
  });

  await prisma.user.create({
    data: {
      email: 'support@airport.dev',
      displayName: 'Support Crew',
      role: 'support',
      passwordHash: hashSync('support1234', 10),
      apiToken: supportApiToken,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'pilot@customer.dev',
      displayName: 'Alpha Pilot',
      role: 'user',
      passwordHash: hashSync(userPassword, 10),
      apiToken: userApiToken,
    },
  });

  const planPremium = await prisma.plan.create({
    data: {
      name: 'Global Premium',
      bandwidthLimitGb: 500,
      durationDays: 30,
      concurrentDevices: 5,
      regionFilters: ['Hong Kong', 'Japan', 'United States'],
      nodeTags: ['premium', 'gamer'],
    },
  });

  await prisma.plan.create({
    data: {
      name: 'Standard 200G',
      bandwidthLimitGb: 200,
      durationDays: 30,
      concurrentDevices: 3,
      regionFilters: ['Hong Kong', 'United States'],
      nodeTags: ['standard'],
    },
  });

  await prisma.subscription.create({
    data: {
      userId: user.id,
      planId: planPremium.id,
      status: 'active',
      usageGb: 120,
      resetDay: 1,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
    },
  });

  const provider = await prisma.provider.create({
    data: {
      name: 'HK Metro CN2',
      regionHint: 'Hong Kong',
      syncIntervalMinutes: 15,
      subscriptionUrl: 'https://example.com/subscription',
      tags: ['cn2', 'iepl'],
    },
  });

  await prisma.node.createMany({
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

  await prisma.alertRule.createMany({
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

  await prisma.ticket.create({
    data: {
      userId: user.id,
      subject: '游戏节点延迟高',
      priority: 'high',
      status: 'open',
      messages: {
        createMany: {
          data: [
            { sender: 'user', body: '东京节点今晚延迟 250ms。', userId: user.id },
            { sender: 'admin', body: '我们已调度备用线路，请再次测试。', userId: admin.id },
          ],
        },
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
