import {
  IsEmail,
  IsString,
  IsEnum,
  IsNumber,
  IsNotEmpty,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsNumber()
  @Min(1)
  @Max(3)
  @IsOptional()
  grade: number;
}
