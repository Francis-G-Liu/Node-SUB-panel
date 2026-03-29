import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Roles } from '../auth/roles.decorator';

@Controller('alerts')
@Roles('super_admin', 'ops', 'support')
export class AlertsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list() {
    const rules = await this.notificationsService.listRules();
    return rules.map((r: any) => ({
      id: r.id,
      name: r.name,
      channel: r.channel,
      severity: r.severity.charAt(0).toUpperCase() + r.severity.slice(1),
      threshold: r.thresholdLatencyMs
        ? `Latency > ${r.thresholdLatencyMs}ms`
        : `Loss > ${r.thresholdPacketLoss}%`,
      target: r.target,
      active: true, // Derived from existence
    }));
  }

  @Post(':id/trigger')
  async trigger(@Param('id') id: string, @Body('message') message: string) {
    await this.notificationsService.trigger(id, message ?? 'manual trigger');
    return { status: 'queued' };
  }
}
