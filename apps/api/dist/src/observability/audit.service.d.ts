import { PrismaService } from '../database/prisma.service';
export declare class AuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    recordAction(userId: string, action: string, targetType: string, targetId: string, metadata?: any): Promise<void>;
}
