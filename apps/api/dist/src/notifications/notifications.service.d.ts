import { PrismaService } from '../database/prisma.service';
import { TelemetryService } from '../observability/telemetry.service';
export declare class NotificationsService {
    private readonly prisma;
    private readonly telemetry;
    constructor(prisma: PrismaService, telemetry: TelemetryService);
    listRules(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        regionFilter: string | null;
        thresholdPacketLoss: number | null;
        tagFilter: string | null;
        thresholdLatencyMs: number | null;
        channel: import("@prisma/client").$Enums.AlertChannel;
        severity: import("@prisma/client").$Enums.AlertSeverity;
        target: string;
    }[]>;
    trigger(ruleId: string, message: string): Promise<void>;
}
