import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()  // Make this module available EVERYWHERE (no need to import)
@Module({
  providers: [PrismaService],  // Register the service
  exports: [PrismaService],    // Make it available to other modules
})
export class PrismaModule {}
