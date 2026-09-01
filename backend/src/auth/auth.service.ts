import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
    private emailService: EmailService,
  ) {}
  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    if (createUserDto.password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }

    if (
      !createUserDto.email ||
      !createUserDto.firstname ||
      !createUserDto.lastname ||
      !createUserDto.password
    ) {
      throw new BadRequestException('All fields are required');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const { password, ...createUserData } = createUserDto; // ← Destructure out password
    const user = await this.userService.create({
      ...createUserData,
      password: hashedPassword,
    });
    return {
      access_token: this.jwtService.sign({ email: user.email, sub: user.id }),
      user: {
        userId: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
      },
    };
  }
  async login(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isPasswordValid = await this.userService.validatePassword(
      email,
      password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        userId: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        profileImageUrl: user.profileImageUrl,
        coverImageUrl: user.coverImageUrl,
      },
    };
  }

  async validate(payload: any) {
    console.log('JWT PAYLOAD:', payload);

    return { id: payload.sub, email: payload.email };
  }
}
