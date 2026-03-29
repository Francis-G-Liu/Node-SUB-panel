import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProviderDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  regionHint!: string;

  @IsUrl()
  subscriptionUrl!: string;

  @IsInt()
  @Min(1)
  syncIntervalMinutes!: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags: string[] = [];
}
