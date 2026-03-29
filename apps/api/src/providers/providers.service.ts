import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { parseSubscriptionContent } from './subscription-parser';

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.provider.findMany({ orderBy: { name: 'asc' } });
  }

  getById(id: string) {
    return this.prisma.provider.findUnique({ where: { id } });
  }

  async create(payload: {
    name: string;
    regionHint: string;
    subscriptionUrl: string;
    syncIntervalMinutes: number;
    tags?: string[];
  }) {
    try {
      const res = await this.prisma.provider.create({
        data: {
          name: payload.name,
          regionHint: payload.regionHint,
          subscriptionUrl: payload.subscriptionUrl,
          syncIntervalMinutes: payload.syncIntervalMinutes,
          tags: payload.tags ?? [],
        },
      });

      return res;
    } catch (err: any) {
      console.error('FAILED to create provider', err.message);
      throw err;
    }
  }

  update(
    id: string,
    payload: {
      name?: string;
      regionHint?: string;
      subscriptionUrl?: string;
      syncIntervalMinutes?: number;
      tags?: string[];
    },
  ) {
    return this.prisma.provider.update({
      where: { id },
      data: {
        ...payload,
      },
    });
  }

  async delete(id: string) {
    const nodes = await this.prisma.node.findMany({
      where: { providerId: id },
      select: { id: true },
    });
    const nodeIds = nodes.map((n) => n.id);

    return this.prisma.$transaction(async (tx) => {
      // 1. Delete telemetry samples for these nodes
      await tx.telemetrySample.deleteMany({
        where: { nodeId: { in: nodeIds } },
      });

      // 2. Nullify nodeId in Tickets
      await tx.ticket.updateMany({
        where: { nodeId: { in: nodeIds } },
        data: { nodeId: null },
      });

      // 3. Delete the nodes
      await tx.node.deleteMany({
        where: { providerId: id },
      });

      // 4. Finally delete the provider
      return tx.provider.delete({
        where: { id },
      });
    });
  }

  async sync(providerId: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId },
    });
    if (!provider) throw new NotFoundException('Provider not found');

    const response = await fetch(provider.subscriptionUrl, { method: 'GET' });
    if (!response.ok) {
      // Fix #12: return 502 Bad Gateway when upstream subscription fetch fails
      throw new BadGatewayException(
        `Failed to fetch subscription: ${response.status}`,
      );
    }
    const raw = await response.text();
    const parsed = parseSubscriptionContent(raw);

    const existingNodes = await this.prisma.node.findMany({
      where: { providerId: provider.id },
    });
    const incomingKeys = new Set(
      parsed.map((node) => `${node.hostname}:${node.port}:${node.protocol}`),
    );

    const upserts = parsed.map((node) => {
      // Build a tag array that carries wireProtocol info for new-gen protocols
      const extraTags = node.wireProtocol ? [`wire:${node.wireProtocol}`] : [];
      const nodeTags = [
        ...new Set([...((provider.tags as string[]) || []), ...extraTags]),
      ];

      return this.prisma.node.upsert({
        where: {
          providerId_hostname_port_protocol: {
            providerId: provider.id,
            hostname: node.hostname,
            port: node.port,
            protocol: node.protocol,
          },
        },
        update: {
          region: provider.regionHint,
          tags: nodeTags,
          active: true,
        },
        create: {
          providerId: provider.id,
          hostname: node.hostname,
          port: node.port,
          protocol: node.protocol,
          region: provider.regionHint,
          tags: nodeTags,
          active: true,
          online: false,
        },
      });
    });

    await this.prisma.$transaction(upserts);

    for (const node of existingNodes) {
      const key = `${node.hostname}:${node.port}:${node.protocol}`;
      if (!incomingKeys.has(key) && node.active) {
        await this.prisma.node.update({
          where: { id: node.id },
          data: { active: false },
        });
      }
    }

    const updated = await this.prisma.provider.update({
      where: { id: provider.id },
      data: { lastSyncAt: new Date() },
    });

    return { provider: updated, imported: parsed.length };
  }
}
