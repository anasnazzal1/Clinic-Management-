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
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { Visit } from './entities/visit.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';

function refToIdString(ref: unknown): string {
  if (ref == null) return '';
  if (typeof ref === 'object' && ref !== null && '_id' in ref) {
    return String((ref as { _id: unknown })._id);
  }
  return String(ref);
}

@Controller('visits')
@ApiTags('Visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.DOCTOR])
  @ApiOperation({ summary: 'Get all visits', description: 'Fetch all visit records' })
  @ApiResponse({ status: 200, description: 'Visits list returned', type: [Visit] })
  async findAll() {
    const visits = await this.visitsService.findAll();
    return {
      success: true,
      data: visits,
      message: 'Visits retrieved successfully',
    };
  }

  @Get('patient/:patientId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT])
  @ApiOperation({
    summary: 'Get visits by patient',
    description: 'Retrieve all visits for a specific patient. Admin can access any patient, doctors can access patients they treated, patients can only access their own visits.'
  })
  @ApiParam({ name: 'patientId', description: 'Patient ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'List of patient visits' })
  @ApiResponse({ status: 403, description: 'Forbidden - Access denied' })
  async findByPatient(
    @Param('patientId') patientId: string,
    @Req() req: Request & { user?: { role?: string; linkedId?: string } },
  ) {
    const user = req.user;

    // Access control validation
    if (user?.role === UserRole.PATIENT && user.linkedId !== patientId) {
      throw new ForbiddenException('Patients can only access their own visits');
    }

    const visits = await this.visitsService.findByPatient(
      patientId,
      user?.role,
      user?.linkedId,
    );

    return {
      success: true,
      data: visits,
      message: 'Patient visits retrieved successfully',
    };
  }

  @Get('doctor/:doctorId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.DOCTOR])
  @ApiOperation({
    summary: 'Get visits by doctor',
    description: 'Retrieve all visits for a specific doctor. Admin can access any doctor, doctors can only access their own visits.'
  })
  @ApiParam({ name: 'doctorId', description: 'Doctor ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'List of doctor visits' })
  @ApiResponse({ status: 403, description: 'Forbidden - Access denied' })
  async findByDoctor(
    @Param('doctorId') doctorId: string,
    @Req() req: Request & { user?: { role?: string; linkedId?: string } },
  ) {
    const user = req.user;

    const visits = await this.visitsService.findByDoctor(
      doctorId,
      user?.role,
      user?.linkedId,
    );

    return {
      success: true,
      data: visits,
      message: 'Doctor visits retrieved successfully',
    };
  }

  @Get('appointment/:appointmentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.DOCTOR])
  @ApiOperation({
    summary: 'Get visit by appointment',
    description: 'Return the visit linked to a completed appointment (if any).',
  })
  @ApiParam({ name: 'appointmentId', description: 'Appointment ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Visit found', type: Visit })
  @ApiResponse({ status: 403, description: 'Forbidden - Access denied' })
  @ApiResponse({ status: 404, description: 'No visit for this appointment' })
  async findByAppointmentId(
    @Param('appointmentId') appointmentId: string,
    @Req() req: Request & { user?: { role?: string; linkedId?: string } },
  ) {
    const visit = await this.visitsService.findByAppointment(appointmentId);
    const user = req.user;

    if (user?.role === UserRole.DOCTOR && user.linkedId !== refToIdString(visit.doctorId)) {
      throw new ForbiddenException('Doctors can only access their own visits');
    }

    return {
      success: true,
      data: visit,
      message: 'Visit retrieved successfully',
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT])
  @ApiOperation({ summary: 'Get visit by ID', description: 'Fetch visit details by ID' })
  @ApiParam({ name: 'id', description: 'Visit ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Visit found', type: Visit })
  async findOne(@Param('id') id: string, @Req() req: Request & { user?: { role?: string; linkedId?: string } }) {
    const visit = await this.visitsService.findOne(id);
    const user = req.user;

    if (user?.role === UserRole.DOCTOR && user.linkedId !== refToIdString(visit.doctorId)) {
      throw new ForbiddenException('Doctors can only access their own visits');
    }
    if (user?.role === UserRole.PATIENT && user.linkedId !== refToIdString(visit.patientId)) {
      throw new ForbiddenException('Patients can only access their own visits');
    }

    return {
      success: true,
      data: visit,
      message: 'Visit retrieved successfully',
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.DOCTOR])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create visit', description: 'Create a new visit record' })
  @ApiBody({ type: CreateVisitDto })
  @ApiResponse({ status: 201, description: 'Visit created', type: Visit })
  async create(
    @Body() createVisitDto: CreateVisitDto,
    @Req() req: Request & { user?: { role?: string; linkedId?: string } },
  ) {
    const user = req.user;
    if (user?.linkedId !== createVisitDto.doctorId) {
      throw new ForbiddenException('You can only create visits for your own patients');
    }

    const visit = await this.visitsService.create(createVisitDto);
    return {
      success: true,
      data: visit,
      message: 'Visit created successfully',
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.DOCTOR])
  @ApiOperation({ summary: 'Update visit', description: 'Update visit details' })
  @ApiParam({ name: 'id', description: 'Visit ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateVisitDto })
  @ApiResponse({ status: 200, description: 'Visit updated', type: Visit })
  async update(
    @Param('id') id: string,
    @Body() updateVisitDto: UpdateVisitDto,
    @Req() req: Request & { user?: { role?: string; linkedId?: string } },
  ) {
    const visit = await this.visitsService.findOne(id);
    const user = req.user;

    if (user?.role === UserRole.DOCTOR && user.linkedId !== refToIdString(visit.doctorId)) {
      throw new ForbiddenException('Doctors can only update their own visits');
    }

    const updatedVisit = await this.visitsService.update(id, updateVisitDto);
    return {
      success: true,
      data: updatedVisit,
      message: 'Visit updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Delete visit', description: 'Delete a visit record' })
  @ApiParam({ name: 'id', description: 'Visit ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Visit deleted' })
  async remove(@Param('id') id: string) {
    const result = await this.visitsService.remove(id);
    return {
      success: true,
      data: result,
      message: 'Visit deleted successfully',
    };
  }
}
