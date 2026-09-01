import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SupabaseService],
  exports: [SupabaseService], // Export the service to make it available to other modules
})
export class SupabaseModule {}
