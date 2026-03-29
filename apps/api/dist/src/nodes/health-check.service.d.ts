import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TelemetryService } from '../observability/telemetry.service';
export declare class HealthCheckService implements OnModuleInit {
    private readonly prisma;
    private readonly telemetry;
    private readonly logger;
    constructor(prisma: PrismaService, telemetry: TelemetryService);
    onModuleInit(): void;
    handleCron(): Promise<void>;
    private checkNode;
}
