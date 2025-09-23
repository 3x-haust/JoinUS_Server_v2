import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { LogAction, LogTargetType } from '../entities/log.entity';

export class CreateLogDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsEnum(LogAction)
  @IsNotEmpty()
  action: LogAction;

  @IsEnum(LogTargetType)
  @IsNotEmpty()
  targetType: LogTargetType;

  @IsNumber()
  @IsOptional()
  targetId?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
