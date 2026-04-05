import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Doctor, DoctorDocument } from './entities/doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    private usersService: UsersService,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const existingDoctor = await this.doctorModel.findOne({
      name: createDoctorDto.name,
      clinicId: createDoctorDto.clinicId,
    });

    if (existingDoctor) {
      throw new ConflictException('Doctor with the same name already exists in this clinic');
    }

    const createdDoctor = new this.doctorModel({
      name: createDoctorDto.name,
      specialization: createDoctorDto.specialization,
      clinicId: new Types.ObjectId(createDoctorDto.clinicId),
      workingDays: createDoctorDto.workingDays,
      workingHours: createDoctorDto.workingHours,
      phone: createDoctorDto.phone,
      email: createDoctorDto.email,
    });

    const savedDoctor = await createdDoctor.save();

    try {
      await this.usersService.createUserForRole({
        username: createDoctorDto.username,
        name: createDoctorDto.name,
        email: createDoctorDto.email,
        password: createDoctorDto.password,
        role: 'doctor',
        linkedId: savedDoctor._id.toString(),
      } as CreateUserDto & { linkedId?: string });
    } catch (error) {
      await this.doctorModel.findByIdAndDelete(savedDoctor._id);
      throw error;
    }

    return savedDoctor;
  }

  async findAll(): Promise<Doctor[]> {
    return this.doctorModel.find().exec();
  }

  async findOne(id: string): Promise<Doctor> {
    const doctor = await this.doctorModel.findById(id).exec();
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    return doctor;
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.doctorModel.findByIdAndUpdate(
      id,
      {
        ...updateDoctorDto,
        clinicId: updateDoctorDto.clinicId ? new Types.ObjectId(updateDoctorDto.clinicId) : undefined,
      },
      { new: true, runValidators: true },
    );

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.doctorModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('Doctor not found');
    }

    return { message: 'Doctor deleted successfully' };
  }
}
