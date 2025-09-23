import { IsNumber, IsNotEmpty } from 'class-validator';

export class BookmarkClubDto {
  @IsNumber()
  @IsNotEmpty()
  clubId: number;
}
