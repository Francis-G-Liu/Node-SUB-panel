import { Module } from '@nestjs/common';
import { NodesService } from './nodes.service';
import { NodesAdminController } from './nodes-admin.controller';
import { NodesAppController } from './nodes-app.controller';
import { DatabaseModule } from '../database/database.module';
import { ObservabilityModule } from '../observability/observability.module';
import { HealthCheckService } from './health-check.service';

@Module({
  imports: [DatabaseModule, ObservabilityModule],
  controllers: [NodesAdminController, NodesAppController],
  providers: [NodesService, HealthCheckService],
  exports: [NodesService],
})
export class NodesModule {}
