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
var TelemetryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const prisma_service_1 = require("../database/prisma.service");
const notification_client_1 = require("./notification-client");
const ALERT_COOLDOWN_MS = 10 * 60 * 1000;
let TelemetryService = TelemetryService_1 = class TelemetryService {
    prisma;
    notifier;
    logger = new common_1.Logger(TelemetryService_1.name);
    nodeStream = new rxjs_1.Subject();
    alertStream = new rxjs_1.Subject();
    alertCooldowns = new Map();
    constructor(prisma, notifier) {
        this.prisma = prisma;
        this.notifier = notifier;
    }
    async recordSample(sample) {
        const node = await this.prisma.node.findUnique({
            where: { id: sample.nodeId },
        });
        if (!node)
            return;
        const telemetry = await this.prisma.telemetrySample.create({
            data: {
                nodeId: sample.nodeId,
                latencyMs: sample.latencyMs,
                packetLoss: sample.packetLoss,
                timestamp: new Date(sample.timestamp),
            },
        });
        await this.prisma.node.update({
            where: { id: sample.nodeId },
            data: {
                online: sample.latencyMs !== null,
                lastCheckedAt: new Date(sample.timestamp),
            },
        });
        const availability = sample.latencyMs === null ? 0 : 1 - sample.packetLoss;
        this.nodeStream.next({
            data: { type: 'telemetry', payload: { ...sample, availability } },
        });
        await this.evaluateAlerts(node.region, node.tags || [], telemetry);
    }
    async triggerManualAlert(rule, message) {
        await this.dispatchAlert(rule, message, true);
    }
    listSamples(nodeId) {
        return this.prisma.telemetrySample.findMany({
            where: { nodeId },
            orderBy: { timestamp: 'desc' },
            take: 50,
        });
    }
    nodeObservable() {
        return this.nodeStream.asObservable();
    }
    alertObservable() {
        return this.alertStream.asObservable();
    }
    async evaluateAlerts(region, tags, sample) {
        const rules = (await this.prisma.alertRule.findMany());
        for (const rule of rules) {
            if (rule.regionFilter && rule.regionFilter !== region)
                continue;
            if (rule.tagFilter && !tags.includes(rule.tagFilter))
                continue;
            let triggered = false;
            if (rule.thresholdLatencyMs &&
                sample.latencyMs !== null &&
                sample.latencyMs > rule.thresholdLatencyMs) {
                triggered = true;
            }
            if (rule.thresholdPacketLoss &&
                sample.packetLoss > rule.thresholdPacketLoss) {
                triggered = true;
            }
            if (sample.latencyMs === null && rule.severity === 'critical') {
                triggered = true;
            }
            if (triggered) {
                const message = `节点告警: latency=${sample.latencyMs ?? 'timeout'}ms loss=${Math.round(sample.packetLoss * 100)}%`;
                await this.dispatchAlert(rule, message);
            }
        }
    }
    async dispatchAlert(rule, message, bypassCooldown = false) {
        const now = Date.now();
        if (!bypassCooldown) {
            const lastSent = this.alertCooldowns.get(rule.id);
            if (lastSent && now - lastSent < ALERT_COOLDOWN_MS) {
                this.logger.debug(`Alert suppressed (cooldown): ${rule.name}`);
                return;
            }
        }
        this.alertCooldowns.set(rule.id, now);
        if (rule.channel === 'telegram') {
            await this.notifier.sendTelegram(rule.target, message);
        }
        if (rule.channel === 'email') {
            await this.notifier.sendEmail(rule.target, `告警: ${rule.name}`, message);
        }
        this.alertStream.next({
            data: {
                type: 'alert',
                payload: { ...rule, message, triggeredAt: new Date().toISOString() },
            },
        });
        this.logger.warn(`Alert sent: ${rule.name}`);
    }
};
exports.TelemetryService = TelemetryService;
exports.TelemetryService = TelemetryService = TelemetryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_client_1.NotificationClient])
], TelemetryService);
//# sourceMappingURL=telemetry.service.js.map