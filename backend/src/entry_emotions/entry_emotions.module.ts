import { Module } from '@nestjs/common';
import { EntryEmotionsService } from './entry_emotions.service';
import { EntryEmotionsController } from './entry_emotions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmotionsModule } from 'src/emotions/emotions.module';
import { EntriesModule } from 'src/entries/entries.module';
@Module({
  imports: [PrismaModule, EmotionsModule, EntriesModule],
  controllers: [EntryEmotionsController],
  providers: [EntryEmotionsService],
})
export class EntryEmotionsModule {}
