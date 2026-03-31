import type { UserEntity } from '../domain/entities';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
export declare class TicketsAppController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    list(user: UserEntity): import("@prisma/client").Prisma.PrismaPromise<({
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
    detail(user: UserEntity, id: string): Promise<({
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
    }) | null>;
    create(user: UserEntity, dto: CreateTicketDto): import("@prisma/client").Prisma.Prisma__TicketClient<{
        status: import("@prisma/client").$Enums.TicketStatus;
        id: string;
        userId: string;
        subject: string;
        priority: import("@prisma/client").$Enums.TicketPriority;
        nodeId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    reply(user: UserEntity, id: string, body: {
        body: string;
    }): Promise<{
        id: string;
        userId: string | null;
        createdAt: Date;
        ticketId: string;
        sender: import("@prisma/client").$Enums.TicketSender;
        body: string;
    }>;
}
