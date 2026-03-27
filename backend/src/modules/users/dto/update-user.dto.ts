import { IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Updated full name',
    example: 'Dr. Sarah Johnson',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Updated email address',
    example: 'sarah.johnson@example.com',
    format: 'email',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Updated phone number',
    example: '+9876543210',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;
}


