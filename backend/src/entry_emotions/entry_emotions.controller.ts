import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { EntryEmotionsService } from './entry_emotions.service';
import { CreateEntryEmotionDto } from './dto/create-entry_emotion.dto';
import { DetectEntryEmotionDto } from './dto/detect-entry_emotion.dto';
import { JwtAuthGuard } from 'src/auth/gaurds/jwt-auth.gaurd';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpStatus } from '@nestjs/common';

@Controller('entry-emotions')
export class EntryEmotionsController {
  constructor(
    private readonly entryEmotionsService: EntryEmotionsService,
    private prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createEntryEmotionDtos: CreateEntryEmotionDto[],
    @Request() req,
  ) {
    return this.entryEmotionsService.create(
      createEntryEmotionDtos,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('detect-mood')
  async detectAndSave(@Body() dto: DetectEntryEmotionDto, @Request() req) {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      // ✅ Call detectMood OUTSIDE transaction (it makes HTTP calls)
      const detectedEmotions = await this.entryEmotionsService.detectMood(
        dto,
        userId,
      );

      // ✅ ONLY database operations inside transaction
      const result = await this.prisma.$transaction(async (tx) => {
        const saved = await this.entryEmotionsService.saveDetectedEmotions(
          dto.entryId,
          detectedEmotions,
          userId,
          tx,
        );

        return { detectedEmotions, saved };
      });

      return {
        success: true,
        ...result,
      };
    } catch (error: any) {
      console.error('Error in detectAndSave:', error);
      throw new HttpException(
        error.message || 'Failed to detect and save emotions',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  findAll() {
    return this.entryEmotionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entryEmotionsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.entryEmotionsService.remove(+id);
  }
}
