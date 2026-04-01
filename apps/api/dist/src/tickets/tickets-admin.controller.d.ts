import { TicketsService } from './tickets.service';
export declare class TicketsAdminController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    list(status?: string, page?: string, pageSize?: string): Promise<{
        data: {
            id: any;
            subject: any;
            priority: any;
            status: any;
            node: any;
            createdAt: any;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    update(user: any, id: string, body: {
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
    reply(user: any, id: string, body: {
        body: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        sender: import("@prisma/client").$Enums.TicketSender;
        ticketId: string;
        body: string;
    }>;
}
