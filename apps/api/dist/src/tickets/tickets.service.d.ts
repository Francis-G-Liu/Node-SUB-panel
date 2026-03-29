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
                createdAt: Date;
                userId: string | null;
                sender: import("@prisma/client").$Enums.TicketSender;
                ticketId: string;
                body: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.TicketStatus;
            userId: string;
            subject: string;
            priority: import("@prisma/client").$Enums.TicketPriority;
            nodeId: string | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    listForUser(userId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.TicketStatus;
        userId: string;
        subject: string;
        priority: import("@prisma/client").$Enums.TicketPriority;
        nodeId: string | null;
    }[]>;
    createTicket(user: {
        id: string;
    }, payload: {
        subject: string;
        body: string;
        nodeId?: string;
        priority?: 'low' | 'medium' | 'high' | 'critical';
    }): import("@prisma/client").Prisma.Prisma__TicketClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.TicketStatus;
        userId: string;
        subject: string;
        priority: import("@prisma/client").$Enums.TicketPriority;
        nodeId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateTicket(id: string, payload: {
        status?: 'open' | 'pending' | 'resolved';
        priority?: 'low' | 'medium' | 'high' | 'critical';
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.TicketStatus;
        userId: string;
        subject: string;
        priority: import("@prisma/client").$Enums.TicketPriority;
        nodeId: string | null;
    }>;
    replyTicket(id: string, payload: {
        body: string;
        userId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        sender: import("@prisma/client").$Enums.TicketSender;
        ticketId: string;
        body: string;
    }>;
}
