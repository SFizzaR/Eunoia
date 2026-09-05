import { PartialType } from '@nestjs/mapped-types';
import { CreateEntryReflectionDto } from './create-entry_reflection.dto';

export class UpdateEntryReflectionDto extends PartialType(CreateEntryReflectionDto) {}
