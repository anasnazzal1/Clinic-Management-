import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Create a new user account. Email verification is required before login. ' +
      'A verification token will be sent (in response for development). ' +
      'Patients are created unverified by default.',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration details',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        success: true,
        data: {
          user: {
            _id: '507f1f77bcf86cd799439011',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            role: 'patient',
            isVerified: false,
            createdAt: '2024-01-15T10:30:00.000Z',
          },
          verificationToken: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
        },
        message: 'Registration successful. Please verify your email.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or email already exists',
  })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return {
      success: true,
      data: result,
      message: result.message,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with email and password. ' +
      'Returns a JWT token valid for 24 hours. ' +
      'User must have verified their email before login.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful, JWT token returned',
    schema: {
      example: {
        success: true,
        data: {
          user: {
            _id: '507f1f77bcf86cd799439011',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'patient',
            isVerified: true,
          },
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        message: 'Login successful',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or email not verified',
  })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      data: result,
      message: 'Login successful',
    };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email address',
    description:
      'Verify user email using the verification token received during registration. ' +
      'Token is valid for 24 hours. After verification, user can login.',
  })
  @ApiBody({
    type: VerifyEmailDto,
    description: 'Email verification token',
  })
  @ApiResponse({
    status: 200,
    description: 'Email successfully verified',
    schema: {
      example: {
        success: true,
        data: {
          _id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
          isVerified: true,
          role: 'patient',
        },
        message: 'Email verified successfully. You can now login.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token',
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    const result = await this.authService.verifyEmail(verifyEmailDto);
    return {
      success: true,
      data: result,
      message: result.message,
    };
  }
}
