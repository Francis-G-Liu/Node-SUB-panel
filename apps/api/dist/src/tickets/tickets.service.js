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
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const audit_service_1 = require("../observability/audit.service");
let TicketsService = class TicketsService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async listForAdmin(query = {}) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const where = query.status ? { status: query.status } : {};
        const [total, data] = await Promise.all([
            this.prisma.ticket.count({ where }),
            this.prisma.ticket.findMany({
                where,
                include: { messages: true },
                orderBy: { updatedAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
        ]);
        return { data, total, page, pageSize };
    }
    listForUser(userId) {
        return this.prisma.ticket.findMany({
            where: { userId },
            include: { messages: true },
            orderBy: { updatedAt: 'desc' },
        });
    }
    createTicket(user, payload) {
        return this.prisma.ticket.create({
            data: {
                userId: user.id,
                subject: payload.subject,
                priority: payload.priority ?? 'medium',
                status: 'open',
                nodeId: payload.nodeId,
                messages: {
                    create: {
                        sender: 'user',
                        body: payload.body,
                        userId: user.id,
                    },
                },
            },
        });
    }
    async updateTicket(id, payload, operatorId) {
        const res = await this.prisma.ticket.update({
            where: { id },
            data: {
                status: payload.status,
                priority: payload.priority,
            },
        });
        if (operatorId) {
            await this.audit.recordAction(operatorId, 'UPDATE_TICKET_STATUS', 'Ticket', id, payload);
        }
        return res;
    }
    async replyTicket(id, payload) {
        const res = await this.prisma.ticketMessage.create({
            data: {
                ticketId: id,
                sender: 'admin',
                body: payload.body,
                userId: payload.userId,
            },
        });
        await this.audit.recordAction(payload.userId, 'REPLY_TICKET', 'Ticket', id);
        return res;
    }
    async replyTicketAsUser(ticketId, userId, body) {
        const ticket = await this.prisma.ticket.findFirst({
            where: { id: ticketId, userId },
        });
        if (!ticket) {
            throw new Error('Ticket not found');
        }
        return this.prisma.ticketMessage.create({
            data: {
                ticketId,
                sender: 'user',
                body,
                userId,
            },
        });
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map