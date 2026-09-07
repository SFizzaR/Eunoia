import { ConflictException, Injectable } from '@nestjs/common';
import { CreateEmotionDto } from './dto/create-emotion.dto';
import { UpdateEmotionDto } from './dto/update-emotion.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EmotionsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.emotion.findMany({
      select: {
        id: true,
        animatedEmojiUrl: true,
        name: true,
        category: true,
        color: true,
      },
    });
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
