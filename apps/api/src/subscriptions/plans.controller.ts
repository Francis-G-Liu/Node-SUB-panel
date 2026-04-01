import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('plans')
@Roles('super_admin', 'ops', 'support')
export class PlansController {
  constructor(private readonly subscriptionsService: SubscriptionsService) { }

  @Get()
  @Roles('super_admin', 'ops', 'support', 'user')
  async list() {
    const plans = await this.subscriptionsService.listPlans();
    return plans.map((p) => ({
      id: p.id,
      name: p.name,
      limit: p.bandwidthLimitGb,
      days: p.durationDays,
      devices: p.concurrentDevices,
      rules: JSON.stringify(p.regionFilters),
    }));
  }

  @Post()
  create(@CurrentUser() user: any, @Body() data: any) {
    return this.subscriptionsService.createPlan(data, user.id);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() data: any) {
    return this.subscriptionsService.updatePlan(id, data, user.id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.subscriptionsService.deletePlan(id, user.id);
  }
}
