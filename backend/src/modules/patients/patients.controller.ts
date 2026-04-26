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

type AuthRequest = Request & { user?: { role?: string; linkedId?: string } };

@Controller('patients')
@ApiTags('Patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  // ── GET /patients/my  (doctor-scoped) ──────────────────────────────────────
  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.DOCTOR])
  @ApiOperation({
    summary: 'Get my patients (doctor)',
    description: 'Returns only patients who have at least one appointment with the authenticated doctor.',
  })
  @ApiResponse({ status: 200, description: 'Doctor patients returned', type: [Patient] })
  async findMyPatients(@Req() req: AuthRequest) {
    const doctorId = req.user?.linkedId;
    if (!doctorId) throw new ForbiddenException('Doctor identity could not be resolved');

    const patients = await this.patientsService.findByDoctor(doctorId);
    return {
      success: true,
      data: patients,
      message: 'Patients retrieved successfully',
    };
  }

  // ── GET /patients  (admin + receptionist only) ─────────────────────────────
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.RECEPTIONIST])
  @ApiOperation({ summary: 'Get all patients', description: 'Admin/Receptionist: fetch all patient records' })
  @ApiResponse({ status: 200, description: 'Patients list returned', type: [Patient] })
  async findAll() {
    const patients = await this.patientsService.findAll();
    return {
      success: true,
      data: patients,
      message: 'Patients retrieved successfully',
    };
  }

  // ── GET /patients/:id ──────────────────────────────────────────────────────
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.PATIENT, UserRole.DOCTOR])
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiParam({ name: 'id', description: 'Patient ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Patient found', type: Patient })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    const { role, linkedId } = req.user ?? {};

    if (role === UserRole.PATIENT && linkedId !== id) {
      throw new ForbiddenException('Patients can only access their own record');
    }

    if (role === UserRole.DOCTOR) {
      const hasAccess = linkedId
        ? await this.patientsService.hasAppointmentWithDoctor(id, linkedId)
        : false;
      if (!hasAccess) {
        throw new ForbiddenException('You do not have an appointment with this patient');
      }
    }

    const patient = await this.patientsService.findOne(id);
    return {
      success: true,
      data: patient,
      message: 'Patient retrieved successfully',
    };
  }

  // ── POST /patients ─────────────────────────────────────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.RECEPTIONIST])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create patient' })
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

  // ── PUT /patients/:id ──────────────────────────────────────────────────────
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.PATIENT])
  @ApiOperation({ summary: 'Update patient' })
  @ApiParam({ name: 'id', description: 'Patient ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdatePatientDto })
  @ApiResponse({ status: 200, description: 'Patient updated', type: Patient })
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @Req() req: AuthRequest,
  ) {
    if (req.user?.role === UserRole.PATIENT && req.user.linkedId !== id) {
      throw new ForbiddenException('Patients can only update their own record');
    }

    const patient = await this.patientsService.update(id, updatePatientDto);
    return {
      success: true,
      data: patient,
      message: 'Patient updated successfully',
    };
  }

  // ── DELETE /patients/:id ───────────────────────────────────────────────────
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Delete patient' })
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
