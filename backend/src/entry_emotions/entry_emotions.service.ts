import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateEntryEmotionDto } from './dto/create-entry_emotion.dto';
import { DetectEntryEmotionDto } from './dto/detect-entry_emotion.dto';
import { EmotionsService } from 'src/emotions/emotions.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EntryEmotion } from './entities/entry_emotion.entity';
import axios from 'axios';

@Injectable()
export class EntryEmotionsService {
  constructor(
    private prisma: PrismaService,
    private emotions: EmotionsService,
  ) {}

  async create(
    createEntryEmotionDtos: CreateEntryEmotionDto[],
    userId: number,
    tx?: any,
  ) {
    if (tx) {
      return this._createWithinTransaction(createEntryEmotionDtos, userId, tx);
    } else {
      return await this.prisma.$transaction((txNew) =>
        this._createWithinTransaction(createEntryEmotionDtos, userId, txNew),
      );
    }
  }

  private async _createWithinTransaction(
    createEntryEmotionDtos: CreateEntryEmotionDto[],
    userId: number,
    tx: any,
  ) {
    const results: EntryEmotion[] = [];
    for (const dto of createEntryEmotionDtos) {
      const entry = await tx.entry.findUnique({
        where: {
          id: dto.entryId,
        },
        select: {
          id: true,
          content: true,
          isDraft: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          attachments: {
            select: {
              fileUrl: true,
            },
          },
          emotions: {
            select: {
              id: true,
              userSelected: true,
              aiDetected: true,
              confidence: true,
              emotion: {
                select: {
                  id: true,
                  name: true,
                  animatedEmojiUrl: true,
                  category: true,
                },
              },
            },
          },
        },
      });
      if (!entry) {
        throw new BadRequestException('Entry does not exist');
      }

      const emotionName = dto.emotionName.trim().toLowerCase();
      const emotion = await this.emotions.findOne(emotionName);
      if (!emotion) {
        throw new BadRequestException(`Emotion "${emotionName}" not found`);
      }

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

      const existing = await tx.entryEmotion.findUnique({
        where: {
          entryId_emotionId: {
            entryId: dto.entryId,
            emotionId: emotion.id,
          },
        },
      });

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
  }

  async detectMood(
    DetectEntryEmotionDto: DetectEntryEmotionDto,
    userId: number,
  ): Promise<Array<{ emotionName: string; confidence: number }>> {
    // Verify entry exists and user owns it
    const entry = await this.prisma.entry.findUnique({
      where: { id: DetectEntryEmotionDto.entryId },
      select: { userId: true },
    });

    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    if (Number(entry.userId) !== Number(userId)) {
      throw new ForbiddenException('User not authorized');
    }

    if (!DetectEntryEmotionDto.content?.trim()) {
      throw new BadRequestException('Content is required');
    }

    try {
      // Call FastAPI mood analyzer endpoint
      const response = await axios.post('http://localhost:8000/analyze', {
        text: DetectEntryEmotionDto.content.trim(),
        threshold: 0.3, // Can be configurable
      });

      const data = response.data;

      // Validate response structure
      if (!data?.detected_moods || !Array.isArray(data.detected_moods)) {
        throw new BadRequestException('Invalid response from mood analyzer');
      }

      if (data.detected_moods.length === 0) {
        throw new BadRequestException('No emotions detected in entry');
      }

      // Map FastAPI response to your format
      const validatedEmotions = data.detected_moods.map(
        (mood: { emotion: string; confidence: number }) => ({
          emotionName: mood.emotion.toLowerCase(),
          confidence: Math.min(
            1,
            Math.max(0, parseFloat(mood.confidence.toFixed(2))),
          ),
        }),
      );

      // Return top 5 emotions (sorted by confidence, highest first)
      return validatedEmotions.slice(0, 5);
    } catch (error) {
      console.error('Error detecting mood:', error);

      // Provide better error messages
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new BadRequestException(
            'Mood analyzer service is not running. Make sure FastAPI is running on https://eunoia-mv7d.onrender.com',
          );
        }
        throw new BadRequestException(
          `Failed to detect mood: ${error.response?.data?.detail || error.message}`,
        );
      }

      throw new BadRequestException('Failed to detect mood');
    }
  }

  async saveDetectedEmotions(
    entryId: number,
    emotions: Array<{ emotionName: string; confidence: number }>,
    userId: number,
    tx?: any,
  ) {
    const dtos: CreateEntryEmotionDto[] = emotions.map(
      ({ emotionName, confidence }) => ({
        entryId,
        emotionName,
        userSelected: false,
        aiDetected: true,
        confidence,
      }),
    );

    return await this.create(dtos, userId, tx);
  }

  findAll() {
    return `This action returns all entryEmotions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} entryEmotion`;
  }

  remove(id: number) {
    return `This action removes a #${id} entryEmotion`;
  }
}
