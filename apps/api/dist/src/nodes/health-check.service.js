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
var HealthCheckService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCheckService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../database/prisma.service");
const telemetry_service_1 = require("../observability/telemetry.service");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let HealthCheckService = HealthCheckService_1 = class HealthCheckService {
    prisma;
    telemetry;
    logger = new common_1.Logger(HealthCheckService_1.name);
    constructor(prisma, telemetry) {
        this.prisma = prisma;
        this.telemetry = telemetry;
    }
    onModuleInit() {
        this.logger.log('HealthCheckService initialized');
    }
    async handleCron() {
        this.logger.debug('Running scheduled health check for all active nodes...');
        const nodes = await this.prisma.node.findMany({
            where: { active: true },
        });
        for (const node of nodes) {
            this.checkNode(node);
        }
    }
    async checkNode(node) {
        try {
            const isWindows = process.platform === 'win32';
            const cmd = isWindows
                ? `ping -n 1 ${node.hostname}`
                : `ping -c 1 ${node.hostname}`;
            const startTime = Date.now();
            try {
                const { stdout } = await execAsync(cmd);
                const latencyMs = Date.now() - startTime;
                let parsedLatency = latencyMs;
                const avgMatch = isWindows
                    ? stdout.match(/Average = (\d+)ms/)
                    : stdout.match(/time=(\d+(\.\d+)?)\s+ms/);
                if (avgMatch) {
                    parsedLatency = Math.round(parseFloat(avgMatch[1]));
                }
                await this.telemetry.recordSample({
                    nodeId: node.id,
                    latencyMs: parsedLatency,
                    packetLoss: 0,
                    timestamp: new Date().toISOString(),
                });
                this.logger.debug(`Ping ${node.hostname} SUCCESS: ${parsedLatency}ms`);
            }
            catch (err) {
                await this.telemetry.recordSample({
                    nodeId: node.id,
                    latencyMs: null,
                    packetLoss: 1,
                    timestamp: new Date().toISOString(),
                });
                this.logger.warn(`Ping ${node.hostname} FAILED (Timeout or Unreachable)`);
            }
        }
        catch (err) {
            this.logger.error(`Health check error for ${node.hostname}: ${err}`);
        }
    }
};
exports.HealthCheckService = HealthCheckService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthCheckService.prototype, "handleCron", null);
exports.HealthCheckService = HealthCheckService = HealthCheckService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        telemetry_service_1.TelemetryService])
], HealthCheckService);
//# sourceMappingURL=health-check.service.js.map