import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Roles([UserRole.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new user',
    description:
      'Admin only endpoint to create a new user (doctor, receptionist, or admin). ' +
      'Password is set by admin. Non-patient users are auto-verified.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User creation details',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: UserDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only admin can create users',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createAdminUser(createUserDto);
    return {
      success: true,
      data: user,
      message: 'Admin user created successfully',
    };
  }

  @Get()
  @Roles([UserRole.ADMIN])
  @ApiOperation({
    summary: 'Get all users',
    description: 'Admin only endpoint to retrieve all users in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    isArray: true,
    type: UserDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only admin can view all users',
  })
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      success: true,
      data: users,
      message: 'Users retrieved successfully',
    };
  }

  @Get(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Admin only endpoint to retrieve a specific user by their ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'User MongoDB ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only admin can view users',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return {
      success: true,
      data: user,
      message: 'User retrieved successfully',
    };
  }

  @Get('email/:email')
  @Roles([UserRole.ADMIN])
  @ApiOperation({
    summary: 'Get user by email',
    description: 'Admin only endpoint to retrieve a user by their email address.',
  })
  @ApiParam({
    name: 'email',
    description: 'User email address',
    example: 'john@example.com',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only admin can view users',
  })
  @ApiResponse({
    status: 404,
    description: 'User with this email not found',
  })
  async findByEmail(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    return {
      success: true,
      data: user,
      message: 'User retrieved successfully',
    };
  }

  @Get('by-linked/:linkedId')
  @Roles([UserRole.ADMIN])
  @ApiOperation({
    summary: 'Get user by linked ID',
    description: 'Admin only endpoint to retrieve a user by their linked ID.',
  })
  @ApiParam({
    name: 'linkedId',
    description: 'User linked ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only admin can view users',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findByLinkedId(@Param('linkedId') linkedId: string) {
    const user = await this.usersService.findByLinkedId(linkedId);
    return {
      success: true,
      data: user,
      message: 'User retrieved successfully',
    };
  }

  @Put(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({
    summary: 'Update user',
    description: 'Admin only endpoint to update user details (name, email, phone).',
  })
  @ApiParam({
    name: 'id',
    description: 'User MongoDB ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User update details (any field is optional)',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only admin can update users',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    return {
      success: true,
      data: user,
      message: 'User updated successfully',
    };
  }

  @Delete(':id')
  @Roles([UserRole.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Admin only endpoint to permanently delete a user from the system.',
  })
  @ApiParam({
    name: 'id',
    description: 'User MongoDB ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only admin can delete users',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async delete(@Param('id') id: string) {
    const result = await this.usersService.delete(id);
    return {
      success: true,
      data: result,
      message: result.message,
    };
  }
}


