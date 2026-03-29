import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsAdminController } from './tickets-admin.controller';
import { TicketsAppController } from './tickets-app.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [TicketsService],
  controllers: [TicketsAdminController, TicketsAppController],
  exports: [TicketsService],
})
export class TicketsModule {}
