import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateEntryReflectionDto } from './dto/create-entry_reflection.dto';
import { UpdateEntryReflectionDto } from './dto/update-entry_reflection.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class EntryReflectionsService {
  private hfApiToken: string | undefined; // ✅ Allow undefined
  private hfApiUrl = 'https://router.huggingface.co/v1/chat/completions';
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    // Load token from environment
    this.hfApiToken = this.config.get<string>('HF_TOKEN');

    if (!this.hfApiToken) {
      console.warn('⚠️ HF_TOKEN not found in .env');
    }
  }

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
      // ✅ Call Hugging Face to generate reflection
      const response = await axios.post(
        this.hfApiUrl,
        {
          model: 'mistralai/Mistral-7B-Instruct-v0.2:featherless-ai',
          messages: [
            {
              role: 'user',
              content: `You are an empathetic journal assistant.

Journal Entry:
"${createEntryReflectionDto.content}"

Emotions Detected: ${emotionText}

Provide BOTH:

1. REFLECTION (2 sentences): In second person, reflect on their thoughts and speak directly to them about what you notice
2. ADVICE (2-3 sentences): Supportive, constructive suggestions

Format exactly as:
REFLECTION: [your reflection here, speaking to them directly]
ADVICE: [your advice here]`,
            },
          ],
          max_tokens: 300,
          temperature: 0.7,
          top_p: 0.95,
        },
        {
          headers: {
            Authorization: `Bearer ${this.hfApiToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // ✅ Parse response correctly
      const text = response.data.choices[0].message.content;

      const reflectionMatch = text.match(/REFLECTION:\s*(.+?)(?=ADVICE:|$)/s);
      const adviceMatch = text.match(/ADVICE:\s*(.+?)$/s);

      const reflection = reflectionMatch?.[1]?.trim() || '';
      const advice = adviceMatch?.[1]?.trim() || null;
      if (!reflection) {
        throw new BadRequestException('Failed to generate reflection');
      }

      // ✅ Save to database with upsert
      const reflectionData = await this.prisma.entryReflection.upsert({
        where: {
          entryId: createEntryReflectionDto.entryId,
        },
        update: {
          reflection,
          advice,
          updatedAt: new Date(),
        },
        create: {
          entryId: createEntryReflectionDto.entryId,
          reflection,
          advice,
        },
        select: {
          id: true,
          reflection: true,
          advice: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        success: true,
        reflectionData,
      };
    } catch (error) {
      console.error('Error generating reflection:', error);
      throw new BadRequestException('Failed to generate reflection');
    }
  }

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
        reflection: true,
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
        reflection: true,
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
