import { Injectable } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../observability/audit.service';

export interface TicketListQuery {
  status?: TicketStatus;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // Fix #11: add pagination so response matches PaginatedResult<TicketSummary> expected by SDK
  async listForAdmin(query: TicketListQuery = {}) {
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

  listForUser(userId: string) {
    return this.prisma.ticket.findMany({
      where: { userId },
      include: { messages: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  createTicket(
    user: { id: string },
    payload: {
      subject: string;
      body: string;
      nodeId?: string;
      priority?: 'low' | 'medium' | 'high' | 'critical';
    },
  ) {
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

  async updateTicket(
    id: string,
    payload: {
      status?: 'open' | 'pending' | 'resolved';
      priority?: 'low' | 'medium' | 'high' | 'critical';
    },
    operatorId?: string,
  ) {
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

  async replyTicket(id: string, payload: { body: string; userId: string }) {
    const res = await this.prisma.ticketMessage.create({
      data: {
        ticketId: id,
        sender: 'admin',
        body: payload.body,
        userId: payload.userId, // This is now forced to operatorId from controller
      },
    });

    await this.audit.recordAction(payload.userId, 'REPLY_TICKET', 'Ticket', id);

    return res;
  }

  async replyTicketAsUser(ticketId: string, userId: string, body: string) {
    // Verify the ticket belongs to the user
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
}
