import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';
import { EntriesModule } from './entries/entries.module';
import { EntryEmotionsModule } from './entry_emotions/entry_emotions.module';
import { EmotionsModule } from './emotions/emotions.module';
import { QuotesModule } from './quotes/quote.module';
import { AttachmentsModule } from './attachments/attachments.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
    SupabaseModule,
    EntriesModule,
    EntryEmotionsModule,
    EmotionsModule,
    QuotesModule,
    AttachmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
