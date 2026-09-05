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
import { EntriesService } from 'src/entries/entries.service';
import { EntryEmotion } from './entities/entry_emotion.entity';
import axios from 'axios';

@Injectable()
export class EntryEmotionsService {
  constructor(
    private prisma: PrismaService,
    private emotions: EmotionsService,
    private entries: EntriesService,
  ) {}

  private ollamaUrl = 'http://localhost:11434/api/generate';
  private model = 'mistral';

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
                  emoji: true,
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
    if (!DetectEntryEmotionDto.content?.trim) {
      throw new BadRequestException('Content is required');
    }

    try {
      const availableEmotions = await this.prisma.emotion.findMany({
        select: {
          name: true,
        },
      });

      const emotionList = availableEmotions.map((e) => e.name).join(', ');

      const response = await axios.post(this.ollamaUrl, {
        model: this.model,
        prompt: `You are an emotion detection AI. Analyze this journal entry and detect emotions.

Journal Entry:
"${DetectEntryEmotionDto.content}"

IMPORTANT: Return emotions ONLY from this list:
${emotionList}

Return a JSON array with emotion names and confidence scores (0.0-1.0).
Max 5 emotions. Do NOT invent emotions not in the list above.

Example: [{"emotion": "anxious", "confidence": 0.92}]

Return ONLY JSON, no extra text:`,
        stream: false,
        temperature: 0.3,
      });

      const emotionText = response.data.response.trim();

      try {
        const jsonMatch = emotionText.match(/\[\s*{[\s\S]*}\s*\]/);
        if (!jsonMatch) throw new Error('No JSON array found');

        const parsed = JSON.parse(jsonMatch[0]);

        if (!Array.isArray(parsed)) {
          throw new BadRequestException('Invalid response format');
        }

        const validatedEmotions: Array<{
          emotionName: string;
          confidence: number;
        }> = [];

        for (const item of parsed) {
          if (!item.emotion || typeof item.confidence !== 'number') {
            continue; // Skip invalid items
          }

          const emotionName = item.emotion.toLowerCase().trim();

          // ✅ Check if emotion exists in database
          try {
            const emotion = await this.emotions.findOne(emotionName);

            // Only include if it exists in DB
            if (emotion) {
              validatedEmotions.push({
                emotionName,
                confidence: Math.min(
                  1,
                  Math.max(0, parseFloat(item.confidence.toFixed(2))),
                ),
              });
            } else {
              console.warn(
                `Emotion "${emotionName}" not in database - skipping`,
              );
            }
          } catch (err) {
            console.warn(`Emotion "${emotionName}" not found in database`);
            continue;
          }
        }

        if (validatedEmotions.length === 0) {
          throw new BadRequestException('No valid emotions detected in entry');
        }

        return validatedEmotions.slice(0, 5); // Max 5
      } catch (parseError) {
        console.error('Failed to parse Ollama response:', emotionText);
        throw new BadRequestException('Invalid emotion detection response');
      }
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
