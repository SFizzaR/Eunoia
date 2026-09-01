import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SupabaseService } from 'src/supabase/supabase.service';
@Injectable()
export class AttachmentsService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  // ✅ Service - Single method for all cases
  async createMultiple(
    entry_id: number,
    userId: number,
    files: Express.Multer.File[] | Express.Multer.File, // Accept both
  ) {
    const fileArray = Array.isArray(files) ? files : [files];
    const validFiles = fileArray.filter((f) => f !== undefined && f !== null);

    console.log('Valid files:', validFiles);
    console.log('Files count:', validFiles.length);

    if (!validFiles || validFiles.length === 0) {
      throw new BadRequestException('No files provided');
    }

    console.log('Files received:', fileArray);
    console.log('Is array?:', Array.isArray(fileArray));

    if (!fileArray || fileArray.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const MAX_FILES = 5;
    const existing = await this.prisma.attachment.count({
      where: { entryId: entry_id },
    });

    if (existing + fileArray.length > MAX_FILES) {
      throw new BadRequestException(
        `Cannot add ${fileArray.length} files. Max ${MAX_FILES} total. Current: ${existing}`,
      );
    }

    // Verify ownership
    const entry = await this.prisma.entry.findUnique({
      where: { id: entry_id },
      select: { userId: true },
    });

    if (!entry) throw new NotFoundException('Entry not found');
    if (entry.userId !== userId)
      throw new UnauthorizedException('Not authorized');

    // Upload all (whether 1 or many)
    const attachments = await Promise.all(
      fileArray.map((file) => this.uploadSingleFile(entry_id, file)),
    );

    return {
      count: attachments.length,
      attachments,
    };
  }

  private async uploadSingleFile(entry_id: number, file: Express.Multer.File) {
    this.validateFile(file);
    const existing = await this.prisma.attachment.findFirst({
      where: {
        entryId: entry_id,
        fileName: file.originalname,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `File "${file.originalname}" already exists for this entry`,
      );
    }
    const filePath = `${entry_id}/${Date.now()}-${file.originalname}`;

    const { error } = await this.supabase
      .getClient()
      .storage.from('Journal attachments')
      .upload(filePath, file.buffer, { contentType: file.mimetype });

    if (error) throw new Error(error.message);

    const attachment = await this.prisma.attachment.create({
      data: {
        entryId: entry_id,
        fileType: file.mimetype,
        fileSize: file.size,
        fileUrl: filePath,
        fileName: file.originalname,
      },
    });

    const signedUrl = await this.getSignedUrl(filePath);
    return { ...attachment, fileUrl: signedUrl };
  }

  private validateFile(file: Express.Multer.File) {
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const ALLOWED_EXTENSIONS = [
      '.jpg',
      '.jpeg',
      '.png',
      '.webp',
      '.mp3',
      '.pdf',
    ];

    const ext = file.originalname
      .substring(file.originalname.lastIndexOf('.'))
      .toLowerCase();

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(`${file.originalname} exceeds 10MB`);
    }

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new BadRequestException(`${ext} not allowed`);
    }
  }
  async findAll(entryId: number, userId: number) {
    const entry = await this.prisma.entry.findUnique({
      where: {
        id: entryId,
      },
      select: {
        userId: true,
      },
    });

    if (!entry) throw new NotFoundException('Entry not found');

    if (entry.userId !== userId) {
      throw new UnauthorizedException('User not authorized');
    }

    const attachments = await this.prisma.attachment.findMany({
      where: { entryId },
      select: {
        id: true,
        fileName: true,
        fileUrl: true, // This is the file path
        fileType: true,
        fileSize: true,
      },
    });
    if (attachments.length === 0)
      throw new NotFoundException('No attachments for this entry');
    const attachmentsWithUrls = await Promise.all(
      attachments.map(async (attachment) => {
        const signedUrl = await this.getSignedUrl(attachment.fileUrl);
        return {
          ...attachment,
          fileUrl: signedUrl, // ✅ Return fresh signed URL
        };
      }),
    );

    return attachmentsWithUrls;
  }
  // ✅ Helper method to generate signed URL
  private async getSignedUrl(filePath: string, expiresIn: number = 3600) {
    const { data, error } = await this.supabase
      .getClient()
      .storage.from('Journal attachments')
      .createSignedUrl(filePath, expiresIn);

    if (error) throw new BadRequestException(error.message);
    return data.signedUrl;
  }

  findOne(id: number) {
    return `This action returns a #${id} attachment`;
  }

  update(id: number, updateAttachmentDto: UpdateAttachmentDto) {
    return `This action updates a #${id} attachment`;
  }

  async remove(attachmentId: number, userId: number) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { entry: { select: { userId: true } } },
    });

    if (!attachment) throw new NotFoundException('Attachment not found');
    if (attachment.entry.userId !== userId)
      throw new UnauthorizedException('Not authorized');

    // Delete from Supabase
    const { error } = await this.supabase
      .getClient()
      .storage.from('Journal attachments')
      .remove([attachment.fileUrl]);

    if (error) throw new BadRequestException(error.message);

    // Delete from DB
    return await this.prisma.attachment.delete({
      where: { id: attachmentId },
    });
  }
}
