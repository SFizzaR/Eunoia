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
} from '@nestjs/common';
import { EntryEmotionsService } from './entry_emotions.service';
import { CreateEntryEmotionDto } from './dto/create-entry_emotion.dto';
import { UpdateEntryEmotionDto } from './dto/update-entry_emotion.dto';
import { JwtAuthGuard } from 'src/auth/gaurds/jwt-auth.gaurd';

@Controller('entry-emotions')
export class EntryEmotionsController {
  constructor(private readonly entryEmotionsService: EntryEmotionsService) {}

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

  @Get()
  findAll() {
    return this.entryEmotionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entryEmotionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEntryEmotionDto: UpdateEntryEmotionDto,
  ) {
    return this.entryEmotionsService.update(+id, updateEntryEmotionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.entryEmotionsService.remove(+id);
  }
}
