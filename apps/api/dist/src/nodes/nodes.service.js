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
exports.NodesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const telemetry_service_1 = require("../observability/telemetry.service");
const audit_service_1 = require("../observability/audit.service");
const buildHealth = (sample) => sample
    ? {
        latencyMs: sample.latencyMs,
        packetLoss: sample.packetLoss,
        updatedAt: sample.timestamp.toISOString(),
    }
    : undefined;
let NodesService = class NodesService {
    prisma;
    telemetry;
    audit;
    constructor(prisma, telemetry, audit) {
        this.prisma = prisma;
        this.telemetry = telemetry;
        this.audit = audit;
    }
    async list(filters) {
        const page = filters.page ?? 1;
        const pageSize = filters.pageSize ?? 20;
        const andClauses = [];
        if (filters.region)
            andClauses.push({ region: filters.region });
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
        const where = { AND: andClauses };
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
        }));
        const sampleMap = new Map(latestSamples.map((sample) => [sample.nodeId, sample]));
        const data = nodes.map((node) => ({
            ...node,
            health: buildHealth(sampleMap.get(node.id)),
        }));
        return { data, total, page, pageSize };
    }
    async getById(id) {
        const node = await this.prisma.node.findUnique({ where: { id } });
        if (!node)
            throw new common_1.NotFoundException('Node not found');
        const latest = await this.prisma.telemetrySample.findFirst({
            where: { nodeId: id },
            orderBy: { timestamp: 'desc' },
        });
        return { ...node, health: buildHealth(latest ?? undefined) };
    }
    async getMetrics(id) {
        const node = await this.prisma.node.findUnique({ where: { id } });
        if (!node)
            throw new common_1.NotFoundException('Node missing');
        return this.telemetry.listSamples(id);
    }
    async listForUser(userId) {
        const subscription = await this.prisma.subscription.findFirst({
            where: { userId, status: 'active' },
            include: { plan: true },
        });
        if (!subscription)
            return [];
        const plan = subscription.plan;
        const nodeTags = plan.nodeTags || [];
        const regionFilters = plan.regionFilters || [];
        const nodes = await this.prisma.node.findMany({
            where: {
                active: true,
            },
        });
        let filtered = nodes;
        if (regionFilters.length > 0) {
            filtered = filtered.filter((n) => regionFilters.includes(n.region));
        }
        if (nodeTags.length > 0) {
            filtered = filtered.filter((n) => {
                const nTags = n.tags || [];
                return nodeTags.some((t) => nTags.includes(t));
            });
        }
        const latestSamples = (await this.prisma.telemetrySample.findMany({
            where: { nodeId: { in: nodes.map((node) => node.id) } },
            orderBy: { timestamp: 'desc' },
            distinct: ['nodeId'],
        }));
        const sampleMap = new Map(latestSamples.map((sample) => [sample.nodeId, sample]));
        return filtered.map((node) => ({
            ...node,
            health: buildHealth(sampleMap.get(node.id)),
        }));
    }
    async create(data, operatorId) {
        const providerId = data.providerId ??
            (await this.prisma.provider.findFirst({ select: { id: true } }))?.id;
        if (!providerId) {
            throw new common_1.BadRequestException('No provider available, please create provider first');
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
    async update(id, data, operatorId) {
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
    async delete(id, operatorId) {
        await this.prisma.telemetrySample.deleteMany({ where: { nodeId: id } });
        await this.prisma.node.delete({ where: { id } });
        if (operatorId) {
            await this.audit.recordAction(operatorId, 'DELETE_NODE', 'Node', id);
        }
        return { success: true };
    }
};
exports.NodesService = NodesService;
exports.NodesService = NodesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        telemetry_service_1.TelemetryService,
        audit_service_1.AuditService])
], NodesService);
//# sourceMappingURL=nodes.service.js.map