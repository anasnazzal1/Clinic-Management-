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
import { ReceptionistsService } from './receptionists.service';
import { CreateReceptionistDto } from './dto/create-receptionist.dto';
import { UpdateReceptionistDto } from './dto/update-receptionist.dto';
import { Receptionist } from './entities/receptionist.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';

@Controller('receptionists')
@ApiTags('Receptionists')
export class ReceptionistsController {
  constructor(private readonly receptionistsService: ReceptionistsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Get all receptionists', description: 'Fetch all receptionist records' })
  @ApiResponse({ status: 200, description: 'Receptionists list returned', type: [Receptionist] })
  async findAll() {
    const receptionists = await this.receptionistsService.findAll();
    return {
      success: true,
      data: receptionists,
      message: 'Receptionists retrieved successfully',
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.RECEPTIONIST])
  @ApiOperation({ summary: 'Get receptionist by ID', description: 'Fetch receptionist details by ID' })
  @ApiParam({ name: 'id', description: 'Receptionist ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Receptionist found', type: Receptionist })
  async findOne(
    @Param('id') id: string,
    @Req() req: Request & { user?: { role?: string; linkedId?: string } },
  ) {
    const user = req.user;
    if (user?.role === UserRole.RECEPTIONIST && user.linkedId !== id) {
      throw new ForbiddenException('Receptionists can only access their own record');
    }

    const receptionist = await this.receptionistsService.findOne(id);
    return {
      success: true,
      data: receptionist,
      message: 'Receptionist retrieved successfully',
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create receptionist', description: 'Create a receptionist record and linked user account' })
  @ApiBody({ type: CreateReceptionistDto })
  @ApiResponse({ status: 201, description: 'Receptionist created', type: Receptionist })
  async create(@Body() createReceptionistDto: CreateReceptionistDto) {
    const receptionist = await this.receptionistsService.create(createReceptionistDto);
    return {
      success: true,
      data: receptionist,
      message: 'Receptionist created successfully',
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.RECEPTIONIST])
  @ApiOperation({ summary: 'Update receptionist', description: 'Update receptionist details' })
  @ApiParam({ name: 'id', description: 'Receptionist ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateReceptionistDto })
  @ApiResponse({ status: 200, description: 'Receptionist updated', type: Receptionist })
  async update(
    @Param('id') id: string,
    @Body() updateReceptionistDto: UpdateReceptionistDto,
    @Req() req: Request & { user?: { role?: string; linkedId?: string } },
  ) {
    const user = req.user;
    if (user?.role === UserRole.RECEPTIONIST && user.linkedId !== id) {
      throw new ForbiddenException('Receptionists can only update their own record');
    }

    const receptionist = await this.receptionistsService.update(id, updateReceptionistDto);
    return {
      success: true,
      data: receptionist,
      message: 'Receptionist updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Delete receptionist', description: 'Delete a receptionist record' })
  @ApiParam({ name: 'id', description: 'Receptionist ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Receptionist deleted' })
  async remove(@Param('id') id: string) {
    const result = await this.receptionistsService.remove(id);
    return {
      success: true,
      data: result,
      message: 'Receptionist deleted successfully',
    };
  }
}
