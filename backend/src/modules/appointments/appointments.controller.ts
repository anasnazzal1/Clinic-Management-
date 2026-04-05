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
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';

@Controller('appointments')
@ApiTags('Appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR])
  @ApiOperation({ summary: 'Get all appointments', description: 'Fetch all appointments' })
  @ApiResponse({ status: 200, description: 'Appointments list returned', type: [Appointment] })
  async findAll() {
    const appointments = await this.appointmentsService.findAll();
    return {
      success: true,
      data: appointments,
      message: 'Appointments retrieved successfully',
    };
  }

  @Get('doctor/:doctorId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR])
  @ApiOperation({ summary: 'Get appointments by doctor', description: 'Fetch appointments for a specific doctor' })
  @ApiParam({ name: 'doctorId', description: 'Doctor ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Appointments list returned', type: [Appointment] })
  async findByDoctor(@Param('doctorId') doctorId: string, @Req() req: Request & { user?: { role?: string; linkedId?: string } }) {
    const user = req.user;
    if (user?.role === UserRole.DOCTOR && user.linkedId !== doctorId) {
      throw new ForbiddenException('Doctors can only access their own appointments');
    }
    const appointments = await this.appointmentsService.findByDoctor(doctorId);
    return {
      success: true,
      data: appointments,
      message: 'Doctor appointments retrieved successfully',
    };
  }

  @Get('patient/:patientId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.PATIENT])
  @ApiOperation({ summary: 'Get appointments by patient', description: 'Fetch appointments for a specific patient' })
  @ApiParam({ name: 'patientId', description: 'Patient ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Appointments list returned', type: [Appointment] })
  async findByPatient(@Param('patientId') patientId: string, @Req() req: Request & { user?: { role?: string; linkedId?: string } }) {
    const user = req.user;
    if (user?.role === UserRole.PATIENT && user.linkedId !== patientId) {
      throw new ForbiddenException('Patients can only access their own appointments');
    }
    const appointments = await this.appointmentsService.findByPatient(patientId);
    return {
      success: true,
      data: appointments,
      message: 'Patient appointments retrieved successfully',
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.PATIENT])
  @ApiOperation({ summary: 'Get appointment by ID', description: 'Fetch appointment details by ID' })
  @ApiParam({ name: 'id', description: 'Appointment ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Appointment found', type: Appointment })
  async findOne(@Param('id') id: string, @Req() req: Request & { user?: { role?: string; linkedId?: string } }) {
    const appointment = await this.appointmentsService.findOne(id);
    const user = req.user;
    if (user?.role === UserRole.DOCTOR && user.linkedId !== appointment.doctorId.toString()) {
      throw new ForbiddenException('Doctors can only access their own appointments');
    }
    if (user?.role === UserRole.PATIENT && user.linkedId !== appointment.patientId.toString()) {
      throw new ForbiddenException('Patients can only access their own appointments');
    }
    return {
      success: true,
      data: appointment,
      message: 'Appointment retrieved successfully',
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.PATIENT])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create appointment', description: 'Create a new appointment' })
  @ApiBody({ type: CreateAppointmentDto })
  @ApiResponse({ status: 201, description: 'Appointment created', type: Appointment })
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    const appointment = await this.appointmentsService.create(createAppointmentDto);
    return {
      success: true,
      data: appointment,
      message: 'Appointment created successfully',
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR])
  @ApiOperation({ summary: 'Update appointment', description: 'Update appointment details' })
  @ApiParam({ name: 'id', description: 'Appointment ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateAppointmentDto })
  @ApiResponse({ status: 200, description: 'Appointment updated', type: Appointment })
  async update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto, @Req() req: Request & { user?: { role?: string; linkedId?: string } }) {
    const appointment = await this.appointmentsService.findOne(id);
    const user = req.user;
    if (user?.role === UserRole.DOCTOR && user.linkedId !== appointment.doctorId.toString()) {
      throw new ForbiddenException('Doctors can only update their own appointments');
    }
    const updatedAppointment = await this.appointmentsService.update(id, updateAppointmentDto);
    return {
      success: true,
      data: updatedAppointment,
      message: 'Appointment updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.RECEPTIONIST])
  @ApiOperation({ summary: 'Delete appointment', description: 'Delete an appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Appointment deleted' })
  async remove(@Param('id') id: string) {
    const result = await this.appointmentsService.remove(id);
    return {
      success: true,
      data: result,
      message: 'Appointment deleted successfully',
    };
  }
}
