import {
  ForbiddenException,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEntryDto } from './dto/create-entries-dto';

@Injectable()
export class EntriesService {
  constructor(private prisma: PrismaService) {}

  async create(createEntryDto: CreateEntryDto, id: number) {
    return this.prisma.$transaction(async (tx) => {
      const { content, IsDraft, emotionids } = createEntryDto;

      if (!content?.trim()) {
        throw new BadRequestException('Content is missing');
      }

      const entry = await tx.entry.create({
        data: {
          content,
          isDraft: IsDraft ?? false,
          userId: id,
        },
        select: {
          id: true,
          content: true,
          userId: true,
        },
      });

      if (emotionids?.length) {
        for (const id of emotionids) {
          await tx.entryEmotion.create({
            data: {
              emotionId: id,
              entryId: entry.id,
              userSelected: true,
            },
          });
        }
      }

      return entry;
    });
  }
  async findAll(userId: number, isDraft?: boolean, emotionId?: number) {
    // Return draft entries
    if (isDraft) {
      const entries = await this.prisma.entry.findMany({
        where: {
          userId,
          isDraft: true,
        },
        select: {
          id: true,
          content: true,
          isDraft: true,
          createdAt: true,
          updatedAt: true,
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
        orderBy: {
          createdAt: 'desc',
        },
      });
      return entries;
    }

    // Return entries for a specific emotion
    if (emotionId) {
      const entries = await this.prisma.entry.findMany({
        where: {
          userId,
          isDraft: false, // Only non-draft entries
          emotions: {
            some: {
              emotionId: emotionId,
            },
          },
        },
        select: {
          id: true,
          content: true,
          isDraft: true,
          createdAt: true,
          attachments: {
            select: {
              fileUrl: true,
            },
          },
          emotions: {
            where: {
              emotionId: emotionId,
            },
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
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Also fetch the emotion details to return with entries
      const emotion = await this.prisma.emotion.findUnique({
        where: {
          id: emotionId,
        },
        select: {
          id: true,
          name: true,
          emoji: true,
          category: true,
        },
      });

      return {
        entries,
        emotion,
      };
    }

    // Return all non-draft entries (default case)
    const entries = await this.prisma.entry.findMany({
      where: {
        userId,
        isDraft: false,
      },
      select: {
        id: true,
        content: true,
        isDraft: true,
        createdAt: true,
        updatedAt: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });
    return entries;
  }

  async findOne(id: number, userId: number) {
    const entry = await this.prisma.entry.findUnique({
      where: {
        id: id,
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
      throw new NotFoundException('Entry not found');
    }

    if (userId !== entry.userId) {
      throw new ForbiddenException('User not authorized');
    }

    return entry;
  }

  async update(id: number, updateEntryDto: CreateEntryDto, userId: number) {
    return this.prisma.$transaction(async (tx) => {
      const { content, IsDraft, emotionids } = updateEntryDto;

      if (!content?.trim()) {
        throw new BadRequestException('Content is missing');
      }

      // Verify that the entry exists and belongs to this user
      const entry = await tx.entry.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          userId: true,
        },
      });

      if (!entry) {
        throw new NotFoundException('Entry not found');
      }

      if (entry.userId !== userId) {
        throw new ForbiddenException('Not authorized to update this entry');
      }

      // Update the entry
      const updated = await tx.entry.update({
        where: {
          id,
        },
        data: {
          content: content.trim(),
          isDraft: IsDraft ?? false,
        },
        select: {
          id: true,
          content: true,
          userId: true,
          isDraft: true,
        },
      });

      // Only modify emotions if emotionids was actually provided
      if (emotionids !== undefined) {
        // Get current emotions for this entry
        const existingEmotions = await tx.entryEmotion.findMany({
          where: {
            entryId: id,
          },
          select: {
            emotionId: true,
          },
        });

        const existingIds = existingEmotions.map(
          (emotion) => emotion.emotionId,
        );

        // Remove duplicates from the incoming array
        const newEmotionIds = [...new Set(emotionids)];

        // Emotions that were removed
        const emotionsToDelete = existingIds.filter(
          (emotionId) => !newEmotionIds.includes(emotionId),
        );

        // Emotions that are newly added
        const emotionsToAdd = newEmotionIds.filter(
          (emotionId) => !existingIds.includes(emotionId),
        );

        // Delete only removed emotions
        if (emotionsToDelete.length > 0) {
          await tx.entryEmotion.deleteMany({
            where: {
              entryId: id,
              emotionId: {
                in: emotionsToDelete,
              },
            },
          });
        }

        // Create only new emotions
        if (emotionsToAdd.length > 0) {
          await tx.entryEmotion.createMany({
            data: emotionsToAdd.map((emotionId) => ({
              entryId: id,
              emotionId,
              userSelected: true,
            })),
          });
        }
      }

      return updated;
    });
  }

  async getAllCount(userId: number) {
    // Fetch all emotions
    const emotions = await this.prisma.emotion.findMany({
      select: {
        id: true,
        name: true,
        emoji: true,
      },
    });

    if (!emotions || emotions.length === 0) {
      throw new Error('Failed to fetch emotions');
    }

    // Count drafts for this user
    const draftCount = await this.prisma.entry.count({
      where: {
        userId: userId,
        isDraft: true,
      },
    });

    // For each emotion, count published entries belonging to this user
    const emotionCounts = await Promise.all(
      emotions.map(async (emotion) => {
        const count = await this.prisma.entryEmotion.count({
          where: {
            emotionId: emotion.id,
            entry: {
              userId: userId,
              isDraft: false, // ✅ Only count published entries
            },
          },
        });

        return {
          emotionId: emotion.id,
          emotionName: emotion.name,
          emoji: emotion.emoji,
          entryCount: count,
        };
      }),
    );

    return {
      emotions: emotionCounts,
      draftCount: draftCount,
      totalPublishedEntries: emotionCounts.reduce(
        (sum, e) => sum + e.entryCount,
        0,
      ),
    };
  }
  async remove(id: number, userId: number) {
    const data = await this.prisma.entry.findUnique({
      where: {
        id: id,
      },
      select: {
        userId: true,
      },
    });

    if (!data) {
      throw new NotFoundException('Entry does not exist');
    }

    if (data?.userId !== userId) {
      throw new ForbiddenException('Unauthorized user');
    }

    // Use transaction to ensure all-or-nothing
    return await this.prisma.$transaction(async (tx) => {
      // Delete emotions first
      await tx.entryEmotion.deleteMany({
        where: {
          entryId: id,
        },
      });

      // Delete attachments
      await tx.attachment.deleteMany({
        where: {
          entryId: id,
        },
      });

      await tx.entryReflection.delete({
        where: {
          entryId: id,
        },
      });

      // Finally delete the entry
      return await tx.entry.delete({
        where: {
          id: id,
        },
      });
    });
  }
}
