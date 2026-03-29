import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @MaxLength(120)
  subject!: string;

  @IsString()
  body!: string;

  @IsOptional()
  @IsString()
  nodeId?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'critical'])
  priority?: 'low' | 'medium' | 'high' | 'critical';
}
