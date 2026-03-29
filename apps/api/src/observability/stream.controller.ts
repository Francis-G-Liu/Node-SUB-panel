import { Controller, Sse } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { Observable } from 'rxjs';
import { TelemetryService } from './telemetry.service';

@Controller('stream')
@Roles('super_admin', 'ops', 'support')
export class StreamController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Sse('nodes')
  nodes(): Observable<{ data: { type: string; payload: unknown } }> {
    return this.telemetryService.nodeObservable();
  }

  @Sse('alerts')
  alerts(): Observable<{ data: { type: string; payload: unknown } }> {
    return this.telemetryService.alertObservable();
  }
}
