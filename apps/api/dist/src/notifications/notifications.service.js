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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const telemetry_service_1 = require("../observability/telemetry.service");
let NotificationsService = class NotificationsService {
    prisma;
    telemetry;
    constructor(prisma, telemetry) {
        this.prisma = prisma;
        this.telemetry = telemetry;
    }
    listRules() {
        return this.prisma.alertRule.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async trigger(ruleId, message) {
        const rule = await this.prisma.alertRule.findUnique({
            where: { id: ruleId },
        });
        if (!rule)
            throw new common_1.NotFoundException('Alert rule not found');
        await this.telemetry.triggerManualAlert(rule, message);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        telemetry_service_1.TelemetryService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map