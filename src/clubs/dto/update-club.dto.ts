import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class UpdateClubDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  capacity?: number[];

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  preview?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
