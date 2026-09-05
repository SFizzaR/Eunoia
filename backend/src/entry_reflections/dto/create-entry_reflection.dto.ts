import { IsNumber, IsString } from 'class-validator';

export class CreateEntryReflectionDto {
  @IsNumber()
  entryId!: number;

  @IsString()
  content!: string;

  emotions!: string[];
}
