import { PrismaService } from '../database/prisma.service';
import { NotificationClient } from './notification-client';
interface AlertRule {
    id: string;
    name: string;
    channel: 'telegram' | 'email';
    severity: 'warning' | 'critical';
    target: string;
    regionFilter?: string | null;
    tagFilter?: string | null;
    thresholdLatencyMs?: number | null;
    thresholdPacketLoss?: number | null;
}
export declare class TelemetryService {
    private readonly prisma;
    private readonly notifier;
    private readonly logger;
    private readonly nodeStream;
    private readonly alertStream;
    private readonly alertCooldowns;
    constructor(prisma: PrismaService, notifier: NotificationClient);
    recordSample(sample: {
        nodeId: string;
        latencyMs: number | null;
        packetLoss: number;
        timestamp: string;
    }): Promise<void>;
    triggerManualAlert(rule: AlertRule, message: string): Promise<void>;
    listSamples(nodeId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        nodeId: string;
        latencyMs: number | null;
        packetLoss: number;
        timestamp: Date;
    }[]>;
    nodeObservable(): import("rxjs").Observable<{
        data: {
            type: string;
            payload: unknown;
        };
    }>;
    alertObservable(): import("rxjs").Observable<{
        data: {
            type: string;
            payload: unknown;
        };
    }>;
    private evaluateAlerts;
    private dispatchAlert;
}
export {};
