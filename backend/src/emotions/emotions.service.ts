import { ConflictException, Injectable } from '@nestjs/common';
import { CreateEmotionDto } from './dto/create-emotion.dto';
import { UpdateEmotionDto } from './dto/update-emotion.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EmotionsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.$queryRaw`
    SELECT 
      id,
      "animatedEmojiUrl",
      name,
      category,
      color
    FROM "emotions"
    ORDER BY 
      CASE 
        WHEN category = 'positive' THEN 1
        WHEN category = 'neutral' THEN 2
        WHEN category = 'negative' THEN 3
        ELSE 4
      END,
      name ASC
  `;
  }

  findOne(emotion: string) {
    return this.prisma.emotion.findUnique({
      where: {
        name: emotion.toLowerCase(),
      },
      select: {
        id: true,
        animatedEmojiUrl: true,
        name: true,
        category: true,
        color: true,
      },
    });
  }

  update(id: number, updateEmotionDto: UpdateEmotionDto) {
    return `This action updates a #${id} emotion`;
  }

  remove(id: number) {
    return `This action removes a #${id} emotion`;
  }
}
