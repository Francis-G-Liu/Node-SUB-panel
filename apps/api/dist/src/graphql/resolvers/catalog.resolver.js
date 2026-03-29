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
exports.CatalogResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const roles_decorator_1 = require("../../auth/roles.decorator");
const nodes_service_1 = require("../../nodes/nodes.service");
const subscriptions_service_1 = require("../../subscriptions/subscriptions.service");
const tickets_service_1 = require("../../tickets/tickets.service");
const node_model_1 = require("../models/node.model");
const plan_model_1 = require("../models/plan.model");
const ticket_model_1 = require("../models/ticket.model");
let CatalogResolver = class CatalogResolver {
    nodesService;
    subscriptionsService;
    ticketsService;
    constructor(nodesService, subscriptionsService, ticketsService) {
        this.nodesService = nodesService;
        this.subscriptionsService = subscriptionsService;
        this.ticketsService = ticketsService;
    }
    async nodesSnapshot() {
        const result = await this.nodesService.list({ page: 1, pageSize: 100 });
        return result.data.map((node) => ({
            id: node.id,
            providerId: node.providerId,
            hostname: node.hostname,
            region: node.region,
            tags: node.tags || [],
            latencyMs: node.health?.latencyMs ?? null,
        }));
    }
    plansSnapshot() {
        return this.subscriptionsService.listPlans();
    }
    async openTickets() {
        const result = await this.ticketsService.listForAdmin({ pageSize: 200 });
        return result.data.filter((ticket) => ticket.status !== 'resolved');
    }
};
exports.CatalogResolver = CatalogResolver;
__decorate([
    (0, graphql_1.Query)(() => [node_model_1.NodeModel]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogResolver.prototype, "nodesSnapshot", null);
__decorate([
    (0, graphql_1.Query)(() => [plan_model_1.PlanModel]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CatalogResolver.prototype, "plansSnapshot", null);
__decorate([
    (0, graphql_1.Query)(() => [ticket_model_1.TicketModel]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogResolver.prototype, "openTickets", null);
exports.CatalogResolver = CatalogResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, roles_decorator_1.Roles)('super_admin', 'ops', 'support'),
    __metadata("design:paramtypes", [nodes_service_1.NodesService,
        subscriptions_service_1.SubscriptionsService,
        tickets_service_1.TicketsService])
], CatalogResolver);
//# sourceMappingURL=catalog.resolver.js.map