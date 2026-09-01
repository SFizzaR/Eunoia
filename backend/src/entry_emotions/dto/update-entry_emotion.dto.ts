import { PartialType } from '@nestjs/mapped-types';
import { CreateEntryEmotionDto } from './create-entry_emotion.dto';

export class UpdateEntryEmotionDto extends PartialType(CreateEntryEmotionDto) {}
