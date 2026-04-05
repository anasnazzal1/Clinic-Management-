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

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT])
  @ApiOperation({ summary: 'Get visit by ID', description: 'Fetch visit details by ID' })
  @ApiParam({ name: 'id', description: 'Visit ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Visit found', type: Visit })
  async findOne(@Param('id') id: string, @Req() req: Request & { user?: { role?: string; linkedId?: string } }) {
    const visit = await this.visitsService.findOne(id);
    const user = req.user;

    if (user?.role === UserRole.DOCTOR && user.linkedId !== visit.doctorId.toString()) {
      throw new ForbiddenException('Doctors can only access their own visits');
    }
    if (user?.role === UserRole.PATIENT && user.linkedId !== visit.patientId.toString()) {
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
  async create(@Body() createVisitDto: CreateVisitDto) {
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

    if (user?.role === UserRole.DOCTOR && user.linkedId !== visit.doctorId.toString()) {
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
