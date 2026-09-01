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
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
} from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { JwtAuthGuard } from 'src/auth/gaurds/jwt-auth.gaurd';
import { FilesInterceptor } from '@nestjs/platform-express';
import 'multer';

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  @Post(':entry_id')
  create(
    @Param('entry_id', ParseIntPipe) entry_id: number,
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[], // ✅ Changed to plural
  ) {
    return this.attachmentsService.createMultiple(
      entry_id,
      req.user.userId,
      files,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':entry_id')
  findAll(@Param('entry_id', ParseIntPipe) entry_id: number, @Request() req) {
    return this.attachmentsService.findAll(entry_id, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attachmentsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAttachmentDto: UpdateAttachmentDto,
  ) {
    return this.attachmentsService.update(+id, updateAttachmentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.attachmentsService.remove(+id, req.user.userId);
  }
}
