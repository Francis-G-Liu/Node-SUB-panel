import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { TelemetryService } from '../observability/telemetry.service';
import { AuditService } from '../observability/audit.service';

export interface NodeListFilters {
  region?: string;
  tag?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateNodeInput {
  providerId?: string;
  hostname: string;
  port: number;
  protocol: 'vmess' | 'vless' | 'trojan' | 'ss' | 'socks' | 'http';
  region: string;
  tags?: string[];
  active?: boolean;
  maxBandwidthMbps?: number;
}

export interface UpdateNodeInput {
  hostname?: string;
  port?: number;
  protocol?: 'vmess' | 'vless' | 'trojan' | 'ss' | 'socks' | 'http';
  region?: string;
  tags?: string[];
  active?: boolean;
  maxBandwidthMbps?: number | null;
}

type LatestSample = {
  nodeId: string;
  latencyMs: number | null;
  packetLoss: number;
  timestamp: Date;
};

const buildHealth = (sample: LatestSample | undefined) =>
  sample
    ? {
        latencyMs: sample.latencyMs,
        packetLoss: sample.packetLoss,
        updatedAt: sample.timestamp.toISOString(),
      }
    : undefined;

@Injectable()
export class NodesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telemetry: TelemetryService,
    private readonly audit: AuditService,
  ) {}

  async list(filters: NodeListFilters) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;

    // Fix #8 + #9: use proper Prisma types; combine search OR with AND on top-level filters
    const andClauses: Prisma.NodeWhereInput[] = [];
    if (filters.region) andClauses.push({ region: filters.region });
    // SQLite JSON doesn't support 'has' directly. Simple contains on the stringified JSON or fetch & filter.
    // Here we'll just skip tag filtering on DB level for SQLite or use string contains as a fallback.
    if (filters.tag)
      andClauses.push({ tags: { path: '$', string_contains: filters.tag } });
    if (filters.search) {
      andClauses.push({
        OR: [
          { hostname: { contains: filters.search } },
          { region: { contains: filters.search } },
        ],
      });
    }
    const where: Prisma.NodeWhereInput = { AND: andClauses };

    const [total, nodes] = await Promise.all([
      this.prisma.node.count({ where }),
      this.prisma.node.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const latestSamples = (await this.prisma.telemetrySample.findMany({
      where: { nodeId: { in: nodes.map((node) => node.id) } },
      orderBy: { timestamp: 'desc' },
      distinct: ['nodeId'],
    })) as LatestSample[];

    const sampleMap = new Map(
      latestSamples.map((sample) => [sample.nodeId, sample]),
    );
    const data = nodes.map((node) => ({
      ...node,
      health: buildHealth(sampleMap.get(node.id)),
    }));

    return { data, total, page, pageSize };
  }

  async getById(id: string) {
    const node = await this.prisma.node.findUnique({ where: { id } });
    if (!node) throw new NotFoundException('Node not found');
    const latest = await this.prisma.telemetrySample.findFirst({
      where: { nodeId: id },
      orderBy: { timestamp: 'desc' },
    });
    return { ...node, health: buildHealth(latest ?? undefined) };
  }

  async getMetrics(id: string) {
    const node = await this.prisma.node.findUnique({ where: { id } });
    if (!node) throw new NotFoundException('Node missing');
    return this.telemetry.listSamples(id);
  }

  async listForUser(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: 'active' },
      include: { plan: true },
    });
    if (!subscription) return [];
    const plan = subscription.plan;

    const nodeTags = (plan.nodeTags as string[]) || [];
    const regionFilters = (plan.regionFilters as string[]) || [];

    const nodes = await this.prisma.node.findMany({
      where: {
        active: true,
      },
    });

    // In-memory filter for SQLite consistency
    let filtered = nodes;
    if (regionFilters.length > 0) {
      filtered = filtered.filter((n) => regionFilters.includes(n.region));
    }
    if (nodeTags.length > 0) {
      filtered = filtered.filter((n) => {
        const nTags = (n.tags as string[]) || [];
        return nodeTags.some((t) => nTags.includes(t));
      });
    }

    const latestSamples = (await this.prisma.telemetrySample.findMany({
      where: { nodeId: { in: nodes.map((node) => node.id) } },
      orderBy: { timestamp: 'desc' },
      distinct: ['nodeId'],
    })) as LatestSample[];

    const sampleMap = new Map(
      latestSamples.map((sample) => [sample.nodeId, sample]),
    );
    return filtered.map((node) => ({
      ...node,
      health: buildHealth(sampleMap.get(node.id)),
    }));
  }

  async create(data: CreateNodeInput, operatorId?: string) {
    const providerId =
      data.providerId ??
      (await this.prisma.provider.findFirst({ select: { id: true } }))?.id;
    if (!providerId) {
      throw new BadRequestException(
        'No provider available, please create provider first',
      );
    }
    const created = await this.prisma.node.create({
      data: {
        providerId,
        hostname: data.hostname,
        port: data.port,
        protocol: data.protocol,
        region: data.region,
        tags: data.tags ?? [],
        active: data.active ?? true,
        maxBandwidthMbps: data.maxBandwidthMbps,
      },
    });

    if (operatorId) {
      await this.audit.recordAction(operatorId, 'CREATE_NODE', 'Node', created.id, {
        hostname: created.hostname,
      });
    }

    return this.getById(created.id);
  }

  async update(id: string, data: UpdateNodeInput, operatorId?: string) {
    await this.prisma.node.findUniqueOrThrow({ where: { id } });
    await this.prisma.node.update({
      where: { id },
      data: {
        hostname: data.hostname,
        port: data.port,
        protocol: data.protocol,
        region: data.region,
        tags: data.tags,
        active: data.active,
        maxBandwidthMbps: data.maxBandwidthMbps,
      },
    });

    if (operatorId) {
      await this.audit.recordAction(operatorId, 'UPDATE_NODE', 'Node', id, data);
    }

    return this.getById(id);
  }

  async delete(id: string, operatorId?: string) {
    await this.prisma.telemetrySample.deleteMany({ where: { nodeId: id } });
    await this.prisma.node.delete({ where: { id } });

    if (operatorId) {
      await this.audit.recordAction(operatorId, 'DELETE_NODE', 'Node', id);
    }

    return { success: true };
  }
}
