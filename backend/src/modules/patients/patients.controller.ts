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
  Req,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient } from './entities/patient.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';

@Controller('patients')
@ApiTags('Patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.RECEPTIONIST])
  @ApiOperation({ summary: 'Get all patients', description: 'Fetch all patient records' })
  @ApiResponse({ status: 200, description: 'Patients list returned', type: [Patient] })
  async findAll() {
    const patients = await this.patientsService.findAll();
    return {
      success: true,
      data: patients,
      message: 'Patients retrieved successfully',
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.PATIENT])
  @ApiOperation({ summary: 'Get patient by ID', description: 'Fetch patient details by ID' })
  @ApiParam({ name: 'id', description: 'Patient ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Patient found', type: Patient })
  async findOne(
    @Param('id') id: string,
    @Req() req: Request & { user?: { role?: string; linkedId?: string } },
  ) {
    const user = req.user;
    if (user?.role === UserRole.PATIENT && user.linkedId !== id) {
      throw new ForbiddenException('Patients can only access their own record');
    }

    const patient = await this.patientsService.findOne(id);
    return {
      success: true,
      data: patient,
      message: 'Patient retrieved successfully',
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.RECEPTIONIST])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create patient', description: 'Create a patient record and linked user account' })
  @ApiBody({ type: CreatePatientDto })
  @ApiResponse({ status: 201, description: 'Patient created', type: Patient })
  async create(@Body() createPatientDto: CreatePatientDto) {
    const patient = await this.patientsService.create(createPatientDto);
    return {
      success: true,
      data: patient,
      message: 'Patient created successfully',
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.PATIENT])
  @ApiOperation({ summary: 'Update patient', description: 'Update patient details' })
  @ApiParam({ name: 'id', description: 'Patient ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdatePatientDto })
  @ApiResponse({ status: 200, description: 'Patient updated', type: Patient })
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @Req() req: Request & { user?: { role?: string; linkedId?: string } },
  ) {
    const user = req.user;
    if (user?.role === UserRole.PATIENT && user.linkedId !== id) {
      throw new ForbiddenException('Patients can only update their own record');
    }

    const patient = await this.patientsService.update(id, updatePatientDto);
    return {
      success: true,
      data: patient,
      message: 'Patient updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Delete patient', description: 'Delete a patient record' })
  @ApiParam({ name: 'id', description: 'Patient ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Patient deleted' })
  async remove(@Param('id') id: string) {
    const result = await this.patientsService.remove(id);
    return {
      success: true,
      data: result,
      message: 'Patient deleted successfully',
    };
  }
}
