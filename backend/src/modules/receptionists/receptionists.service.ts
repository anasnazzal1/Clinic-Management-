import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Receptionist, ReceptionistDocument } from './entities/receptionist.entity';
import { CreateReceptionistDto } from './dto/create-receptionist.dto';
import { UpdateReceptionistDto } from './dto/update-receptionist.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserRole } from '../../common/constants/roles.constant';

@Injectable()
export class ReceptionistsService {
  constructor(
    @InjectModel(Receptionist.name) private receptionistModel: Model<ReceptionistDocument>,
    private usersService: UsersService,
  ) {}

  async create(createReceptionistDto: CreateReceptionistDto): Promise<Receptionist> {
    const existingReceptionist = await this.receptionistModel.findOne({
      email: createReceptionistDto.email.toLowerCase(),
    });

    if (existingReceptionist) {
      throw new ConflictException('Receptionist with this email already exists');
    }

    const receptionist = new this.receptionistModel({
      name: createReceptionistDto.name,
      phone: createReceptionistDto.phone,
      email: createReceptionistDto.email.toLowerCase(),
    });

    const savedReceptionist = await receptionist.save();

    try {
      await this.usersService.createUserForRole({
        username: createReceptionistDto.username,
        name: createReceptionistDto.name,
        email: createReceptionistDto.email,
        password: createReceptionistDto.password,
        role: UserRole.RECEPTIONIST,
        linkedId: savedReceptionist._id.toString(),
      } as CreateUserDto & { linkedId?: string });
    } catch (error) {
      await this.receptionistModel.findByIdAndDelete(savedReceptionist._id);
      throw error;
    }

    return savedReceptionist;
  }

  async findAll(): Promise<Receptionist[]> {
    return this.receptionistModel.find().exec();
  }

  async findOne(id: string): Promise<Receptionist> {
    const receptionist = await this.receptionistModel.findById(id).exec();
    if (!receptionist) {
      throw new NotFoundException('Receptionist not found');
    }
    return receptionist;
  }

  async update(id: string, updateReceptionistDto: UpdateReceptionistDto): Promise<Receptionist> {
    if (updateReceptionistDto.email) {
      const existingReceptionist = await this.receptionistModel.findOne({
        email: updateReceptionistDto.email.toLowerCase(),
        _id: { $ne: id },
      });

      if (existingReceptionist) {
        throw new ConflictException('Receptionist with this email already exists');
      }
    }

    const receptionist = await this.receptionistModel.findByIdAndUpdate(
      id,
      {
        ...updateReceptionistDto,
        email: updateReceptionistDto.email ? updateReceptionistDto.email.toLowerCase() : undefined,
      },
      { new: true, runValidators: true },
    );

    if (!receptionist) {
      throw new NotFoundException('Receptionist not found');
    }

    return receptionist;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.receptionistModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('Receptionist not found');
    }

    return { message: 'Receptionist deleted successfully' };
  }
}
