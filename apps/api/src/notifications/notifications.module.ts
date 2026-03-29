import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ObservabilityModule } from '../observability/observability.module';
import { NotificationsService } from './notifications.service';
import { AlertsController } from './alerts.controller';

@Module({
  imports: [DatabaseModule, ObservabilityModule],
  providers: [NotificationsService],
  controllers: [AlertsController],
})
export class NotificationsModule {}
