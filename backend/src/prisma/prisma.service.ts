import { 
  Injectable,
  OnModuleInit,
  OnModuleDestroy
} from '@nestjs/common';
import { PrismaClient } from 'src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService 
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {

   constructor() {
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/mydb';
    const pool = new Pool({connectionString,});
    const adapter = new PrismaPg(pool);
    
    super({ adapter });
    }
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ Database disconnected');
  }
}