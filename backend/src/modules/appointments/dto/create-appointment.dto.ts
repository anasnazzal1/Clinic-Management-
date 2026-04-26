import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsEnum,
  IsOptional,
  Matches,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';
import { AppointmentStatus } from '../entities/appointment.entity';

@ValidatorConstraint({ name: 'isNotPastDate', async: false })
class IsNotPastDateConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    if (!value) {
      return false;
    }

    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const appointmentDate = new Date(`${value}T00:00:00`);

    return !Number.isNaN(appointmentDate.getTime()) && appointmentDate >= todayOnly;
  }

  defaultMessage(_args?: ValidationArguments) {
    return 'date must not be in the past';
  }
}

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
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  @Validate(IsNotPastDateConstraint)
  date!: string;

  @ApiProperty({ description: 'Appointment time', example: '14:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'time must be in HH:MM format',
  })
  time!: string;

  @ApiProperty({
    description: 'Appointment status (ignored for patient creates — server sets pending_approval)',
    example: 'pending',
    enum: AppointmentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
