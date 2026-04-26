import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateVisitDto } from './create-visit.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateVisitDto extends PartialType(CreateVisitDto) {
  @ApiProperty({ description: 'Prescription', example: 'Cetirizine 10mg once daily for 7 days', required: false })
  @IsOptional()
  @IsString()
  prescription?: string;

  @ApiProperty({ description: 'Follow-up date', example: '2026-05-15', required: false })
  @IsOptional()
  @IsString()
  followUpDate?: string;
}
