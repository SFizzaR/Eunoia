import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Query,
  Delete,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { EntriesService } from './entries.service';
import { JwtAuthGuard } from 'src/auth/gaurds/jwt-auth.gaurd';
import { CreateEntryDto } from './dto/create-entries-dto';

@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() CreateEntryDto: CreateEntryDto, @Request() req) {
    return this.entriesService.create(CreateEntryDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Request() req,
    @Query('emotionId') emotionId?: number,
    @Query('isDraft') isDraft?: string, // It comes as string from URL
  ) {
    const isDraftBool = isDraft === 'true';
    const emotionIdNum = emotionId ? Number(emotionId) : undefined;

    return this.entriesService.findAll(
      req.user.userId,
      isDraftBool,
      emotionIdNum,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEntryDto: any, @Request() req) {
    return this.entriesService.update(+id, updateEntryDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('count')
  getAllCount(@Request() req) {
    return this.entriesService.getAllCount(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.entriesService.remove(+id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.entriesService.findOne(+id, req.user.userId);
  }
}
