import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateReceptionistDto {
  @ApiProperty({ description: 'Receptionist full name', example: 'Nina Patel' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Receptionist phone number', example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Receptionist email address', example: 'nina@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'Username for receptionist login', example: 'nina_patel' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ description: 'Password for receptionist login', example: 'Reception123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
