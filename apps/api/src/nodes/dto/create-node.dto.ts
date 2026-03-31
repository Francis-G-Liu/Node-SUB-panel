import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateNodeDto {
  @IsOptional()
  @IsString()
  providerId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  hostname!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  port!: number;

  @IsIn(['vmess', 'vless', 'trojan', 'ss', 'socks', 'http'])
  protocol!: 'vmess' | 'vless' | 'trojan' | 'ss' | 'socks' | 'http';

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  region!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags: string[] = [];

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxBandwidthMbps?: number;
}
