import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { Doctor } from './entities/doctor.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';

@Controller('doctors')
@ApiTags('Doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all doctors', description: 'Fetch all available doctors' })
  @ApiResponse({ status: 200, description: 'Doctors list returned', type: [Doctor] })
  async findAll() {
    const doctors = await this.doctorsService.findAll();
    return {
      success: true,
      data: doctors,
      message: 'Doctors retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get doctor by ID', description: 'Fetch doctor details by ID' })
  @ApiParam({ name: 'id', description: 'Doctor ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Doctor found', type: Doctor })
  async findOne(@Param('id') id: string) {
    const doctor = await this.doctorsService.findOne(id);
    return {
      success: true,
      data: doctor,
      message: 'Doctor retrieved successfully',
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create doctor',
    description: 'Admin endpoint to create a doctor record and linked user account',
  })
  @ApiBody({ type: CreateDoctorDto })
  @ApiResponse({ status: 201, description: 'Doctor created', type: Doctor })
  async create(@Body() createDoctorDto: CreateDoctorDto) {
    const doctor = await this.doctorsService.create(createDoctorDto);
    return {
      success: true,
      data: doctor,
      message: 'Doctor created successfully',
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Update doctor', description: 'Admin endpoint to update doctor details' })
  @ApiParam({ name: 'id', description: 'Doctor ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateDoctorDto })
  @ApiResponse({ status: 200, description: 'Doctor updated', type: Doctor })
  async update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    const doctor = await this.doctorsService.update(id, updateDoctorDto);
    return {
      success: true,
      data: doctor,
      message: 'Doctor updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Delete doctor', description: 'Admin endpoint to delete a doctor' })
  @ApiParam({ name: 'id', description: 'Doctor ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Doctor deleted' })
  async remove(@Param('id') id: string) {
    const result = await this.doctorsService.remove(id);
    return {
      success: true,
      data: result,
      message: 'Doctor deleted successfully',
    };
  }
}
