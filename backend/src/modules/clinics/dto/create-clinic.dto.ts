import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateClinicDto {
  @ApiProperty({ description: 'Clinic name', example: 'City Health Center' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Working days of the clinic',
    example: 'Mon, Tue, Wed, Thu, Fri',
  })
  @IsString()
  @IsNotEmpty()
  workingDays!: string;

  @ApiProperty({
    description: 'Working hours of the clinic',
    example: '09:00 - 17:00',
  })
  @IsString()
  @IsNotEmpty()
  workingHours!: string;
}
