import { IsNumber, IsNotEmpty } from 'class-validator';

export class ApplyClubDto {
  @IsNumber()
  @IsNotEmpty()
  clubId: number;
}
