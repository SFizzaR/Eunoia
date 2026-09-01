import { ConflictException, Injectable } from '@nestjs/common';
import { CreateEmotionDto } from './dto/create-emotion.dto';
import { UpdateEmotionDto } from './dto/update-emotion.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EmotionsService {
  constructor(private prisma: PrismaService) {}

  async create(createEmotionDto: CreateEmotionDto) {
    const name = createEmotionDto.name.toLowerCase();
    const existingEmotion = await this.prisma.emotion.findUnique({
      where: {
        name: name,
      },
    });

    if (existingEmotion) {
      throw new ConflictException('Emotion already exists');
    }

    return this.prisma.emotion.create({
      data: {
        ...createEmotionDto,
      },
      select: {
        id: true,
        emoji: true,
        name: true,
        category: true,
      },
    });
  }

  findAll() {
    return this.prisma.emotion.findMany({
      select: {
        emoji: true,
        name: true,
        id: true,
        category: true,
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
        emoji: true,
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
