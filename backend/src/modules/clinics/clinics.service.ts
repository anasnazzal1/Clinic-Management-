import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Clinic, ClinicDocument } from './entities/clinic.entity';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';

@Injectable()
export class ClinicsService {
  constructor(@InjectModel(Clinic.name) private clinicModel: Model<ClinicDocument>) {}

  async create(createClinicDto: CreateClinicDto): Promise<Clinic> {
    const existingClinic = await this.clinicModel.findOne({ name: createClinicDto.name });
    if (existingClinic) {
      throw new ConflictException('Clinic name already exists');
    }

    const createdClinic = new this.clinicModel(createClinicDto);
    return createdClinic.save();
  }

  async findAll(): Promise<Clinic[]> {
    return this.clinicModel.find().exec();
  }

  async findOne(id: string): Promise<Clinic> {
    const clinic = await this.clinicModel.findById(id).exec();
    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }
    return clinic;
  }

  async update(id: string, updateClinicDto: UpdateClinicDto): Promise<Clinic> {
    const clinic = await this.clinicModel.findByIdAndUpdate(id, updateClinicDto, {
      new: true,
      runValidators: true,
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    return clinic;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.clinicModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('Clinic not found');
    }

    return { message: 'Clinic deleted successfully' };
  }
}
