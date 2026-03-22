import { ApiProperty } from '@nestjs/swagger';
export class UserDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Phone number of the user (optional)',
    example: '+1234567890',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'User role',
    enum: ['admin', 'reception', 'doctor', 'patient'],
    example: 'patient',
  })
  role: string;

  @ApiProperty({
    description: 'Whether the user has verified their email',
    example: true,
  })
  isVerified: boolean;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last account update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}
