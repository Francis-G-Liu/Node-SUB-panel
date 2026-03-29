import {
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class RecordTelemetryDto {
  @IsString()
  nodeId!: string;

  @IsOptional()
  @IsNumber()
  latencyMs?: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  packetLoss!: number;

  /** ISO-8601 timestamp of when the probe was actually performed (set by Worker). */
  @IsOptional()
  @IsISO8601()
  timestamp?: string;
}
