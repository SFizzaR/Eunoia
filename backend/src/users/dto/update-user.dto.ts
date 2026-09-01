import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString, MinLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsString()
  password?: string; // Make password optional for updates

  @IsString()
  firstname?: string; // Make firstname optional for updates

  @IsString()
  lastname?: string; // Make lastname optional for updates
}
