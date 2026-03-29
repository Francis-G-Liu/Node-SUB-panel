import { Body, Controller, Post } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { TelemetryService } from './telemetry.service';
import { RecordTelemetryDto } from './dto/record-telemetry.dto';

@Controller('ingest')
@Roles('super_admin', 'ops')
export class TelemetryIngestController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post('telemetry')
  async record(@Body() dto: RecordTelemetryDto) {
    // Fix F: use the probe timestamp from the Worker (accurate measurement time),
    // falling back to server time only if not provided
    await this.telemetryService.recordSample({
      nodeId: dto.nodeId,
      latencyMs: dto.latencyMs ?? null,
      packetLoss: dto.packetLoss,
      timestamp: dto.timestamp ?? new Date().toISOString(),
    });
    return { status: 'ok' };
  }
}
