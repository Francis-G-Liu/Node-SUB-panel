import type { UserEntity } from '../domain/entities';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
export declare class TicketsAppController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    list(user: UserEntity): import("@prisma/client").Prisma.PrismaPromise<({
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
    })[]>;
    detail(user: UserEntity, id: string): Promise<({
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
    }) | null>;
    create(user: UserEntity, dto: CreateTicketDto): import("@prisma/client").Prisma.Prisma__TicketClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.TicketStatus;
        userId: string;
        subject: string;
        priority: import("@prisma/client").$Enums.TicketPriority;
        nodeId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    reply(user: UserEntity, id: string, body: {
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
