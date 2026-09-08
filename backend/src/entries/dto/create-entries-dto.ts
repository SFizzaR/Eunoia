import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { EmotionInputDto } from './emotion-input-dto';
import { Type } from 'class-transformer';

export class CreateEntryDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsBoolean()
  @IsNotEmpty()
  IsDraft!: boolean;

  // ✅ Accept emotions array with proper validation
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmotionInputDto)
  emotions?: EmotionInputDto[];

  // ✅ Keep emotionids for backwards compatibility
  @IsOptional()
  @IsArray()
  emotionids?: number[];
}
