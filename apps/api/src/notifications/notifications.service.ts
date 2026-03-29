import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TelemetryService } from '../observability/telemetry.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telemetry: TelemetryService,
  ) {}

  listRules() {
    return this.prisma.alertRule.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async trigger(ruleId: string, message: string) {
    const rule = await this.prisma.alertRule.findUnique({
      where: { id: ruleId },
    });
    if (!rule) throw new NotFoundException('Alert rule not found');
    await this.telemetry.triggerManualAlert(rule, message);
  }
}
