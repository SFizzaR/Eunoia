import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/gaurds/jwt-auth.gaurd';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  update(@Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  remove(@Request() req) {
    try {
      const deletedUser = this.usersService.remove(req.user.userId);
      if (!deletedUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return deletedUser;
    } catch (eror) {
      throw new HttpException(
        'Failed to delete account',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile-image')
  async removeProfileImage(@Request() req) {
    return this.usersService.removeProfileImage(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cover-photo')
  async removeCoverImage(@Request() req) {
    return this.usersService.removeCoverImage(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.usersService.uploadProfileImage(req.user.userId, file);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cover-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCoverImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.usersService.uploadCoverImage(req.user.userId, file);
  }
}
