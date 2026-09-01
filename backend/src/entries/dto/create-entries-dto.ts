import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
export class CreateEntryDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  emotionids?: number[];

  @IsBoolean()
  IsDraft!: boolean;
}
