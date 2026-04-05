import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsMongoId, IsEmail } from 'class-validator';

export class CreateDoctorDto {
  @ApiProperty({ description: 'Doctor name', example: 'Dr. Sarah Smith' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Doctor specialization', example: 'General Practitioner' })
  @IsString()
  @IsNotEmpty()
  specialization!: string;

  @ApiProperty({
    description: 'Clinic ID where the doctor works',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  clinicId!: string;

  @ApiProperty({
    description: 'Doctor working days',
    example: 'Mon, Tue, Wed, Thu',
  })
  @IsString()
  @IsNotEmpty()
  workingDays!: string;

  @ApiProperty({
    description: 'Doctor working hours',
    example: '09:00 - 17:00',
  })
  @IsString()
  @IsNotEmpty()
  workingHours!: string;

  @ApiProperty({
    description: 'Doctor email address',
    example: 'sarah@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Doctor phone number',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Username for doctor login', example: 'dr_sarah' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ description: 'Password for doctor login', example: 'StrongPass123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
