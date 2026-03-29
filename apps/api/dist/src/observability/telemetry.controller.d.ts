import { TelemetryService } from './telemetry.service';
import { RecordTelemetryDto } from './dto/record-telemetry.dto';
export declare class TelemetryIngestController {
    private readonly telemetryService;
    constructor(telemetryService: TelemetryService);
    record(dto: RecordTelemetryDto): Promise<{
        status: string;
    }>;
}
