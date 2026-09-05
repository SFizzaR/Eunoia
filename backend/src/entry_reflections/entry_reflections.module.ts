import { Module } from '@nestjs/common';
import { EntryReflectionsService } from './entry_reflections.service';
import { EntryReflectionsController } from './entry_reflections.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EntryReflectionsController],
  providers: [EntryReflectionsService],
})
export class EntryReflectionsModule {}
