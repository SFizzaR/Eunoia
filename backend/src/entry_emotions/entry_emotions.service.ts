import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEntryEmotionDto } from './dto/create-entry_emotion.dto';
import { UpdateEntryEmotionDto } from './dto/update-entry_emotion.dto';
import { EmotionsService } from 'src/emotions/emotions.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EntriesService } from 'src/entries/entries.service';
import { EntryEmotion } from './entities/entry_emotion.entity';

@Injectable()
export class EntryEmotionsService {
  constructor(
    private prisma: PrismaService,
    private emotions: EmotionsService,
    private entries: EntriesService,
  ) {}

  async create(
    createEntryEmotionDtos: CreateEntryEmotionDto[],
    userId: number, // ✅ Changed to string
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const results: EntryEmotion[] = []; // ✅ Typed array

      for (const dto of createEntryEmotionDtos) {
        // Validate entry exists
        const entry = await this.entries.findOne(userId, dto.entryId);
        if (!entry) {
          throw new BadRequestException('Entry does not exist');
        }

        // Validate emotion
        const emotionName = dto.emotionName.trim().toLowerCase();
        const emotion = await this.emotions.findOne(emotionName);
        if (!emotion) {
          throw new BadRequestException(`Emotion "${emotionName}" not found`);
        }

        // ✅ Clearer validation
        if (!dto.userSelected && !dto.aiDetected) {
          throw new BadRequestException(
            'Emotion must be user-selected or AI-detected',
          );
        }

        if (
          dto.aiDetected &&
          (dto.confidence == null || dto.confidence < 0 || dto.confidence > 1)
        ) {
          throw new BadRequestException(
            'Confidence must be a number between 0-1 for AI-detected emotions',
          );
        }

        if (!dto.aiDetected && dto.confidence != null) {
          throw new BadRequestException(
            'Confidence should not be provided for user-selected emotions',
          );
        }

        // Check existing
        const existing = await tx.entryEmotion.findUnique({
          where: {
            entryId_emotionId: {
              entryId: dto.entryId,
              emotionId: emotion.id,
            },
          },
        });

        // ✅ Simpler update/create logic
        const result = existing
          ? await tx.entryEmotion.update({
              where: {
                entryId_emotionId: {
                  entryId: dto.entryId,
                  emotionId: emotion.id,
                },
              },
              data: {
                userSelected: existing.userSelected || dto.userSelected,
                aiDetected: existing.aiDetected || dto.aiDetected,
                confidence: dto.aiDetected ? dto.confidence : null,
              },
            })
          : await tx.entryEmotion.create({
              data: {
                entryId: dto.entryId,
                emotionId: emotion.id,
                userSelected: dto.userSelected,
                aiDetected: dto.aiDetected,
                confidence: dto.aiDetected ? dto.confidence : null,
              },
            });

        results.push(result);
      }

      return results;
    });
  }
  findAll() {
    return `This action returns all entryEmotions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} entryEmotion`;
  }

  update(id: number, updateEntryEmotionDto: UpdateEntryEmotionDto) {
    return `This action updates a #${id} entryEmotion`;
  }

  remove(id: number) {
    return `This action removes a #${id} entryEmotion`;
  }
}
