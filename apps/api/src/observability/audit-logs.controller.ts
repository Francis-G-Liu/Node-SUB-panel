import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Roles } from '../auth/roles.decorator';

@Controller('audit-logs')
@Roles('super_admin', 'auditor')
export class AuditLogsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
      }),
    ]);

    return {
      total,
      data: logs.map((log: any) => ({
        id: log.id,
        user: log.user?.email || 'System',
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        time: log.createdAt,
      })),
    };
  }
}
