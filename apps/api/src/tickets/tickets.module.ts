import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsAdminController } from './tickets-admin.controller';
import { TicketsAppController } from './tickets-app.controller';
import { DatabaseModule } from '../database/database.module';
import { ObservabilityModule } from '../observability/observability.module';

@Module({
  imports: [DatabaseModule, ObservabilityModule],
  providers: [TicketsService],
  controllers: [TicketsAdminController, TicketsAppController],
  exports: [TicketsService],
})
export class TicketsModule {}
