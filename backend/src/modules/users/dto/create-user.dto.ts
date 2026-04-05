import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/constants/roles.constant';

export class CreateUserDto {
  @ApiProperty({
    description: 'Username for the user account',
    example: 'john_doe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'Dr. Sarah Smith',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'sarah@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'securePassword123',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Phone number (optional)',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(UserRole)
  role: UserRole;
}


