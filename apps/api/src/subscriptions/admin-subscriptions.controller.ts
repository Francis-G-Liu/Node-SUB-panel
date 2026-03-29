import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Roles } from '../auth/roles.decorator';

@Controller('subscriptions')
@Roles('super_admin', 'ops', 'support')
export class AdminSubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  async list() {
    const subs = await this.subscriptionsService.listSubscriptions();
    return subs.map((s: any) => ({
      id: s.id,
      user: s.user?.email || 'Unknown',
      plan: s.plan?.name || 'Unknown',
      status: s.status.charAt(0).toUpperCase() + s.status.slice(1),
      used: s.usageGb,
      total: s.plan?.bandwidthLimitGb || 0,
      expiry: s.expiresAt,
    }));
  }

  @Post()
  create(@Body() data: any) {
    return this.subscriptionsService.createSubscription(data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionsService.deleteSubscription(id);
  }
}
