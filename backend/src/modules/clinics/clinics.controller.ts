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
import { ClinicsService } from './clinics.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { Clinic } from './entities/clinic.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';

@Controller('clinics')
@ApiTags('Clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all clinics', description: 'Fetch all clinics' })
  @ApiResponse({ status: 200, description: 'Clinics list returned', type: [Clinic] })
  async findAll() {
    const clinics = await this.clinicsService.findAll();
    return {
      success: true,
      data: clinics,
      message: 'Clinics retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get clinic by ID', description: 'Fetch clinic details by ID' })
  @ApiParam({ name: 'id', description: 'Clinic ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Clinic found', type: Clinic })
  async findOne(@Param('id') id: string) {
    const clinic = await this.clinicsService.findOne(id);
    return {
      success: true,
      data: clinic,
      message: 'Clinic retrieved successfully',
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create clinic', description: 'Admin endpoint to create clinic' })
  @ApiBody({ type: CreateClinicDto })
  @ApiResponse({ status: 201, description: 'Clinic created', type: Clinic })
  async create(@Body() createClinicDto: CreateClinicDto) {
    const clinic = await this.clinicsService.create(createClinicDto);
    return {
      success: true,
      data: clinic,
      message: 'Clinic created successfully',
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Update clinic', description: 'Admin endpoint to update clinic' })
  @ApiParam({ name: 'id', description: 'Clinic ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateClinicDto })
  @ApiResponse({ status: 200, description: 'Clinic updated', type: Clinic })
  async update(@Param('id') id: string, @Body() updateClinicDto: UpdateClinicDto) {
    const clinic = await this.clinicsService.update(id, updateClinicDto);
    return {
      success: true,
      data: clinic,
      message: 'Clinic updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Delete clinic', description: 'Admin endpoint to delete clinic' })
  @ApiParam({ name: 'id', description: 'Clinic ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Clinic deleted' })
  async remove(@Param('id') id: string) {
    const result = await this.clinicsService.remove(id);
    return {
      success: true,
      data: result,
      message: 'Clinic deleted successfully',
    };
  }
}
