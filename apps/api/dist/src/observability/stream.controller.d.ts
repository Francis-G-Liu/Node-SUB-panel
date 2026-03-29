import { Observable } from 'rxjs';
import { TelemetryService } from './telemetry.service';
export declare class StreamController {
    private readonly telemetryService;
    constructor(telemetryService: TelemetryService);
    nodes(): Observable<{
        data: {
            type: string;
            payload: unknown;
        };
    }>;
    alerts(): Observable<{
        data: {
            type: string;
            payload: unknown;
        };
    }>;
}
