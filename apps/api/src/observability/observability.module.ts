import { Module } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { TelemetryIngestController } from './telemetry.controller';
import { StreamController } from './stream.controller';
import { NotificationClient } from './notification-client';
import { AuditLogsController } from './audit-logs.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [TelemetryService, NotificationClient],
  controllers: [
    StreamController,
    AuditLogsController,
    TelemetryIngestController,
  ],
  exports: [TelemetryService],
})
export class ObservabilityModule {}
