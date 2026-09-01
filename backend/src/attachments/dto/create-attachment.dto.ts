import { IsNumber, IsNotEmpty, IsString } from 'class-validator';
export class CreateAttachmentDto {
  @IsNotEmpty()
  @IsNumber()
  entity_id!: number;

  @IsString()
  file_type!: string;

  @IsNumber()
  file_size!: number;
}
