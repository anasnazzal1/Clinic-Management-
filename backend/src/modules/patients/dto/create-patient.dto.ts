import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber } from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({ description: 'Patient full name', example: 'Emily Jones' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Patient age', example: 42, required: false })
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiProperty({ description: 'Patient gender', example: 'female', required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ description: 'Patient phone number', example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Patient email address', example: 'emily@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'Patient address', example: '123 Main St, Anytown', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Username for patient login', example: 'emilyjones' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ description: 'Password for patient login', example: 'PatientPass123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
