import { IsNumber, IsString } from 'class-validator';

export class DetectEntryEmotionDto {
  @IsNumber()
  entryId!: number;

  @IsString()
  content!: string;
}
