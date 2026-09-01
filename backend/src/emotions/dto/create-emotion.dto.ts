import { IsNotEmpty, IsString } from 'class-validator';
export class CreateEmotionDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsString()
  category?: string;

  @IsNotEmpty()
  @IsString()
  emoji!: string;
}
