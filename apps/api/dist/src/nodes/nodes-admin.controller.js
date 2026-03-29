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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodesAdminController = void 0;
const common_1 = require("@nestjs/common");
const nodes_service_1 = require("./nodes.service");
const roles_decorator_1 = require("../auth/roles.decorator");
let NodesAdminController = class NodesAdminController {
    nodesService;
    constructor(nodesService) {
        this.nodesService = nodesService;
    }
    async list(region, tag, search, page = '1', pageSize = '20') {
        const result = await this.nodesService.list({
            region,
            tag,
            search,
            page: Number(page),
            pageSize: Number(pageSize),
        });
        return {
            ...result,
            data: result.data.map((node) => ({
                id: node.id,
                protocol: node.protocol,
                host: node.hostname,
                port: node.port,
                region: node.region,
                status: node.online ? 'online' : 'offline',
                active: node.active,
                latency: node.health?.latencyMs ?? 0,
                packetLoss: node.health?.packetLoss ?? 0,
                tags: node.tags,
            })),
        };
    }
    async findOne(id) {
        const node = await this.nodesService.getById(id);
        if (!node)
            return null;
        return {
            id: node.id,
            protocol: node.protocol,
            host: node.hostname,
            port: node.port,
            region: node.region,
            status: node.online ? 'online' : 'offline',
            active: node.active,
            latency: node.health?.latencyMs ?? 0,
            packetLoss: node.health?.packetLoss ?? 0,
            tags: node.tags,
        };
    }
    async metrics(id) {
        return { nodeId: id, samples: await this.nodesService.getMetrics(id) };
    }
    create(body) {
        return this.nodesService.create({
            providerId: body.providerId,
            hostname: body.hostname,
            port: Number(body.port),
            protocol: body.protocol,
            region: body.region,
            tags: body.tags ?? [],
            active: body.active,
            maxBandwidthMbps: body.maxBandwidthMbps,
        });
    }
    update(id, body) {
        return this.nodesService.update(id, {
            hostname: body.hostname,
            port: body.port !== undefined ? Number(body.port) : undefined,
            protocol: body.protocol,
            region: body.region,
            tags: body.tags,
            active: body.active,
            maxBandwidthMbps: body.maxBandwidthMbps,
        });
    }
    remove(id) {
        return this.nodesService.delete(id);
    }
};
exports.NodesAdminController = NodesAdminController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('region')),
    __param(1, (0, common_1.Query)('tag')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], NodesAdminController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NodesAdminController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/metrics'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NodesAdminController.prototype, "metrics", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('super_admin', 'ops'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NodesAdminController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('super_admin', 'ops'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NodesAdminController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('super_admin', 'ops'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NodesAdminController.prototype, "remove", null);
exports.NodesAdminController = NodesAdminController = __decorate([
    (0, common_1.Controller)('nodes'),
    (0, roles_decorator_1.Roles)('super_admin', 'ops', 'support', 'auditor'),
    __metadata("design:paramtypes", [nodes_service_1.NodesService])
], NodesAdminController);
//# sourceMappingURL=nodes-admin.controller.js.map