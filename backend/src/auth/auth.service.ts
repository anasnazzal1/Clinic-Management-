import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(EmailVerificationToken.name)
    private emailTokenModel: Model<EmailVerificationToken>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      email: registerDto.email.toLowerCase(),
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Create new user (patients register themselves)
    const newUser = await this.userModel.create({
      name: registerDto.name,
      email: registerDto.email.toLowerCase(),
      passwordHash,
      phone: registerDto.phone || '',
      role: 'patient',
      isVerified: false,
    });

    // Generate verification token
    const token = this.generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.emailTokenModel.create({
      userId: newUser._id,
      token,
      expiresAt,
    });

    return {
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      verificationToken: token,
      message: 'Registration successful. Please verify your email.',
    };
  }

  async login(loginDto: LoginDto) {
    // Find user by email
    const user = await this.userModel.findOne({
      email: loginDto.email.toLowerCase(),
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in. Use the verification token sent during registration.',
      );
    }

    // Generate JWT token
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    // Find verification token
    const emailToken = await this.emailTokenModel.findOne({
      token: verifyEmailDto.token,
    });

    if (!emailToken) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Check if token has expired
    if (new Date() > emailToken.expiresAt) {
      await this.emailTokenModel.deleteOne({ _id: emailToken._id });
      throw new BadRequestException('Verification token has expired');
    }

    // Find and update user
    const user = await this.userModel.findByIdAndUpdate(
      emailToken.userId,
      { isVerified: true },
      { new: true },
    );

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Delete used token
    await this.emailTokenModel.deleteOne({ _id: emailToken._id });

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      message: 'Email verified successfully. You can now login.',
    };
  }

  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
