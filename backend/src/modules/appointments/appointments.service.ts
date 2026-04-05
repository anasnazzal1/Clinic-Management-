import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment, AppointmentDocument } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(@InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const appointment = new this.appointmentModel({
      patientId: new Types.ObjectId(createAppointmentDto.patientId),
      doctorId: new Types.ObjectId(createAppointmentDto.doctorId),
      clinicId: new Types.ObjectId(createAppointmentDto.clinicId),
      date: createAppointmentDto.date,
      time: createAppointmentDto.time,
      status: createAppointmentDto.status,
    });

    return appointment.save();
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentModel.find().exec();
  }

  async findByDoctor(doctorId: string): Promise<Appointment[]> {
    return this.appointmentModel.find({ doctorId: new Types.ObjectId(doctorId) }).exec();
  }

  async findByPatient(patientId: string): Promise<Appointment[]> {
    return this.appointmentModel.find({ patientId: new Types.ObjectId(patientId) }).exec();
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentModel.findById(id).exec();
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.appointmentModel.findByIdAndUpdate(
      id,
      {
        ...updateAppointmentDto,
        patientId: updateAppointmentDto.patientId ? new Types.ObjectId(updateAppointmentDto.patientId) : undefined,
        doctorId: updateAppointmentDto.doctorId ? new Types.ObjectId(updateAppointmentDto.doctorId) : undefined,
        clinicId: updateAppointmentDto.clinicId ? new Types.ObjectId(updateAppointmentDto.clinicId) : undefined,
      },
      { new: true, runValidators: true },
    );

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.appointmentModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Appointment not found');
    }
    return { message: 'Appointment deleted successfully' };
  }
}
