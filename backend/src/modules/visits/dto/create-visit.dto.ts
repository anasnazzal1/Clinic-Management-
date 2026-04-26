import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsMongoId, IsOptional } from 'class-validator';

export class CreateVisitDto {
  @ApiProperty({ description: 'Related appointment ID (optional)', example: '507f1f77bcf86cd799439011', required: false })
  @IsOptional()
  @IsMongoId()
  appointmentId?: string;

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

  @ApiProperty({ description: 'Treatment / Prescription', example: 'Antihistamine 10mg twice daily', required: false })
  @IsOptional()
  @IsString()
  treatment?: string;

  @ApiProperty({ description: 'Doctor notes', example: 'Recommend rest and fluids', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

<<<<<<< HEAD
  @ApiProperty({ description: 'Prescription', example: 'Cetirizine 10mg once daily for 7 days', required: false })
  @IsOptional()
  @IsString()
  prescription?: string;

  @ApiProperty({ description: 'Follow-up date', example: '2026-05-15', required: false })
  @IsOptional()
  @IsString()
  followUpDate?: string;
=======
  @ApiProperty({ description: 'Follow-up date (YYYY-MM-DD)', example: '2026-06-01', required: false })
  @IsOptional()
  @IsString()
  followUpDate?: string;

  @ApiProperty({ description: 'Additional remarks', example: 'Patient advised to avoid allergens', required: false })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({
    description: 'Overall patient improvement status',
    enum: ['fully_recovered', 'significant_improvement', 'moderate_improvement', 'no_improvement', 'worsened'],
    required: false,
  })
  @IsOptional()
  @IsString()
  improvementStatus?: string;

  @ApiProperty({ description: 'Estimated remaining treatment duration', example: '2 weeks', required: false })
  @IsOptional()
  @IsString()
  treatmentDuration?: string;

  @ApiProperty({ description: 'Clinical observations: symptom changes, vitals, new findings', required: false })
  @IsOptional()
  @IsString()
  clinicalObservations?: string;

  @ApiProperty({ description: 'Required follow-up actions', required: false })
  @IsOptional()
  @IsString()
  followUpActions?: string;

  @ApiProperty({
    description: 'Case status after visit',
    enum: ['closed', 'monitoring', 'requires_consultation'],
    required: false,
  })
  @IsOptional()
  @IsString()
  caseStatus?: string;

  @ApiProperty({ description: 'Medical alerts: allergies, risk factors, urgent referrals', required: false })
  @IsOptional()
  @IsString()
  medicalAlerts?: string;
>>>>>>> b325177 (add some update)
}
