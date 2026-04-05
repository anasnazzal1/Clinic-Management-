import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Visit, VisitDocument } from './entities/visit.entity';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';

@Injectable()
export class VisitsService {
  constructor(@InjectModel(Visit.name) private visitModel: Model<VisitDocument>) {}

  async create(createVisitDto: CreateVisitDto): Promise<Visit> {
    const visit = new this.visitModel({
      patientId: new Types.ObjectId(createVisitDto.patientId),
      doctorId: new Types.ObjectId(createVisitDto.doctorId),
      date: createVisitDto.date,
      diagnosis: createVisitDto.diagnosis,
      notes: createVisitDto.notes,
    });

    return visit.save();
  }

  async findAll(): Promise<Visit[]> {
    return this.visitModel.find().exec();
  }

  async findOne(id: string): Promise<Visit> {
    const visit = await this.visitModel.findById(id).exec();
    if (!visit) {
      throw new NotFoundException('Visit not found');
    }
    return visit;
  }

  async update(id: string, updateVisitDto: UpdateVisitDto): Promise<Visit> {
    const visit = await this.visitModel.findByIdAndUpdate(
      id,
      {
        ...updateVisitDto,
        patientId: updateVisitDto.patientId ? new Types.ObjectId(updateVisitDto.patientId) : undefined,
        doctorId: updateVisitDto.doctorId ? new Types.ObjectId(updateVisitDto.doctorId) : undefined,
      },
      { new: true, runValidators: true },
    );

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    return visit;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.visitModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Visit not found');
    }

    return { message: 'Visit deleted successfully' };
  }
}
