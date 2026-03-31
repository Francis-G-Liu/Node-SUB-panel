import { TicketStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
export interface TicketListQuery {
    status?: TicketStatus;
    page?: number;
    pageSize?: number;
}
export declare class TicketsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listForAdmin(query?: TicketListQuery): Promise<{
        data: ({
            messages: {
                id: string;
                userId: string | null;
                createdAt: Date;
                ticketId: string;
                sender: import("@prisma/client").$Enums.TicketSender;
                body: string;
            }[];
        } & {
            status: import("@prisma/client").$Enums.TicketStatus;
            id: string;
            userId: string;
            subject: string;
            priority: import("@prisma/client").$Enums.TicketPriority;
            nodeId: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    listForUser(userId: string): import("@prisma/client").Prisma.PrismaPromise<({
        messages: {
            id: string;
            userId: string | null;
            createdAt: Date;
            ticketId: string;
            sender: import("@prisma/client").$Enums.TicketSender;
            body: string;
        }[];
    } & {
        status: import("@prisma/client").$Enums.TicketStatus;
        id: string;
        userId: string;
        subject: string;
        priority: import("@prisma/client").$Enums.TicketPriority;
        nodeId: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createTicket(user: {
        id: string;
    }, payload: {
        subject: string;
        body: string;
        nodeId?: string;
        priority?: 'low' | 'medium' | 'high' | 'critical';
    }): import("@prisma/client").Prisma.Prisma__TicketClient<{
        status: import("@prisma/client").$Enums.TicketStatus;
        id: string;
        userId: string;
        subject: string;
        priority: import("@prisma/client").$Enums.TicketPriority;
        nodeId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateTicket(id: string, payload: {
        status?: 'open' | 'pending' | 'resolved';
        priority?: 'low' | 'medium' | 'high' | 'critical';
    }): Promise<{
        status: import("@prisma/client").$Enums.TicketStatus;
        id: string;
        userId: string;
        subject: string;
        priority: import("@prisma/client").$Enums.TicketPriority;
        nodeId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    replyTicket(id: string, payload: {
        body: string;
        userId?: string;
    }): Promise<{
        id: string;
        userId: string | null;
        createdAt: Date;
        ticketId: string;
        sender: import("@prisma/client").$Enums.TicketSender;
        body: string;
    }>;
    replyTicketAsUser(ticketId: string, userId: string, body: string): Promise<{
        id: string;
        userId: string | null;
        createdAt: Date;
        ticketId: string;
        sender: import("@prisma/client").$Enums.TicketSender;
        body: string;
    }>;
}
