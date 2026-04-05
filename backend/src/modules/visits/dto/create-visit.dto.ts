import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsMongoId, IsOptional } from 'class-validator';

export class CreateVisitDto {
  @ApiProperty({ description: 'Patient ID', example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  patientId!: string;

  @ApiProperty({ description: 'Doctor ID', example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  doctorId!: string;

  @ApiProperty({ description: 'Visit date', example: '2026-05-01' })
  @IsString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({ description: 'Diagnosis notes', example: 'Seasonal allergies and cough', required: false })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiProperty({ description: 'Visit notes', example: 'Recommend rest and fluids', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
