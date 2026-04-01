import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma.service';
export declare class SeedService implements OnModuleInit {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private hashToken;
    onModuleInit(): Promise<void>;
}
