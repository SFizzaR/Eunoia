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
  HttpStatus,
} from '@nestjs/common';
import { EntryReflectionsService } from './entry_reflections.service';
import { CreateEntryReflectionDto } from './dto/create-entry_reflection.dto';
import { UpdateEntryReflectionDto } from './dto/update-entry_reflection.dto';
import { JwtAuthGuard } from 'src/auth/gaurds/jwt-auth.gaurd';

@Controller('entry-reflections')
export class EntryReflectionsController {
  constructor(
    private readonly entryReflectionsService: EntryReflectionsService,
  ) {}

  // ✅ Create reflection
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createEntryReflectionDto: CreateEntryReflectionDto,
    @Request() req,
  ) {
    try {
      return await this.entryReflectionsService.create(
        createEntryReflectionDto,
        req.user.userId,
      );
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to create reflection',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ✅ Get reflection by entry ID
  @UseGuards(JwtAuthGuard)
  @Get('entry/:entryId')
  async findByEntryId(@Param('entryId') entryId: string, @Request() req) {
    try {
      return await this.entryReflectionsService.findByEntryId(
        +entryId,
        req.user.userId,
      );
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to fetch reflection',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  findAll() {
    return this.entryReflectionsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':entryId')
  findOne(@Param('entryId') entryId: string, @Request() req) {
    return this.entryReflectionsService.findByEntryId(
      parseInt(entryId, 10),
      req.user.userId,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEntryReflectionDto: UpdateEntryReflectionDto,
  ) {
    return this.entryReflectionsService.update(+id, updateEntryReflectionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':entryId')
  remove(@Param('entryId') entryId: string, @Request() req) {
    return this.entryReflectionsService.remove(
      parseInt(entryId, 10),
      req.user.userId,
    );
  }
}
