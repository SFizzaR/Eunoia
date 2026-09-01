import { IsBoolean, IsNumber } from 'class-validator';

export class FindAllDto {
  @IsNumber()
  emotionId?: number;

  @IsBoolean()
  isDraft?: boolean;
}
