import { NodesService } from '../../nodes/nodes.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { TicketsService } from '../../tickets/tickets.service';
export declare class CatalogResolver {
    private readonly nodesService;
    private readonly subscriptionsService;
    private readonly ticketsService;
    constructor(nodesService: NodesService, subscriptionsService: SubscriptionsService, ticketsService: TicketsService);
    nodesSnapshot(): Promise<{
        id: string;
        providerId: string;
        hostname: string;
        region: string;
        tags: string[];
        latencyMs: number | null;
    }[]>;
    plansSnapshot(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        bandwidthLimitGb: number;
        durationDays: number;
        concurrentDevices: number;
        regionFilters: import("@prisma/client/runtime/library").JsonValue;
        nodeTags: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    openTickets(): Promise<({
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
}
