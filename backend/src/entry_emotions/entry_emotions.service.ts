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
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EntryEmotionsService {
  private hfApiToken: string | undefined; // ✅ Allow undefined
  private hfApiUrl =
    'https://router.huggingface.co/hf-inference/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english';
  constructor(
    private prisma: PrismaService,
    private emotions: EmotionsService,
    private config: ConfigService,
  ) {
    // ✅ Initialize token in constructor body
    this.hfApiToken = this.config.get<string>('HF_TOKEN');

    if (!this.hfApiToken) {
      console.warn('⚠️ HF_TOKEN not found in .env');
    }
  }

  async create(
    createEntryEmotionDtos: CreateEntryEmotionDto[],
    userId: number,
    tx?: any, // Accept optional transaction
  ) {
    // Use provided tx or create new transaction if none provided
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
      // ... all your validation logic stays the same ...
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

      // Check existing
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
    const entry = await this.prisma.entry.findUnique({
      where: { id: DetectEntryEmotionDto.entryId },
      select: { userId: true },
    });

    if (!entry) throw new NotFoundException('Entry not found');
    if (Number(entry.userId) !== Number(userId))
      throw new ForbiddenException('User not authorized');
    if (!DetectEntryEmotionDto.content?.trim()) {
      throw new BadRequestException('Content is required');
    }

    // ✅ Check if token exists
    if (!this.hfApiToken) {
      throw new BadRequestException(
        'Hugging Face API token not configured. Please set HUGGINGFACE_API_TOKEN in .env',
      );
    }

    try {
      // Call Hugging Face API
      const response = await axios.post(
        this.hfApiUrl,
        { inputs: DetectEntryEmotionDto.content },
        {
          headers: {
            Authorization: `Bearer ${this.hfApiToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const data = response.data;

      let hfResults = data?.[0];

      if (Array.isArray(hfResults)) {
        hfResults = hfResults[0];
      }

      if (!hfResults?.label || hfResults?.score == null) {
        throw new BadRequestException('Invalid response from Hugging Face');
      }

      const sentimentLabel = hfResults.label.toUpperCase();

      // Map HF sentiment to your category
      const sentimentToCategoryMap = {
        POSITIVE: 'positive',
        NEGATIVE: 'negative',
        NEUTRAL: 'neutral',
      };

      const targetCategory = sentimentToCategoryMap[sentimentLabel];

      // Get emotions matching the sentiment category
      const emotions = await this.prisma.emotion.findMany({
        where: {
          category: targetCategory,
        },
        select: {
          name: true,
        },
      });

      if (emotions.length === 0) {
        throw new BadRequestException('No valid emotions detected in entry');
      }

      const validatedEmotions = emotions.map((emotion) => ({
        emotionName: emotion.name,
        confidence: Math.min(
          1,
          Math.max(0, parseFloat(hfResults.score.toFixed(2))),
        ),
      }));

      return validatedEmotions.slice(0, 5);
    } catch (error) {
      console.error('Error detecting mood:', error);
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
    // Pass tx to create
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
