import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createAdminUser(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.role !== 'admin') {
      throw new BadRequestException('POST /users is only for admin account creation. Use dedicated endpoints for doctors, receptionists, and patients.');
    }

    return this.createUserForRole(createUserDto);
  }

  async createUserForRole(createUserDto: CreateUserDto & { linkedId?: string }): Promise<User> {
    // No role restriction here; used internally by module-specific endpoints

    // Check if email already exists
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email.toLowerCase(),
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const newUser = await this.userModel.create({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
      passwordHash,
    });

    return newUser;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-passwordHash');
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-passwordHash');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({
      email: email.toLowerCase(),
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByLinkedId(linkedId: string): Promise<User> {
    const user = await this.userModel.findOne({ linkedId }).select('-passwordHash');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Check if trying to update email to an existing one
    if (updateUserDto.email) {
      const existingUser = await this.userModel.findOne({
        email: updateUserDto.email.toLowerCase(),
        _id: { $ne: id },
      });

      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    const user = await this.userModel.findByIdAndUpdate(
      id,
      {
        ...updateUserDto,
        email: updateUserDto.email ? updateUserDto.email.toLowerCase() : undefined,
      },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async delete(id: string): Promise<{ message: string }> {
    const result = await this.userModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return this.userModel.find({ role }).select('-passwordHash');
  }
}


