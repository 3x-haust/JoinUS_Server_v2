import {
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BulkCreateClubDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @IsNumber({}, { each: true })
  capacity: number[];

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  preview?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  teacherId: number;
}

export class BulkCreateClubsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateClubDto)
  clubs: BulkCreateClubDto[];
}
