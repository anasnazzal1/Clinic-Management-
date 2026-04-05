import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsMongoId, IsEnum } from 'class-validator';
import { AppointmentStatus } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Patient ID', example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  patientId!: string;

  @ApiProperty({ description: 'Doctor ID', example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  doctorId!: string;

  @ApiProperty({ description: 'Clinic ID', example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  clinicId!: string;

  @ApiProperty({ description: 'Appointment date', example: '2026-05-01' })
  @IsString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({ description: 'Appointment time', example: '14:00' })
  @IsString()
  @IsNotEmpty()
  time!: string;

  @ApiProperty({ description: 'Appointment status', example: 'pending', enum: AppointmentStatus, required: false })
  @IsEnum(AppointmentStatus)
  status!: AppointmentStatus;
}
