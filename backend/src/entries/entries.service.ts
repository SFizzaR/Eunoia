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
      const { content, IsDraft, emotions } = createEntryDto;

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

      if (emotions?.length) {
        for (const emotion of emotions) {
          await tx.entryEmotion.create({
            data: {
              emotionId: parseInt(emotion.emotionId),
              entryId: entry.id,
              userSelected: emotion.userSelected,
              confidence: emotion.confidence ?? null,
              aiDetected: emotion.aiDetected,
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
                  animatedEmojiUrl: true,
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
                  animatedEmojiUrl: true,
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
          animatedEmojiUrl: true,
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
                animatedEmojiUrl: true,
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
                animatedEmojiUrl: true,
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

  // ✅ Fixed update method - convert emotionId string to number

  async update(id: number, updateEntryDto: CreateEntryDto, userId: number) {
    return this.prisma.$transaction(async (tx) => {
      const { content, IsDraft, emotions } = updateEntryDto;

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

      // Update the entry content and draft status
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

      // Only modify emotions if emotions array is provided
      if (emotions !== undefined) {
        // Get ONLY user-selected emotions (NOT AI-detected)
        const existingUserEmotions = await tx.entryEmotion.findMany({
          where: {
            entryId: id,
            userSelected: true,
          },
          select: {
            emotionId: true,
          },
        });

        const existingIds = existingUserEmotions.map((e) => e.emotionId);

        // Convert string emotionIds to numbers for comparison
        const newEmotionIds = emotions
          .filter((e) => e.userSelected)
          .map((e) => parseInt(e.emotionId));

        // Emotions to delete (user-selected ones being removed)
        const emotionsToDelete = existingIds.filter(
          (id) => !newEmotionIds.includes(id),
        );

        // Emotions to add (new user-selected emotions)
        const emotionsToAdd = emotions.filter(
          (e) =>
            e.userSelected && // Only add user-selected
            !existingIds.includes(parseInt(e.emotionId)),
        );

        // Delete only user-selected emotions
        if (emotionsToDelete.length > 0) {
          await tx.entryEmotion.deleteMany({
            where: {
              entryId: id,
              emotionId: {
                in: emotionsToDelete,
              },
              userSelected: true,
            },
          });
          console.log(
            `🗑️ Deleted ${emotionsToDelete.length} user-selected emotions`,
          );
        }

        // Create new emotions (both user-selected and AI-detected from emotions array)
        if (emotionsToAdd.length > 0) {
          await tx.entryEmotion.createMany({
            data: emotionsToAdd.map((emotion) => ({
              entryId: id,
              emotionId: parseInt(emotion.emotionId), // ✅ String → Number
              userSelected: emotion.userSelected,
              aiDetected: emotion.aiDetected,
              confidence: emotion.confidence ?? null,
            })),
          });
          console.log(`➕ Added ${emotionsToAdd.length} new emotions`);
        }

        console.log(`✅ Emotions updated. AI-detected emotions preserved.`);
      } else {
        // emotions is undefined - DO NOT TOUCH EMOTIONS AT ALL
        console.log(`✅ Publishing entry. All emotions preserved.`);
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
        animatedEmojiUrl: true,
        color: true,
        category: true,
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

    // ✅ For each emotion, count ALL emotion records (both user-selected AND AI-detected)
    // that are associated with published entries
    const emotionCounts = await Promise.all(
      emotions.map(async (emotion) => {
        const count = await this.prisma.entryEmotion.count({
          where: {
            emotionId: emotion.id,
            entry: {
              userId: userId,
              isDraft: false, // ✅ Only count published entries
            },
            // ✅ Count both user-selected AND AI-detected emotions
            OR: [{ userSelected: true }, { aiDetected: true }],
          },
        });
        return {
          emotionId: emotion.id,
          emotionName: emotion.name,
          animatedEmojiUrl: emotion.animatedEmojiUrl,
          entryCount: count,
          color: emotion.color,
          category: emotion.category,
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

      await tx.entryReflection.deleteMany({
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
