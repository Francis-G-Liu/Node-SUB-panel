import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { DatabaseModule } from '../database/database.module';
import { ObservabilityModule } from '../observability/observability.module';

@Module({
  imports: [DatabaseModule, ObservabilityModule],
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService],
})
export class ProvidersModule {}
