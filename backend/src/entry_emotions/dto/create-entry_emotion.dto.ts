import {
  IsBoolean,
  IsNumber,
  IsNotEmpty,
  IsDecimal,
  IsString,
} from 'class-validator';
export class CreateEntryEmotionDto {
  @IsNumber()
  @IsNotEmpty()
  entryId!: number;

  @IsString()
  @IsNotEmpty()
  emotionName!: string;

  @IsBoolean()
  userSelected?: boolean;

  @IsBoolean()
  aiDetected?: boolean;

  @IsDecimal()
  confidence?: number;
}
