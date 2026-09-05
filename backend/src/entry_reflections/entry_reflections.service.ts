import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateEntryReflectionDto } from './dto/create-entry_reflection.dto';
import { UpdateEntryReflectionDto } from './dto/update-entry_reflection.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class EntryReflectionsService {
  constructor(private prisma: PrismaService) {}

  private ollamaUrl = 'http://localhost:11434/api/generate';
  private model = 'mistral';

  async create(
    createEntryReflectionDto: CreateEntryReflectionDto,
    userId: number,
  ) {
    // ✅ Validate input
    if (!createEntryReflectionDto.content?.trim()) {
      throw new BadRequestException('Content is required');
    }

    // ✅ Validate entry exists and belongs to user
    const entry = await this.prisma.entry.findUnique({
      where: {
        id: createEntryReflectionDto.entryId,
      },
      select: {
        userId: true,
      },
    });

    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    if (userId !== entry.userId) {
      throw new ForbiddenException('User not authorized');
    }

    // ✅ Format emotions for prompt
    const emotionText =
      createEntryReflectionDto.emotions?.join(', ') || 'various feelings';

    try {
      // ✅ Call Ollama to generate reflection
      const response = await axios.post(this.ollamaUrl, {
        model: this.model,
        prompt: `You are an empathetic journal assistant.

Journal Entry:
"${createEntryReflectionDto.content}"

Emotions Detected: ${emotionText}

Provide BOTH:

1. SUMMARY (2 sentences): Briefly show you understood their experience
2. ADVICE (2-3 sentences): Supportive, constructive suggestions

Format exactly as:
SUMMARY: [your summary here]
ADVICE: [your advice here]`,
        stream: false,
        temperature: 0.7,
      });

      // ✅ Parse response correctly
      const text = response.data.response;
      const summaryMatch = text.match(/SUMMARY:\s*(.+?)(?=ADVICE:|$)/s);
      const adviceMatch = text.match(/ADVICE:\s*(.+?)$/s);

      const summary = summaryMatch?.[1]?.trim() || '';
      const advice = adviceMatch?.[1]?.trim() || null;

      if (!summary) {
        throw new BadRequestException('Failed to generate summary');
      }

      // ✅ Save to database with upsert (update if exists, create if not)
      const reflection = await this.prisma.entryReflection.upsert({
        where: {
          entryId: createEntryReflectionDto.entryId,
        },
        update: {
          summary,
          advice,
          updatedAt: new Date(),
        },
        create: {
          entryId: createEntryReflectionDto.entryId,
          summary,
          advice,
        },
        select: {
          id: true,
          summary: true,
          advice: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        success: true,
        reflection,
      };
    } catch (error) {
      console.error('Error generating reflection:', error);
      throw new BadRequestException('Failed to generate reflection');
    }
  }

  // ✅ Implement findOne for getting reflection by entry ID
  async findByEntryId(entryId: number, userId: number) {
    const entry = await this.prisma.entry.findUnique({
      where: { id: entryId },
      select: { userId: true },
    });

    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    if (entry.userId !== userId) {
      throw new ForbiddenException('User not authorized');
    }

    return await this.prisma.entryReflection.findUnique({
      where: { entryId },
      select: {
        summary: true,
        advice: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findAll() {
    return `This action returns all entryReflections`;
  }

  async findOne(entryid: number, userId: number) {
    const entry = await this.prisma.entry.findUnique({
      where: {
        id: entryid,
      },
      select: {
        userId: true,
      },
    });

    if (entry?.userId !== userId) {
      throw new ForbiddenException('User not authorized');
    }

    const reflection = await this.prisma.entryReflection.findUnique({
      where: {
        entryId: entryid,
      },
      select: {
        summary: true,
        advice: true,
      },
    });

    if (!reflection) {
      throw new NotFoundException('Reflection not found');
    }

    return reflection;
  }

  update(id: number, updateEntryReflectionDto: UpdateEntryReflectionDto) {
    return `This action updates a #${id} entryReflection`;
  }

  async remove(entryid: number, userId: number) {
    const entry = await this.prisma.entry.findUnique({
      where: {
        id: entryid,
      },
      select: {
        userId: true,
      },
    });

    if (entry?.userId !== userId) {
      throw new ForbiddenException('User not authorized');
    }

    const deletedReflection = await this.prisma.entryReflection.delete({
      where: {
        entryId: entryid,
      },
      select: {
        id: true,
      },
    });

    return deletedReflection;
  }
}
