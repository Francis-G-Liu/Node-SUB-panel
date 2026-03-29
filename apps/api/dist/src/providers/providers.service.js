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
exports.ProvidersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const subscription_parser_1 = require("./subscription-parser");
let ProvidersService = class ProvidersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list() {
        return this.prisma.provider.findMany({ orderBy: { name: 'asc' } });
    }
    getById(id) {
        return this.prisma.provider.findUnique({ where: { id } });
    }
    async create(payload) {
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
        }
        catch (err) {
            console.error('FAILED to create provider', err.message);
            throw err;
        }
    }
    update(id, payload) {
        return this.prisma.provider.update({
            where: { id },
            data: {
                ...payload,
            },
        });
    }
    async delete(id) {
        const nodes = await this.prisma.node.findMany({
            where: { providerId: id },
            select: { id: true },
        });
        const nodeIds = nodes.map((n) => n.id);
        return this.prisma.$transaction(async (tx) => {
            await tx.telemetrySample.deleteMany({
                where: { nodeId: { in: nodeIds } },
            });
            await tx.ticket.updateMany({
                where: { nodeId: { in: nodeIds } },
                data: { nodeId: null },
            });
            await tx.node.deleteMany({
                where: { providerId: id },
            });
            return tx.provider.delete({
                where: { id },
            });
        });
    }
    async sync(providerId) {
        const provider = await this.prisma.provider.findUnique({
            where: { id: providerId },
        });
        if (!provider)
            throw new common_1.NotFoundException('Provider not found');
        const response = await fetch(provider.subscriptionUrl, { method: 'GET' });
        if (!response.ok) {
            throw new common_1.BadGatewayException(`Failed to fetch subscription: ${response.status}`);
        }
        const raw = await response.text();
        const parsed = (0, subscription_parser_1.parseSubscriptionContent)(raw);
        const existingNodes = await this.prisma.node.findMany({
            where: { providerId: provider.id },
        });
        const incomingKeys = new Set(parsed.map((node) => `${node.hostname}:${node.port}:${node.protocol}`));
        const upserts = parsed.map((node) => {
            const extraTags = node.wireProtocol ? [`wire:${node.wireProtocol}`] : [];
            const nodeTags = [
                ...new Set([...(provider.tags || []), ...extraTags]),
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
};
exports.ProvidersService = ProvidersService;
exports.ProvidersService = ProvidersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProvidersService);
//# sourceMappingURL=providers.service.js.map