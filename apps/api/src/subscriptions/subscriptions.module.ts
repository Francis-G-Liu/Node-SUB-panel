import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { SubscriptionsService } from './subscriptions.service';
import { PlansController } from './plans.controller';
import { MeController } from './me.controller';
import { AdminSubscriptionsController } from './admin-subscriptions.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminCategoriesController } from './admin-categories.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [
    PlansController,
    MeController,
    AdminSubscriptionsController,
    AdminUsersController,
    AdminCategoriesController,
  ],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
