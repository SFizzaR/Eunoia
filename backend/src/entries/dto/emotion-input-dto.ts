import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class EmotionInputDto {
  @IsString()
  @IsNotEmpty()
  emotionId!: string;

  @IsBoolean()
  @IsNotEmpty()
  userSelected!: boolean;

  @IsBoolean()
  @IsNotEmpty()
  aiDetected!: boolean;

  @IsOptional()
  @IsNumber()
  confidence?: number;
}
