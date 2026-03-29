import { PrismaService } from '../database/prisma.service';
export declare class AuditLogsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(page?: string, pageSize?: string): Promise<{
        total: number;
        data: {
            id: any;
            user: any;
            action: any;
            targetType: any;
            targetId: any;
            time: any;
        }[];
    }>;
}
