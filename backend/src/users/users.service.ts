import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from 'src/supabase/supabase.service';
import { extractStoragePath } from '../utils/storeage.util';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
      },
    });
    return user;
  }
  async validatePassword(email: string, password: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email: email },
    });
    if (!user) {
      return false;
    }
    return bcrypt.compare(password, user.password);
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        profileImageUrl: true,
        coverImageUrl: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const dataToUpdate = { ...updateUserDto };
    if (updateUserDto.password) {
      const hashedpassword = await bcrypt.hash(updateUserDto.password, 10);
      dataToUpdate.password = hashedpassword;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      throw new BadRequestException('No fields to update');
    }
    return this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
      },
    });
  }

  async removeProfileImage(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        profileImageUrl: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.profileImageUrl) {
      return;
    }

    const profilePath = extractStoragePath(
      user.profileImageUrl,
      'Profile pictures',
    );

    if (!profilePath) {
      throw new BadRequestException('Invalid profile image URL');
    }

    const { data, error } = await this.supabase
      .getClient()
      .storage.from('Profile pictures')
      .remove([profilePath]);

    this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        profileImageUrl: '', // ✅ Set to empty string
      },
    });

    if (error) {
      console.error('Unable to delete profile image:', error);
      throw new InternalServerErrorException('Unable to delete profile image');
    }

    return data;
  }

  async removeCoverImage(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        coverImageUrl: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.coverImageUrl) {
      return;
    }

    const coverPath = extractStoragePath(user.coverImageUrl, 'Cover photos');

    if (!coverPath) {
      throw new BadRequestException('Invalid cover image URL');
    }

    const { data, error } = await this.supabase
      .getClient()
      .storage.from('Cover photos')
      .remove([coverPath]);

    this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        coverImageUrl: '', // ✅ Set to empty string
      },
    });

    if (error) {
      console.error('Unable to delete profile image:', error);
      throw new InternalServerErrorException('Unable to delete cover image');
    }

    return data;
  }

  async remove(userId: number) {
    this.removeProfileImage(userId);
    this.removeCoverImage(userId);
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async uploadProfileImage(userId: number, file: Express.Multer.File) {
    const filePath = `${userId}/profile`;
    const { error } = await this.supabase
      .getClient()
      .storage.from('Profile pictures')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true, //what is this
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = this.supabase
      .getClient()
      .storage.from('Profile pictures')
      .getPublicUrl(filePath);

    const imageUrl = data.publicUrl;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        profileImageUrl: imageUrl,
      },
    });
    return {
      profileImageUrl: imageUrl,
    };
  }

  async uploadCoverImage(userId: number, file: Express.Multer.File) {
    const filePath = `${userId}/cover`;
    const { error } = await this.supabase
      .getClient()
      .storage.from('Cover photos')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true, //what is this
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = this.supabase
      .getClient()
      .storage.from('Cover photos')
      .getPublicUrl(filePath);

    const imageUrl = data.publicUrl;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        coverImageUrl: imageUrl,
      },
    });
    return {
      coverImageUrl: imageUrl,
    };
  }
}
